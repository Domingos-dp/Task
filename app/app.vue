<script setup lang="ts">
/**
 * Componente principal da aplicação de Grafo de Dependências.
 * Gerencia a interface do usuário e interage com o composable useTasks.
 */

// Importa as funções e estado do nosso composable de gerenciamento de tarefas
const { 
  tasks, 
  addTask, 
  removeTask, 
  addDependency, 
  removeDependency, 
  toggleTaskStatus, 
  isTaskBlocked,
  getAreas 
} = useTasks()

// Estado local para o formulário de nova tarefa
const newTaskTitle = ref('')
const newTaskArea = ref('Geral')

// Estado local para armazenar a seleção temporária de dependência para cada tarefa
// Mapeia taskId -> dependencyId selecionado no dropdown
const selectedDependency = ref<Record<string, string>>({}) 

// Computados para organização
const sortedAreas = computed(() => getAreas())

const getTasksForArea = (area: string) => {
  return tasks.value.filter(t => t.area === area)
}

/**
 * Manipula a adição de uma nova tarefa.
 * Valida se o título não está vazio antes de chamar a store.
 */
const handleAddTask = () => {
  if (!newTaskTitle.value.trim()) return
  addTask(newTaskTitle.value, newTaskArea.value)
  newTaskTitle.value = '' // Limpa o input após adicionar
  // Mantém a área selecionada para facilitar adição em lote na mesma área
}

/**
 * Filtra as tarefas disponíveis para serem adicionadas como dependência.
 * Remove a própria tarefa da lista para evitar auto-dependência imediata.
 * (A verificação de ciclos profundos é feita no useTasks ao tentar adicionar)
 * 
 * @param taskId O ID da tarefa para a qual estamos escolhendo uma dependência
 */
