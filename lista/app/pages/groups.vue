<script setup>
import { PlusCircle, Trash, FolderOpen, ChevronRight, UserPlus, Users, X, CheckCircle2, XCircle, Timer } from 'lucide-vue-next';

const { data: groups, refresh: refreshGroups } = await useFetch('/api/groups');

const selectedGroupId = ref(null);
const selectedGroup = computed(() => groups.value?.find(g => g.id === selectedGroupId.value) || null);

const { data: students, refresh: refreshStudents } = await useFetch('/api/students', {
  query: { group_id: selectedGroupId }
});

// Watch for group selection changes to refresh students
watch(selectedGroupId, () => {
  if (selectedGroupId.value) refreshStudents();
});

// Drawer state
const activeDrawer = ref(null); // 'addGroup', 'editGroup', 'addStudent', 'editStudent'
const currentEntity = ref({});

const closeDrawer = () => {
  activeDrawer.value = null;
  currentEntity.value = {};
};

const openAddGroup = () => {
  currentEntity.value = { name: '', description: '' };
  activeDrawer.value = 'addGroup';
};

const openEditGroup = (group) => {
  currentEntity.value = { ...group };
  activeDrawer.value = 'editGroup';
};

const openAddStudent = () => {
  currentEntity.value = { name: '', group_id: selectedGroupId.value };
  activeDrawer.value = 'addStudent';
};

// API Calls
const saveGroup = async () => {
  if (!currentEntity.value.name) return;
  const isEditing = activeDrawer.value === 'editGroup';
  
  await $fetch('/api/groups', {
    method: isEditing ? 'PUT' : 'POST',
    body: currentEntity.value
  });
  
  closeDrawer();
  refreshGroups();
};

const deleteGroup = async (id) => {
  if (!confirm('¿Eliminar este grupo y sus alumnos?')) return;
  await $fetch(`/api/groups/${id}`, { method: 'DELETE' });
  if (selectedGroupId.value === id) selectedGroupId.value = null;
  refreshGroups();
};

const saveStudent = async () => {
  if (!currentEntity.value.name || !currentEntity.value.group_id) return;
  const isEditing = activeDrawer.value === 'editStudent';
  
  await $fetch('/api/students', {
    method: isEditing ? 'PUT' : 'POST',
    body: currentEntity.value
  });
  
  closeDrawer();
  refreshStudents();
};

const deleteStudent = async (id) => {
  if (!confirm('¿Eliminar alumno?')) return;
  await $fetch(`/api/students/${id}`, { method: 'DELETE' });
  refreshStudents();
};
</script>

