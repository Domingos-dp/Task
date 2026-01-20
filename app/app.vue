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
  <div class="min-vh-100 bg-light p-3 p-sm-5 text-dark">
    <div class="container" style="max-width: 900px">
      <header class="mb-5 text-center text-sm-start">
        <h1
          class="display-4 fw-bold text-dark d-flex align-items-center justify-content-center justify-content-sm-start gap-2"
        >
          <span>🕸️</span>
          <span class="text-primary bg-gradient"> Grafo de Tarefas </span>
        </h1>
        <p class="mt-2 text-muted lead">
          Gerencie dependências complexas entre suas atividades.
        </p>
      </header>

      <section class="card shadow-sm border-0 mb-5">
        <div class="card-body p-4">
          <div class="row g-3">
            <div class="col-12 col-md-3 position-relative">
              <input
                v-model="newTaskArea"
                list="areas-list"
                type="text"
                placeholder="Área (ex: Geral)"
                class="form-control form-control-lg"
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
              <input
                v-model="newTaskTitle"
                @keyup.enter="handleAddTask"
                type="text"
                placeholder="O que precisa ser feito?"
                class="form-control form-control-lg"
              />
            </div>

            <div class="col-12 col-md-auto">
              <button
                @click="handleAddTask"
                class="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 fw-semibold"
              >
                <span>+</span> Adicionar
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div v-for="area in sortedAreas" :key="area" class="mb-5">
          <h2
            class="h4 fw-bold text-secondary border-bottom pb-2 mb-4 d-flex align-items-center gap-2"
          >
            <span
              class="badge bg-light text-primary border border-primary-subtle rounded-pill"
              >#</span
            >
            {{ area }}
            <span class="small fw-normal text-muted ms-auto"
              >{{ getTasksForArea(area).length }} tarefas</span
            >
          </h2>

          <transition-group
            name="list"
            tag="div"
            class="d-flex flex-column gap-3"
          >
            <div
              v-for="task in getTasksForArea(area)"
              :key="task.id"
              class="card border-0 shadow-sm transition-all"
              :class="[
                isTaskBlocked(task)
                  ? 'border-start border-5 border-danger bg-danger bg-opacity-10'
                  : task.status === 'completed'
                  ? 'border-start border-5 border-success opacity-75'
                  : 'border-start border-5 border-primary',
              ]"
            >
              <div class="card-body p-4">
                <div
                  class="d-flex align-items-start justify-content-between gap-3 mb-3"
                >
                  <div class="d-flex align-items-center gap-3 flex-grow-1">
                    <div class="form-check">
                      <input
                        type="checkbox"
                        :checked="task.status === 'completed'"
                        @change="toggleTaskStatus(task.id)"
                        :disabled="isTaskBlocked(task)"
                        class="form-check-input fs-4"
                        style="cursor: pointer"
                      />
                    </div>

                    <div class="d-flex flex-column">
                      <span
                        class="fs-5 fw-semibold transition-all"
                        :class="{
                          'text-decoration-line-through text-muted':
                            task.status === 'completed',
                          'text-dark': task.status !== 'completed',
                        }"
                      >
                        {{ task.title }}
                      </span>

                      <div class="d-flex gap-2 mt-1">
                        <span
                          v-if="isTaskBlocked(task)"
                          class="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle"
                        >
                          🔒 Bloqueado por dependências
                        </span>
                        <span
                          v-else-if="task.status === 'completed'"
                          class="badge bg-success bg-opacity-10 text-success border border-success-subtle"
                        >
                          ✅ Concluído
                        </span>
                        <span
                          v-else
                          class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle"
                        >
                          ⏳ Pendente
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    @click="removeTask(task.id)"
                    class="btn btn-outline-danger border-0 p-2 rounded-circle"
                    title="Excluir Tarefa"
                    style="text-decoration: none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <div class="mt-4 pt-3 border-top">
                  <div class="row g-3 align-items-start">
                    <div class="col-12 col-md">
                      <h3
                        class="h6 fw-bold text-muted text-uppercase mb-2 d-flex align-items-center gap-1"
                        style="font-size: 0.75rem; letter-spacing: 0.05em"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                            clip-rule="evenodd"
                          />
                        </svg>
                        Pré-requisitos (Depende de)
                      </h3>

                      <div class="d-flex flex-wrap gap-2">
                        <span
                          v-if="task.dependencies.length === 0"
                          class="small text-muted fst-italic py-1"
                        >
                          Esta tarefa não tem dependências.
                        </span>

                        <div
                          v-for="depId in task.dependencies"
                          :key="depId"
                          class="badge rounded-pill d-flex align-items-center gap-2 border fw-normal text-dark px-3 py-2"
                          :class="
                            tasks.find((t) => t.id === depId)?.status ===
                            'completed'
                              ? 'bg-success bg-opacity-10 border-success-subtle text-success-emphasis'
                              : 'bg-warning bg-opacity-10 border-warning-subtle text-warning-emphasis'
                          "
                        >
                          <span class="text-truncate" style="max-width: 150px">
                            {{
                              tasks.find((t) => t.id === depId)?.title ||
                              "Tarefa Removida"
                            }}
                          </span>
                          <button
                            @click="removeDependency(task.id, depId)"
                            class="btn-close btn-close-dark"
                            style="width: 0.5em; height: 0.5em"
                            title="Remover dependência"
                          ></button>
                        </div>
                      </div>
                    </div>

                    <div class="col-12 col-md-auto" style="min-width: 250px">
                      <div class="input-group">
                        <select
                          v-model="selectedDependency[task.id]"
                          class="form-select form-select-sm"
                        >
                          <option :value="undefined" disabled selected>
                            Vincular dependência...
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
                            {{
                              task.dependencies.includes(candidate.id)
                                ? "(Já vinculada)"
                                : ""
                            }}
                          </option>
                        </select>

                        <button
                          @click="() => { 
                            if(selectedDependency[task.id]) {
                              addDependency(task.id, selectedDependency[task.id]!);
                              selectedDependency[task.id] = '';  
                            }
                          }"
                          class="btn btn-outline-secondary btn-sm"
                          :disabled="!selectedDependency[task.id]"
                          title="Adicionar Vínculo"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clip-rule="evenodd"
                            />
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

      <div
        v-if="tasks.length === 0"
        class="text-center text-muted mt-5 py-5 bg-white rounded border border-2 border-dashed"
      >
        <div class="display-1 mb-3 opacity-50">📝</div>
        <h3 class="h5 fw-normal text-secondary">Nenhuma tarefa encontrada</h3>
        <p class="mt-2 text-muted mx-auto" style="max-width: 300px">
          Comece adicionando tarefas acima e depois vincule dependências entre
          elas.
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
</style>
