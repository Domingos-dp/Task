/**
 * Representa uma tarefa no sistema.
 */
export interface Task {
  /** Identificador único da tarefa (UUID). */
  id: string
  /** Título ou descrição da tarefa. */
  title: string
  /** Área ou grupo ao qual a tarefa pertence (ex: "Frontend", "Backend", "Design"). */
  area: string
  /** Lista de IDs de tarefas das quais esta tarefa depende. */
  dependencies: string[]
  /** Estado atual da tarefa. */
  status: 'pending' | 'completed'
}

/**
 * Composable para gerenciar o estado das tarefas e suas dependências.
 * Implementa um grafo direcionado onde as tarefas são nós e as dependências são arestas.
 * Inclui persistência no LocalStorage e detecção de ciclos.
 */
export const useTasks = () => {
  // Estado reativo das tarefas, inicializado vazio.
  const tasks = useState<Task[]>('tasks', () => [])

  /**
   * Carrega as tarefas salvas do LocalStorage quando o componente é montado.
   * Executa apenas no lado do cliente.
   */
  onMounted(() => {
    if (import.meta.client) {
      const saved = localStorage.getItem('tasks-graph')
      if (saved) {
        try {
          tasks.value = JSON.parse(saved)
        } catch (e) {
          console.error('Erro ao carregar tarefas do LocalStorage:', e)
        }
      }
    }
  })

  /**
   * Observa mudanças no array de tarefas e salva automaticamente no LocalStorage.
   * A opção { deep: true } garante que mudanças internas nas tarefas (ex: status) sejam detectadas.
   */
  watch(tasks, (newTasks) => {
    if (import.meta.client) {
      localStorage.setItem('tasks-graph', JSON.stringify(newTasks))
    }
  }, { deep: true })

  /**
   * Adiciona uma nova tarefa ao grafo.
   * @param title O título da nova tarefa.
   * @param area A área/grupo da tarefa.
   */
  const addTask = (title: string, area: string): void => {
    tasks.value.push({
      id: crypto.randomUUID(),
      title,
      area: area || 'Geral', // Default para 'Geral' se não especificado
      dependencies: [],
      status: 'pending'
    })
  }

  /**
   * Remove uma tarefa e limpa referências a ela em outras tarefas.
   * @param id O ID da tarefa a ser removida.
   */
  const removeTask = (id: string): void => {
    // Remove a tarefa da lista principal
    tasks.value = tasks.value.filter(t => t.id !== id)
    
    // Percorre todas as outras tarefas para remover a tarefa excluída de suas listas de dependências
    // Isso garante a integridade referencial do grafo
    tasks.value.forEach(t => {
      t.dependencies = t.dependencies.filter(depId => depId !== id)
    })
  }

  /**
   * Verifica se a adição de uma dependência criaria um ciclo no grafo.
   * Utiliza uma busca em profundidade (DFS) para detectar ciclos.
   * 
   * Se queremos fazer A depender de B (A -> B), precisamos verificar se já existe
   * um caminho de B até A (B -> ... -> A). Se existir, adicionar A -> B fecharia o ciclo.
   * 
   * @param sourceId O ID da tarefa que terá a dependência (A).
   * @param targetId O ID da tarefa que será a dependência (B).
   * @returns true se um ciclo for detectado, false caso contrário.
   */
  const hasCycle = (sourceId: string, targetId: string): boolean => {
    // Conjunto para rastrear nós visitados e evitar loops infinitos na busca
    const visited = new Set<string>()
    // Pilha para o algoritmo DFS, começando pelo alvo (B)
    const stack = [targetId]
    
    while (stack.length > 0) {
      const currentId = stack.pop()!
      
      // Se chegamos de volta à tarefa original (A), encontramos um ciclo!
      if (currentId === sourceId) return true
      
      if (!visited.has(currentId)) {
        visited.add(currentId)
        const currentTask = tasks.value.find(t => t.id === currentId)
        
        // Adiciona todas as dependências da tarefa atual à pilha para continuar a busca
        if (currentTask) {
          stack.push(...currentTask.dependencies)
        }
      }
    }
    return false
  }

  /**
   * Adiciona uma dependência entre duas tarefas.
   * @param taskId O ID da tarefa dependente (que precisa esperar).
   * @param dependencyId O ID da tarefa requisito (que precisa ser feita antes).
   */
  const addDependency = (taskId: string, dependencyId: string): void => {
    // Regra 1: Uma tarefa não pode depender de si mesma
    if (taskId === dependencyId) return 
    
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    // Regra 2: Evitar duplicatas
    if (task.dependencies.includes(dependencyId)) return 
    
    // Regra 3: Prevenir ciclos no grafo
    if (hasCycle(taskId, dependencyId)) {
      alert('Ciclo detectado! Não é possível adicionar essa dependência pois criaria um loop infinito.')
      return
    }

    task.dependencies.push(dependencyId)
  }

  /**
   * Remove uma dependência específica de uma tarefa.
   * @param taskId O ID da tarefa que possui a dependência.
   * @param dependencyId O ID da dependência a ser removida.
   */
  const removeDependency = (taskId: string, dependencyId: string): void => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.dependencies = task.dependencies.filter(d => d !== dependencyId)
    }
  }

  /**
   * Alterna o status de uma tarefa entre 'pending' e 'completed'.
   * @param id O ID da tarefa.
   */
  const toggleTaskStatus = (id: string): void => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed'
    }
  }
  
  /**
   * Determina se uma tarefa está bloqueada.
   * Uma tarefa é considerada bloqueada se pelo menos uma de suas dependências
   * ainda não estiver com status 'completed'.
   * 
   * @param task A tarefa a ser verificada.
   * @returns true se bloqueada, false caso contrário.
   */
  const isTaskBlocked = (task: Task): boolean => {
      return task.dependencies.some(depId => {
          const dep = tasks.value.find(t => t.id === depId)
          // Se a dependência não existe (foi deletada?) ou não está completa, bloqueia
          return dep && dep.status !== 'completed'
      })
  }

  // Helper para obter todas as áreas únicas
  const getAreas = () => {
    const areas = new Set(tasks.value.map(t => t.area))
    if (areas.size === 0) return ['Geral']
    return Array.from(areas).sort()
  }

  return {
    tasks,
    addTask,
    removeTask,
    addDependency,
    removeDependency,
    toggleTaskStatus,
    isTaskBlocked,
    getAreas
  }
}