<template>
  <div class="groups-layout">
    <!-- Left Panel: Groups List -->
    <div class="groups-sidebar glass">
      <div class="sidebar-header">
        <h2 class="section-title">Mis Grupos</h2>
        <button @click="openAddGroup" class="btn-icon-primary" title="Nuevo Grupo">
          <PlusCircle :size="20" />
        </button>
      </div>
      
      <div class="groups-list">
        <button 
          v-for="group in groups" 
          :key="group.id"
          class="group-list-item"
          :class="{ active: selectedGroupId === group.id }"
          @click="selectedGroupId = group.id"
        >
          <div class="item-icon"><FolderOpen :size="18" /></div>
          <div class="item-info">
            <span class="item-name">{{ group.name }}</span>
            <span class="item-meta">{{ group.total_students || 0 }} alumnos</span>
          </div>
          <ChevronRight :size="16" class="item-arrow" />
        </button>
        
        <div v-if="!groups?.length" class="empty-state">
          <p>No tienes grupos.</p>
        </div>
      </div>
    </div>

    <!-- Right Panel: Group Details -->
    <div class="group-details glass">
      <div v-if="selectedGroup" class="details-content fade-in">
        <header class="details-header">
          <div class="header-info">
            <h2>{{ selectedGroup.name }}</h2>
            <p>{{ selectedGroup.description || 'Sin descripción' }}</p>
          </div>
          <div class="header-actions">
            <NuxtLink :to="`/attendance?group_id=${selectedGroup.id}`" class="btn-primary">Pase de Lista</NuxtLink>
            <button @click="openEditGroup(selectedGroup)" class="btn-ghost" title="Editar Grupo">Editar</button>
            <button @click="deleteGroup(selectedGroup.id)" class="btn-ghost text-red" title="Eliminar Grupo">Eliminar</button>
          </div>
        </header>

        <div class="students-section">
          <div class="section-header">
            <h3>Alumnos</h3>
            <button @click="openAddStudent" class="btn-secondary">
              <UserPlus :size="16" /> Agregar Alumno
            </button>
          </div>
          
          <div class="students-grid">
            <div v-for="student in students" :key="student.id" class="student-card">
              <div class="student-avatar">
                {{ student.name.charAt(0) }}
              </div>
              <div class="student-info">
                <span class="student-name">{{ student.name }}</span>
                <div class="student-stats">
                  <span class="stat present" title="Asistencias"><CheckCircle2 :size="12"/> {{ student.total_presents || 0 }}</span>
                  <span class="stat absent" title="Faltas"><XCircle :size="12"/> {{ student.total_absences || 0 }}</span>
                  <span class="stat late" title="Retardos"><Timer :size="12"/> {{ student.total_tardiness || 0 }}</span>
                </div>
              </div>
              <button @click="deleteStudent(student.id)" class="btn-delete-student" title="Eliminar alumno">
                <Trash :size="14" />
              </button>
            </div>
            
            <div v-if="!students?.length" class="empty-state-large">
              <Users :size="48" class="text-slate-500 mb-4" />
              <p>Este grupo no tiene alumnos.</p>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-state-large">
        <FolderOpen :size="64" class="text-slate-600 mb-4" />
        <p>Selecciona un grupo para ver sus detalles</p>
      </div>
    </div>

    <!-- Side Panel (Drawer) -->
    <transition name="slide">
      <div v-if="activeDrawer" class="drawer-overlay" @click.self="closeDrawer">
        <div class="drawer-panel">
          <div class="drawer-header">
            <h3>{{ activeDrawer.includes('Group') ? (activeDrawer === 'addGroup' ? 'Nuevo Grupo' : 'Editar Grupo') : 'Agregar Alumno' }}</h3>
            <button @click="closeDrawer" class="btn-close"><X :size="20" /></button>
          </div>
          
          <div class="drawer-body">
            <template v-if="activeDrawer.includes('Group')">
              <div class="form-group">
                <label>Nombre del Grupo</label>
                <input v-model="currentEntity.name" type="text" class="form-input" autofocus>
              </div>
              <div class="form-group">
                <label>Descripción</label>
                <textarea v-model="currentEntity.description" class="form-input" rows="4"></textarea>
              </div>
            </template>
            
            <template v-if="activeDrawer === 'addStudent'">
              <div class="form-group">
                <label>Nombre Completo</label>
                <input v-model="currentEntity.name" type="text" class="form-input" autofocus>
              </div>
            </template>
          </div>
          
          <div class="drawer-footer">
            <button @click="closeDrawer" class="btn-ghost">Cancelar</button>
            <button @click="activeDrawer.includes('Group') ? saveGroup() : saveStudent()" class="btn-primary">Guardar</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.groups-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 144px); /* 100vh - navbar(80) - padding(64) */
}

@media (max-width: 1024px) {
  .groups-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
}

.groups-sidebar {
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.btn-icon-primary {
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  border: none;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon-primary:hover {
  background: var(--primary);
  color: white;
}

.groups-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  color: var(--text-muted);
}

.group-list-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.group-list-item.active {
  background: rgba(14, 165, 233, 0.1);
  border-color: rgba(14, 165, 233, 0.2);
  color: var(--text-main);
}

.group-list-item.active .item-icon {
  color: var(--primary);
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.item-meta {
  font-size: 0.8rem;
  opacity: 0.7;
}

.item-arrow {
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.2s;
}

.group-list-item.active .item-arrow {
  opacity: 1;
  transform: translateX(0);
}

.group-details {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.details-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.details-header {
  padding: 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-info h2 {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: var(--text-main);
}

.header-info p {
  margin: 0;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.text-red {
  color: #ef4444;
}

.text-red:hover {
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.1);
}

.students-section {
  padding: 32px;
  flex: 1;
  overflow-y: auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-main);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.student-card {
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  transition: all 0.2s;
}

.student-card:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(14, 165, 233, 0.3);
}

.student-avatar {
  width: 36px;
  height: 36px;
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.student-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.student-name {
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--text-main);
  margin-bottom: 4px;
}

.student-stats {
  display: flex;
  gap: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.student-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.student-stats .present { color: #10b981; }
.student-stats .absent { color: #ef4444; }
.student-stats .late { color: #f59e0b; }

.btn-delete-student {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  opacity: 0;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.student-card:hover .btn-delete-student {
  opacity: 1;
}

.btn-delete-student:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.empty-state, .empty-state-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
}

.empty-state {
  padding: 32px 16px;
}

.empty-state-large {
  height: 100%;
  padding: 64px;
}

.fade-in {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Drawer Styles */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.drawer-panel {
  width: 400px;
  max-width: 100%;
  height: 100%;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.5);
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.btn-close {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.drawer-body {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
}

.form-input {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px;
  color: var(--text-main);
  outline: none;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: var(--primary);
}

.drawer-footer {
  padding: 24px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .drawer-panel,
.slide-leave-to .drawer-panel {
  transform: translateX(100%);
}
</style>
