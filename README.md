# 🕸️ Gerenciador de Tarefas com Grafo de Dependências

Este é um sistema de gerenciamento de projetos desenvolvido com **Nuxt 4** que utiliza uma estrutura de **grafo direcionado** para modelar e validar dependências entre tarefas. O sistema permite organizar tarefas por áreas, visualizar bloqueios em tempo real e garante a integridade lógica do fluxo de trabalho (prevenção de ciclos).

## ✨ Funcionalidades Principais

*   **Gerenciamento de Tarefas**: Criação e exclusão de tarefas.
*   **Agrupamento por Áreas**: Organização de tarefas em grupos lógicos (ex: *Frontend*, *Backend*, *Design*).
*   **Sistema de Dependências**: Vínculo entre tarefas onde uma tarefa só pode ser iniciada após a conclusão de seus pré-requisitos.
*   **Detecção de Ciclos**: Algoritmo inteligente que impede a criação de dependências circulares (ex: A depende de B, que depende de A), evitando loops infinitos lógicos.
*   **Visualização de Status**:
    *   🔒 **Bloqueado**: Tarefas cujos pré-requisitos não foram concluídos.
    *   ⏳ **Pendente**: Tarefas prontas para serem executadas.
    *   ✅ **Concluído**: Tarefas finalizadas.
*   **Persistência de Dados**: Salvamento automático no navegador usando `localStorage`.

## 🚀 Tecnologias Utilizadas

