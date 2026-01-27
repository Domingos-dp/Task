<script setup lang="ts">
const {
  tasks,
  addTask,
  removeTask,
  addDependency,
  removeDependency,
  toggleTaskStatus,
  isTaskBlocked,
  getAreas,
} = useTasks();

const newTaskTitle = ref("");
const newTaskArea = ref("Geral");

const selectedDependency = ref<Record<string, string>>({});

const sortedAreas = computed(() => getAreas());

const getTasksForArea = (area: string) => {
  return tasks.value.filter((t: any) => t.area === area);
};

const handleAddTask = () => {
  if (!newTaskTitle.value.trim()) return;
  addTask(newTaskTitle.value, newTaskArea.value);
  newTaskTitle.value = "";
};

const getAvailableDependencies = (taskId: string) => {
  return tasks.value.filter((t) => t.id !== taskId);
};
</script>

<template>
  <div class="min-vh-100 bg-white p-4">
    <div class="container" style="max-width: 1400px">
      <header class="border-bottom pb-4 mb-4">
        <div class="row align-items-center">
          <div class="col">
            <h1
              class="h4 fw-bold text-dark mb-1"
              style="letter-spacing: -0.5px"
            >
              Sistema de Gerenciamento de Dependências
            </h1>
            <p class="text-secondary mb-0" style="font-size: 0.875rem">
              Controle de fluxo de trabalho e dependências entre tarefas
            </p>
          </div>
          <div class="col-auto">
            <div class="text-end">
              <div class="small text-secondary mb-1">Total de Tarefas</div>
              <div class="h3 fw-bold text-dark mb-0">{{ tasks.length }}</div>
            </div>
          </div>
        </div>
      </header>

      <section class="bg-light border rounded mb-4 p-4">
        <div class="row g-3 align-items-end">
          <div class="col-12 col-md-3">
            <label
              class="form-label text-secondary fw-medium mb-2"
              style="font-size: 0.8125rem"
            >
              CATEGORIA
            </label>
            <input
              v-model="newTaskArea"
              list="areas-list"
              type="text"
              placeholder="Ex: Desenvolvimento"
              class="form-control border"
              style="font-size: 0.9375rem"
            />
            <datalist id="areas-list">
              <option
                v-for="area in sortedAreas"
                :key="area"
                :value="area"
              ></option>
            </datalist>
          </div>

          <div class="col-12 col-md">
            <label
              class="form-label text-secondary fw-medium mb-2"
              style="font-size: 0.8125rem"
            >
              DESCRIÇÃO DA TAREFA
            </label>
            <input
              v-model="newTaskTitle"
              @keyup.enter="handleAddTask"
              type="text"
              placeholder="Insira a descrição da tarefa"
              class="form-control border"
              style="font-size: 0.9375rem"
            />
          </div>

          <div class="col-12 col-md-auto">
            <button
              @click="handleAddTask"
              class="btn btn-dark w-100 fw-medium"
              style="min-width: 160px; font-size: 0.9375rem"
            >
              Adicionar Tarefa
            </button>
          </div>
        </div>
      </section>

      <section>
        <div v-for="area in sortedAreas" :key="area" class="mb-5">
          <div
            class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom"
          >
            <h2
              class="h5 fw-bold text-dark mb-0"
              style="letter-spacing: -0.25px"
            >
              {{ area }}
            </h2>
            <span class="text-secondary" style="font-size: 0.875rem">
              {{ getTasksForArea(area).length }}
              {{ getTasksForArea(area).length === 1 ? "tarefa" : "tarefas" }}
            </span>
          </div>

          <transition-group
            name="list"
            tag="div"
            class="d-flex flex-column gap-3"
          >
            <div
              v-for="task in getTasksForArea(area)"
              :key="task.id"
              class="border rounded transition-all"
              :style="{
                borderLeftWidth: '4px',
                borderLeftColor: isTaskBlocked(task)
                  ? '#dc3545'
                  : task.status === 'completed'
                  ? '#198754'
                  : '#6c757d',
              }"
            >
              <div class="p-4">
                <div
                  class="d-flex align-items-start justify-content-between gap-3 mb-3"
                >
                  <div class="d-flex align-items-start gap-3 flex-grow-1">
                    <div class="form-check mt-1">
                      <input
                        type="checkbox"
                        :checked="task.status === 'completed'"
                        @change="toggleTaskStatus(task.id)"
                        :disabled="isTaskBlocked(task)"
                        class="form-check-input border-secondary"
                        style="
                          width: 1.125rem;
                          height: 1.125rem;
                          cursor: pointer;
                        "
                      />
                    </div>

                    <div class="flex-grow-1">
                      <div
                        class="fw-medium mb-2 transition-all"
                        :class="{
                          'text-decoration-line-through text-secondary':
                            task.status === 'completed',
                          'text-dark': task.status !== 'completed',
                        }"
                        style="font-size: 1rem; line-height: 1.5"
                      >
                        {{ task.title }}
                      </div>

                      <div class="d-flex gap-2">
                        <span
                          v-if="isTaskBlocked(task)"
                          class="badge bg-danger text-white"
                          style="
                            font-size: 0.6875rem;
                            font-weight: 600;
                            padding: 0.375rem 0.75rem;
                          "
                        >
                          BLOQUEADA
                        </span>
                        <span
                          v-else-if="task.status === 'completed'"
                          class="badge bg-success text-white"
                          style="
                            font-size: 0.6875rem;
                            font-weight: 600;
                            padding: 0.375rem 0.75rem;
                          "
                        >
                          CONCLUÍDA
                        </span>
                        <span
                          v-else
                          class="badge bg-secondary text-white"
                          style="
                            font-size: 0.6875rem;
                            font-weight: 600;
                            padding: 0.375rem 0.75rem;
                          "
                        >
                          EM PROGRESSO
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    @click="removeTask(task.id)"
                    class="btn btn-link text-secondary p-0 border-0"
                    title="Remover tarefa"
                    style="text-decoration: none; opacity: 0.7"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path
                        d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      ></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </button>
                </div>

                <div class="pt-3 mt-3 border-top">
                  <div class="row g-4">
                    <div class="col-12 col-lg-7">
                      <div class="mb-2">
                        <label
                          class="text-secondary fw-medium"
                          style="font-size: 0.75rem; letter-spacing: 0.5px"
                        >
                          DEPENDÊNCIAS
                        </label>
                      </div>

                      <div class="d-flex flex-wrap gap-2">
                        <span
                          v-if="task.dependencies.length === 0"
                          class="text-muted"
                          style="font-size: 0.875rem"
                        >
                          Nenhuma dependência configurada
                        </span>

                        <div
                          v-for="depId in task.dependencies"
                          :key="depId"
                          class="d-inline-flex align-items-center gap-2 border rounded px-3 py-2"
                          :class="
                            tasks.find((t) => t.id === depId)?.status ===
                            'completed'
                              ? 'bg-success bg-opacity-10 border-success text-success'
                              : 'bg-warning bg-opacity-10 border-warning text-dark'
                          "
                          style="font-size: 0.875rem"
                        >
                          <span class="text-truncate" style="max-width: 200px">
                            {{
                              tasks.find((t) => t.id === depId)?.title ||
                              "Tarefa Removida"
                            }}
                          </span>
                          <button
                            @click="removeDependency(task.id, depId)"
                            class="btn btn-link p-0 border-0 text-reset"
                            style="
                              text-decoration: none;
                              opacity: 0.6;
                              line-height: 1;
                            "
                            title="Remover dependência"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-lg-5">
                      <div class="mb-2">
                        <label
                          class="text-secondary fw-medium"
                          style="font-size: 0.75rem; letter-spacing: 0.5px"
                        >
                          ADICIONAR DEPENDÊNCIA
                        </label>
                      </div>
                      <div class="input-group">
                        <select
                          v-model="selectedDependency[task.id]"
                          class="form-select border"
                          style="font-size: 0.875rem"
                        >
                          <option :value="undefined" disabled selected>
                            Selecionar tarefa
                          </option>
                          <option
                            v-for="candidate in getAvailableDependencies(
                              task.id
                            )"
                            :key="candidate.id"
                            :value="candidate.id"
                            :disabled="task.dependencies.includes(candidate.id)"
                          >
                            {{ candidate.title }}
                          </option>
                        </select>

                        <button
                          @click="() => { 
                            if(selectedDependency[task.id]) {
                              addDependency(task.id, selectedDependency[task.id]!);
                              selectedDependency[task.id] = '';  
                            }
                          }"
                          class="btn btn-outline-dark"
                          :disabled="!selectedDependency[task.id]"
                          title="Vincular dependência"
                          style="font-size: 0.875rem"
                        >
                          Vincular
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

      <div
        v-if="tasks.length === 0"
        class="text-center border rounded p-5 bg-light"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="text-secondary opacity-50 mb-3"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <h3 class="h6 fw-medium text-dark mb-2">Nenhuma tarefa cadastrada</h3>
        <p class="text-secondary mb-0" style="font-size: 0.875rem">
          Utilize o formulário acima para adicionar sua primeira tarefa ao
          sistema
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
  z-index: 0;
}

.btn:hover {
  opacity: 0.9;
}
</style>