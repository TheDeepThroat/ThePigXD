<template>
  <div class="container">
    <header class="header">
      <div class="logo">
        <div class="logo-icon">
          <CheckCircle2 :size="32" />
        </div>
        <div>
          <h1>ToDo App</h1>
          <p>Organiza tu día con elegancia</p>
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Input Section -->
      <section class="glass-card add-task-section">
        <div class="input-group">
          <div class="input-wrapper">
            <Plus class="input-icon" :size="20" />
            <input 
              v-model="newTask.title" 
              type="text" 
              placeholder="¿Qué tienes pendiente?"
              @keyup.enter="addTask"
            />
          </div>
          <textarea 
            v-model="newTask.description" 
            placeholder="Añade una descripción (opcional)..."
          ></textarea>
          <button 
            class="btn-primary" 
            :disabled="!newTask.title.trim() || isSubmitting"
            @click="addTask"
          >
            <span v-if="isSubmitting" class="loader"></span>
            <span v-else>Añadir Tarea</span>
          </button>
        </div>
      </section>

      <!-- Filters Section -->
      <section class="filters-bar">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          :class="['filter-btn', { active: currentFilter === filter.value }]"
          @click="currentFilter = filter.value"
        >
          <component :is="filter.icon" :size="16" />
          {{ filter.label }}
        </button>
      </section>

      <!-- Tasks List -->
      <section class="tasks-container">
        <div v-if="isLoading" class="loading-state">
          <div class="skeleton" v-for="i in 3" :key="i"></div>
        </div>

        <div v-else-if="filteredTasks.length === 0" class="empty-state">
          <div class="empty-icon">
            <ClipboardList :size="48" />
          </div>
          <h3>No hay tareas aquí</h3>
          <p>Relájate o añade una nueva tarea para empezar.</p>
        </div>

        <TransitionGroup v-else name="list" tag="div" class="tasks-list">
          <div 
            v-for="task in filteredTasks" 
            :key="task.id" 
            class="task-item glass-card"
            :class="{ 'is-done': task.done, 'is-favorite': task.favorite }"
          >
            <div class="task-content">
              <div class="task-main">
                <button 
                  class="check-btn" 
                  @click="toggleDone(task)"
                  :title="task.done ? 'Marcar como pendiente' : 'Marcar como realizada'"
                >
                  <Circle v-if="!task.done" :size="24" />
                  <CheckCircle2 v-else :size="24" class="success-icon" />
                </button>
                
                <div class="task-text" v-if="editingId !== task.id">
                  <h3 @dblclick="startEdit(task)">{{ task.title }}</h3>
                  <p v-if="task.description">{{ task.description }}</p>
                </div>
                
                <div class="task-edit" v-else>
                  <input 
                    v-model="editForm.title" 
                    class="edit-input" 
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                    ref="editInput"
                  />
                  <textarea v-model="editForm.description" class="edit-textarea"></textarea>
                </div>
              </div>

              <div class="task-actions">
                <template v-if="editingId === task.id">
                  <button class="action-btn success" @click="saveEdit" title="Guardar">
                    <Save :size="18" />
                  </button>
                  <button class="action-btn" @click="cancelEdit" title="Cancelar">
                    <X :size="18" />
                  </button>
                </template>
                <template v-else>
                  <button 
                    class="action-btn favorite" 
                    :class="{ active: task.favorite }"
                    @click="toggleFavorite(task)"
                    title="Favorita"
                  >
                    <Star :size="18" :fill="task.favorite ? 'currentColor' : 'none'" />
                  </button>
                  <button class="action-btn" @click="startEdit(task)" title="Editar">
                    <Pencil :size="18" />
                  </button>
                  <button class="action-btn danger" @click="removeTask(task)" title="Eliminar">
                    <Trash2 :size="18" />
                  </button>
                </template>
              </div>
            </div>
            
            <div class="task-footer">
              <span class="timestamp">
                <Clock :size="12" />
                {{ formatDate(task.updatedAt) }}
              </span>
            </div>
          </div>
        </TransitionGroup>
      </section>
    </main>

    <!-- Notification -->
    <Transition name="fade">
      <div v-if="notification.show" :class="['notification', notification.type]">
        {{ notification.message }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Star, 
  Pencil, 
  Save, 
  X, 
  Clock, 
  ClipboardList, 
  ListTodo, 
  CheckSquare, 
  LayoutList
} from 'lucide-vue-next'

interface Todo {
  id: string
  title: string
  description: string
  favorite: boolean
  done: boolean
  createdAt: string
  updatedAt: string
}