const getAvailableDependencies = (taskId: string) => {
  return tasks.value.filter(t => t.id !== taskId) 
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans text-gray-800">
    <div class="max-w-4xl mx-auto">
      
      <!-- Cabeçalho -->
      <header class="mb-10 text-center sm:text-left">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-gray-900 flex items-center justify-center sm:justify-start gap-3">
          <span class="text-4xl">🕸️</span> 
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Grafo de Tarefas
          </span>
        </h1>
        <p class="mt-2 text-gray-500 text-lg">Gerencie dependências complexas entre suas atividades.</p>
      </header>
      
      <!-- Seção de Adicionar Tarefa -->
      <section class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 transition-shadow hover:shadow-md">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- Input de Área -->
          <div class="w-full md:w-1/4 relative">
            <input 
              v-model="newTaskArea"
              list="areas-list"
              type="text" 
              placeholder="Área (ex: Geral)" 
              class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
            />
            <datalist id="areas-list">
              <option v-for="area in sortedAreas" :key="area" :value="area"></option>
            </datalist>
          </div>

          <!-- Input de Título -->
          <input 
            v-model="newTaskTitle"
            @keyup.enter="handleAddTask"
            type="text" 
            placeholder="O que precisa ser feito?" 
            class="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          
          <button 
            @click="handleAddTask"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold shadow-sm flex items-center justify-center gap-2"
          >
            <span>+</span> Adicionar
          </button>
        </div>
      </section>

      <!-- Lista de Tarefas -->
      <section class="space-y-12">
        <div v-for="area in sortedAreas" :key="area" class="space-y-4">
          <!-- Cabeçalho da Área -->
          <h2 class="text-xl font-bold text-gray-700 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">#</span>
            {{ area }}
            <span class="text-xs font-normal text-gray-400 ml-auto">{{ getTasksForArea(area).length }} tarefas</span>
          </h2>

          <!-- Loop principal de renderização das tarefas -->
          <transition-group name="list" tag="div" class="space-y-6">
            <div 
              v-for="task in getTasksForArea(area)" 
              :key="task.id" 
              class="bg-white rounded-xl shadow-sm border-l-[6px] transition-all duration-300 hover:shadow-md group"
              :class="[
                isTaskBlocked(task) 
                  ? 'border-red-500 bg-red-50/30' // Estilo Bloqueado
                  : (task.status === 'completed' 
                      ? 'border-green-500 opacity-75 grayscale-[0.5]' // Estilo Concluído
                      : 'border-blue-500') // Estilo Pendente
              ]"
            >
              
              <div class="p-6">
                <!-- Cabeçalho do Card da Tarefa -->
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="flex items-center gap-4 flex-1">
                    <!-- Checkbox Customizado -->
                    <div class="relative flex items-center">
                      <input 
                        type="checkbox" 
                        :checked="task.status === 'completed'"
                        @change="toggleTaskStatus(task.id)"
                        :disabled="isTaskBlocked(task)"
                        class="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-transform active:scale-95"
                      />
                    </div>
                    
                    <div class="flex flex-col">
                      <span 
                        class="text-lg font-semibold transition-all"
                        :class="{'line-through text-gray-400': task.status === 'completed', 'text-gray-700': task.status !== 'completed'}"
                      >
                        {{ task.title }}
                      </span>
                      
                      <!-- Badges de Status -->
                      <div class="flex gap-2 mt-1">
                        <span v-if="isTaskBlocked(task)" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          🔒 Bloqueado por dependências
                        </span>
                        <span v-else-if="task.status === 'completed'" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          ✅ Concluído
                        </span>
                        <span v-else class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          ⏳ Pendente
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Botão Excluir -->
                  <button 
                    @click="removeTask(task.id)" 
                    class="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100" 
                    title="Excluir Tarefa"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>

                <!-- Seção de Dependências -->
                <div class="mt-6 pt-4 border-t border-gray-100">
                  <div class="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    
                    <!-- Lista de Dependências Atuais -->
                    <div class="flex-1">
                      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" />
                        </svg>
                        Pré-requisitos (Depende de)
                      </h3>
                      
                      <div class="flex flex-wrap gap-2">
                        <span v-if="task.dependencies.length === 0" class="text-sm text-gray-400 italic py-1">
                          Esta tarefa não tem dependências.
                        </span>
                        
                        <div 
                          v-for="depId in task.dependencies" 
                          :key="depId" 
                          class="pl-3 pr-2 py-1.5 rounded-full text-sm flex items-center gap-2 border transition-colors shadow-sm"
                          :class="tasks.find(t => t.id === depId)?.status === 'completed' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'"
                        >
                          <span class="font-medium truncate max-w-[150px]">
                            {{ tasks.find(t => t.id === depId)?.title || 'Tarefa Removida' }}
                          </span>
                          <button 
                            @click="removeDependency(task.id, depId)" 
                            class="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                            title="Remover dependência"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <!-- Controle para Adicionar Dependência -->
                    <div class="w-full md:w-auto md:min-w-[250px]">
                      <div class="flex gap-2">
                        <div class="relative flex-1">
                          <select 
                            v-model="selectedDependency[task.id]" 
                            class="w-full appearance-none border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition-shadow cursor-pointer"
                          >
                            <option :value="undefined" disabled selected>Vincular dependência...</option>
                            <option 
                              v-for="candidate in getAvailableDependencies(task.id)" 
                              :key="candidate.id" 
                              :value="candidate.id"
                              :disabled="task.dependencies.includes(candidate.id)"
                            >
                              {{ candidate.title }} {{ task.dependencies.includes(candidate.id) ? '(Já vinculada)' : '' }}
                            </option>
                          </select>
                          <!-- Ícone do Select -->
                          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        
                        <button 
                          @click="() => { 
                            if(selectedDependency[task.id]) {
                              addDependency(task.id, selectedDependency[task.id]!);
                              selectedDependency[task.id] = ''; // Reset após adicionar
                            }
                          }"
                          class="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
                          :disabled="!selectedDependency[task.id]"
                          title="Adicionar Vínculo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </section>
      
      <!-- Estado Vazio -->
      <div v-if="tasks.length === 0" class="text-center text-gray-400 mt-12 py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
        <div class="text-6xl mb-4 opacity-50">📝</div>
        <h3 class="text-xl font-medium text-gray-600">Nenhuma tarefa encontrada</h3>
        <p class="mt-2 text-gray-500 max-w-sm mx-auto">Comece adicionando tarefas acima e depois vincule dependências entre elas.</p>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Animações para a lista */
.list-move, /* aplica transição aos elementos que se movem */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* Garante que o item sendo removido não ocupe espaço durante a animação */
.list-leave-active {
  position: absolute;
  width: 100%; /* Pode precisar de ajuste dependendo do layout */
  z-index: 0; 
}
</style>
