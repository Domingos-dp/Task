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
*   **[TailwindCSS](https://tailwindcss.com/)**: Para estilização rápida e responsiva.
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
├── tailwind.config.js          # Configuração do Tailwind
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

---
Desenvolvido como um projeto demonstrativo de estruturas de dados aplicadas ao frontend.
