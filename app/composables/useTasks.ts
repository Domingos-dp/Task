export interface Task {
  id: string
  title: string
  area: string
  dependencies: string[]
  status: 'pending' | 'completed'
}


export const useTasks = () => {
  const tasks = useState<Task[]>('tasks', () => [])

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



  watch(tasks, (newTasks) => {
    if (import.meta.client) {
      localStorage.setItem('tasks-graph', JSON.stringify(newTasks))
    }
  }, { deep: true })



  const addTask = (title: string, area: string): void => {
    tasks.value.push({
      id: crypto.randomUUID(),
      title,
      area: area || 'Geral', 
      dependencies: [],
      status: 'pending'
    })
  }



  const removeTask = (id: string): void => {
    tasks.value = tasks.value.filter(t => t.id !== id)
    
    tasks.value.forEach(t => {
      t.dependencies = t.dependencies.filter(depId => depId !== id)
    })
  }



  const hasCycle = (sourceId: string, targetId: string): boolean => {
    const visited = new Set<string>()
    const stack = [targetId]
    
    while (stack.length > 0) {
      const currentId = stack.pop()!
      
      if (currentId === sourceId) return true
      
      if (!visited.has(currentId)) {
        visited.add(currentId)
        const currentTask = tasks.value.find(t => t.id === currentId)
        
        if (currentTask) {
          stack.push(...currentTask.dependencies)
        }
      }
    }
    return false
  }



  const addDependency = (taskId: string, dependencyId: string): void => {
    if (taskId === dependencyId) return 
    
    const task = tasks.value.find(t => t.id === taskId)
    if (!task) return

    if (task.dependencies.includes(dependencyId)) return 
    
    if (hasCycle(taskId, dependencyId)) {
      alert('Ciclo detectado! Não é possível adicionar essa dependência pois criaria um loop infinito.')
      return
    }

    task.dependencies.push(dependencyId)
  }




  const removeDependency = (taskId: string, dependencyId: string): void => {
    const task = tasks.value.find(t => t.id === taskId)
    if (task) {
      task.dependencies = task.dependencies.filter(d => d !== dependencyId)
    }
  }




  const toggleTaskStatus = (id: string): void => {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.status = task.status === 'completed' ? 'pending' : 'completed'
                     
    }
  }


  
  const isTaskBlocked = (task: Task): boolean => {
      return task.dependencies.some(depId => {
          const dep = tasks.value.find(t => t.id === depId)
          return dep && dep.status !== 'completed'
      })
  }

  

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