const tasks = ref<Todo[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const currentFilter = ref<'all' | 'pending' | 'done' | 'favorite'>('all')

const newTask = reactive({
  title: '',
  description: ''
})

const editingId = ref<string | null>(null)
const editForm = reactive({
  title: '',
  description: ''
})
const editInput = ref<HTMLInputElement | null>(null)

const filters = [
  { label: 'Todas', value: 'all', icon: LayoutList },
  { label: 'Pendientes', value: 'pending', icon: ListTodo },
  { label: 'Favoritas', value: 'favorite', icon: Star },
  { label: 'Realizadas', value: 'done', icon: CheckSquare },
]

const notification = reactive({
  show: false,
  message: '',
  type: 'success'
})

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.message = message
  notification.type = type
  notification.show = true
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const filteredTasks = computed(() => {
  let list = [...tasks.value]
  
  if (currentFilter.value === 'pending') list = list.filter(t => !t.done)
  if (currentFilter.value === 'done') list = list.filter(t => t.done)
  if (currentFilter.value === 'favorite') list = list.filter(t => t.favorite)
  
  return list.sort((a, b) => {
    // Favorites first
    if (a.favorite && !b.favorite) return -1
    if (!a.favorite && b.favorite) return 1
    // Then by date
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const fetchTasks = async () => {
  try {
    tasks.value = await $fetch<Todo[]>('/api/todos')
  } catch (e) {
    showNotification('Error al cargar tareas', 'error')
  } finally {
    isLoading.value = false
  }
}

const addTask = async () => {
  if (!newTask.title.trim()) return
  isSubmitting.value = true
  try {
    await $fetch('/api/todos', {
      method: 'POST',
      body: {
        title: newTask.title,
        description: newTask.description
      }
    })
    newTask.title = ''
    newTask.description = ''
    await fetchTasks()
    showNotification('Tarea añadida con éxito')
  } catch (e) {
    showNotification('Error al añadir tarea', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const toggleDone = async (task: Todo) => {
  try {
    await $fetch(`/api/todos/${task.id}`, {
      method: 'PUT',
      body: { done: !task.done }
    })
    await fetchTasks()
  } catch (e) {
    showNotification('Error al actualizar tarea', 'error')
  }
}

const toggleFavorite = async (task: Todo) => {
  try {
    await $fetch(`/api/todos/${task.id}`, {
      method: 'PUT',
      body: { favorite: !task.favorite }
    })
    await fetchTasks()
  } catch (e) {
    showNotification('Error al actualizar favorita', 'error')
  }
}

const removeTask = async (task: Todo) => {
  try {
    await $fetch(`/api/todos/${task.id}`, {
      method: 'DELETE'
    })
    await fetchTasks()
    showNotification('Tarea eliminada')
  } catch (e) {
    showNotification('Error al eliminar tarea', 'error')
  }
}

const startEdit = (task: Todo) => {
  editingId.value = task.id
  editForm.title = task.title
  editForm.description = task.description
  nextTick(() => {
    editInput.value?.focus()
  })
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async () => {
  if (!editingId.value || !editForm.title.trim()) return
  try {
    await $fetch(`/api/todos/${editingId.value}`, {
      method: 'PUT',
      body: {
        title: editForm.title,
        description: editForm.description
      }
    })
    editingId.value = null
    await fetchTasks()
    showNotification('Tarea actualizada')
  } catch (e) {
    showNotification('Error al actualizar tarea', 'error')
  }
}

const formatDate = (isoDate: string) => {
  const date = new Date(isoDate)
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(fetchTasks)
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header {
  margin-bottom: 30px;
  text-align: left;
  border-bottom: 2px solid var(--card-border);
  padding-bottom: 20px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}

.logo-icon {
  background: var(--accent-primary);
  color: white;
  padding: 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header p {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-top: 4px;
}

.glass-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: box-shadow 0.2s ease;
}

.add-task-section {
  padding: 24px;
  margin-bottom: 32px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
}

input[type="text"], 
textarea,
.edit-input,
.edit-textarea {
  width: 100%;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 14px 16px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

input[type="text"] {
  padding-left: 48px;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  background: #0284c7;
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--card-border);
  padding-bottom: 16px;
}

.filter-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: #f1f5f9;
  color: var(--text-primary);
}

.filter-btn.active {
  background: #e0f2fe;
  color: var(--accent-primary);
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  padding: 20px;
}

.task-item:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.task-item.is-done {
  opacity: 0.7;
  background: #f8fafc;
}

.task-item.is-done .task-text h3 {
  text-decoration: line-through;
  color: var(--text-secondary);
}

.task-item.is-favorite {
  border-left: 4px solid var(--accent-warning);
}

.task-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.task-main {
  display: flex;
  gap: 16px;
  flex: 1;
}

.check-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #cbd5e1;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  margin-top: 2px;
}

.check-btn:hover {
  color: var(--accent-primary);
}

.success-icon {
  color: var(--accent-success);
}

.task-text {
  flex: 1;
}

.task-text h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.task-text p {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.task-edit {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.edit-input {
  font-weight: 600;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #ffffff;
  color: var(--text-primary);
  border-color: #cbd5e1;
}

.action-btn.favorite.active {
  color: var(--accent-warning);
  background: #fef3c7;
  border-color: #fde68a;
}

.action-btn.danger:hover {
  background: #fee2e2;
  color: var(--accent-danger);
  border-color: #fca5a5;
}

.action-btn.success:hover {
  background: #d1fae5;
  color: var(--accent-success);
  border-color: #6ee7b7;
}

.task-footer {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed var(--card-border);
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
}

.empty-icon {
  margin-bottom: 20px;
  color: #cbd5e1;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 8px;
  font-size: 1.25rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton {
  height: 120px;
  background: #e2e8f0;
  border-radius: 12px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Animations */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.notification.success {
  background: var(--accent-success);
  color: white;
}

.notification.error {
  background: var(--accent-danger);
  color: white;
}

.loader {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-bottom-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .header {
    text-align: center;
  }
  .logo {
    flex-direction: column;
    gap: 12px;
  }
  .filters-bar {
    overflow-x: auto;
    padding-bottom: 8px;
    white-space: nowrap;
  }
  .task-content {
    flex-direction: column;
  }
  .task-actions {
    width: 100%;
    justify-content: flex-start;
    margin-top: 16px;
  }
  .btn-primary {
    align-self: stretch;
  }
}
</style>