*   **[Nuxt 4](https://nuxt.com/)**: Framework Vue.js para aplicações modernas.
*   **[Vue 3](https://vuejs.org/)**: Com Composition API e TypeScript.
*   **[Bootstrap 5](https://getbootstrap.com/)**: Framework CSS para componentes responsivos e estilização consistente.
*   **TypeScript**: Para tipagem estática e segurança de código.

## 🛠️ Como Executar o Projeto

Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.

1.  **Instale as dependências**:
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```

3.  **Acesse a aplicação**:
    Abra seu navegador em `http://localhost:3000`.

## 📂 Estrutura do Projeto

O projeto segue a estrutura moderna do Nuxt 4, com os arquivos principais localizados na pasta `app/`.

```
Task/
├── app/
│   ├── app.vue                 # Componente principal da interface (UI)
│   └── composables/
│       └── useTasks.ts         # Lógica de negócios (Store, Grafo, DFS)
├── nuxt.config.ts              # Configuração do Nuxt
└── package.json                # Dependências do projeto
```

## 🧠 Detalhes Técnicos

### Estrutura de Dados
As tarefas são armazenadas como uma lista de objetos, onde cada objeto contém suas referências de dependência (lista de adjacência implícita).

```typescript
interface Task {
  id: string
  title: string
  area: string
  dependencies: string[] // IDs das tarefas pré-requisito
  status: 'pending' | 'completed'
}
```

### Algoritmo de Detecção de Ciclos
Para garantir que o grafo de dependências seja um **DAG (Directed Acyclic Graph)**, utilizamos um algoritmo de **Busca em Profundidade (DFS)** antes de adicionar qualquer nova dependência.

Se tentarmos adicionar uma dependência de `A` para `B` (`A -> B`), o algoritmo verifica se já existe um caminho existente de `B` para `A`. Se esse caminho existir, a nova dependência fecharia um ciclo, e a operação é bloqueada.

## ⏱️ Análise de Complexidade

Abaixo detalhamos a complexidade de tempo (Big O) das principais operações do grafo, onde **V** é o número de tarefas (vértices) e **E** é o número de dependências (arestas).

| Operação | Complexidade | Descrição |
| :--- | :--- | :--- |
| **Adicionar Tarefa** | **O(1)** | Inserção direta ao final do array de estado. |
| **Remover Tarefa** | **O(V + E)** | Requer percorrer o array para remover o item e percorrer todas as outras tarefas para limpar referências nas dependências. |
| **Verificar Ciclo (DFS)**| **O(V + E)** | No pior caso, a busca em profundidade percorre todo o grafo conexo para garantir que não existam caminhos circulares. |
| **Adicionar Dependência**| **O(V + E)** | Dominado pela verificação de ciclo (`hasCycle`) que é executada antes da inserção para garantir integridade. |
| **Verificar Bloqueio** | **O(D * V)** | Para cada uma das **D** dependências de uma tarefa, buscamos o status atual no array principal (O(V)). *Nota: Poderia ser otimizado para O(D) com um Map.* |

---
Desenvolvido como um projeto demonstrativo de estruturas de dados aplicadas ao frontend.

## 📎 Trechos de Código (com linhas) e Explicação

Abaixo estão os principais algoritmos com as linhas de código e links diretos para o arquivo de origem.

### Adicionar Tarefa — O(1)
[useTasks.ts:L58-66](file:///c:/Users/crist/Documents/trae_projects/Task/app/composables/useTasks.ts#L58-L66)

```ts
58→  const addTask = (title: string, area: string): void => {
59→    tasks.value.push({
60→      id: crypto.randomUUID(),
61→      title,
62→      area: area || 'Geral',
63→      dependencies: [],
64→      status: 'pending'
65→    })
66→  }
```
- Explicação: inserimos um novo objeto no fim do array; operação constante (não depende de V ou E).

### Remover Tarefa — O(V + E)
[useTasks.ts:L77-86](file:///c:/Users/crist/Documents/trae_projects/Task/app/composables/useTasks.ts#L77-L86)

```ts
77→  const removeTask = (id: string): void => {
78→    tasks.value = tasks.value.filter(t => t.id !== id)
79→    
80→    tasks.value.forEach(t => {
81→      t.dependencies = t.dependencies.filter(depId => depId !== id)
82→    })
83→  }
```
- Explicação: removemos do array principal (O(V)) e limpamos referências nas dependências (soma sobre todas as listas → O(E)).

### Verificar Ciclo (DFS) — O(V + E)
[useTasks.ts:L99-121](file:///c:/Users/crist/Documents/trae_projects/Task/app/composables/useTasks.ts#L99-L121)

```ts
99→  const hasCycle = (sourceId: string, targetId: string): boolean => {
100→    const visited = new Set<string>()
101→    const stack = [targetId]
102→    
103→    while (stack.length > 0) {
104→      const currentId = stack.pop()!
105→      
106→      if (currentId === sourceId) return true
107→      
108→      if (!visited.has(currentId)) {
109→        visited.add(currentId)
110→        const currentTask = tasks.value.find(t => t.id === currentId)
111→        if (currentTask) {
112→          stack.push(...currentTask.dependencies)
113→        }
114→      }
115→    }
116→    return false
117→  }
```
- Explicação: a busca em profundidade visita cada nó e aresta ao menos uma vez no pior caso.

### Adicionar Dependência — O(V + E)
[useTasks.ts:L129-146](file:///c:/Users/crist/Documents/trae_projects/Task/app/composables/useTasks.ts#L129-L146)

```ts
129→  const addDependency = (taskId: string, dependencyId: string): void => {
130→    if (taskId === dependencyId) return 
131→    const task = tasks.value.find(t => t.id === taskId)
132→    if (!task) return
133→
134→    if (task.dependencies.includes(dependencyId)) return 
135→    
136→    if (hasCycle(taskId, dependencyId)) {
137→      alert('Ciclo detectado! ...')
138→      return
139→    }
140→
141→    task.dependencies.push(dependencyId)
142→  }
```
- Explicação: dominado pela verificação de ciclo (DFS), que assegura que o grafo permaneça acíclico.

### Verificar Bloqueio — O(D * V)
[useTasks.ts:L184-190](file:///c:/Users/crist/Documents/trae_projects/Task/app/composables/useTasks.ts#L184-L190)

```ts
184→  const isTaskBlocked = (task: Task): boolean => {
185→      return task.dependencies.some(depId => {
186→          const dep = tasks.value.find(t => t.id === depId)
187→          return dep && dep.status !== 'completed'
188→      })
189→  }
```
- Explicação: para cada dependência (D), buscamos a tarefa correspondente com `find` (linear em V). Uma otimização seria manter um `Map<ID, Task>` para reduzir para O(D).

### Como foi feita a análise
- Identificamos laços e varreduras por coleções:
  - `push` no array é O(1).
  - `filter` e `find` são O(V) porque percorrem o array.
  - DFS visita vértices e arestas no pior caso → O(V + E).
- Somamos passos quando operações encadeiam varreduras em estruturas diferentes (ex.: remover e depois limpar dependências).
