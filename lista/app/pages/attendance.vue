<script setup>
import { CheckCircle2, XCircle, Timer, HardDriveDownload, BookDashed, Ghost } from 'lucide-vue-next';

const route = useRoute();
const selectedGroupId = ref(route.query.group_id || '');
const selectedDate = ref(new Date().toISOString().split('T')[0]);

const { data: groups } = await useFetch('/api/groups');

const { data: students, refresh: refreshStudents } = await useFetch('/api/students', {
  query: { group_id: selectedGroupId }
});

const attendanceRecords = ref({}); // { student_id: 'present' | 'absent' | 'late' }

// When group or date changes, try to fetch existing attendance
const fetchExistingAttendance = async () => {
  if (!selectedGroupId.value || !selectedDate.value || !students.value) return;
  
  const { records } = await $fetch('/api/attendance', {
    query: { group_id: selectedGroupId.value, date: selectedDate.value }
  });
  
  const newRecords = {};
  // Default everyone to present
  students.value.forEach(s => {
    newRecords[s.id] = 'present';
  });
  
  // Override with existing records
  records.forEach(r => {
    newRecords[r.student_id] = r.status;
  });
  
  attendanceRecords.value = newRecords;
};

watch([selectedGroupId, selectedDate, students], () => {
  fetchExistingAttendance();
}, { immediate: true });

// Toggle logic: Present -> Absent -> Late -> Present
const toggleStatus = (studentId) => {
  const current = attendanceRecords.value[studentId];
  if (current === 'present') attendanceRecords.value[studentId] = 'absent';
  else if (current === 'absent') attendanceRecords.value[studentId] = 'late';
  else attendanceRecords.value[studentId] = 'present';
};

const saveAttendance = async () => {
  if (!selectedGroupId.value) return;
  
  const recordsArray = Object.entries(attendanceRecords.value).map(([student_id, status]) => ({
    student_id: parseInt(student_id),
    status
  }));
  
  await $fetch('/api/attendance', {
    method: 'POST',
    body: {
      group_id: selectedGroupId.value,
      date: selectedDate.value,
      records: recordsArray
    }
  });
  
  alert('Asistencia guardada correctamente.');
};

const summary = computed(() => {
  const counts = { present: 0, absent: 0, late: 0 };
  Object.values(attendanceRecords.value).forEach(status => counts[status]++);
  return counts;
});
</script>

<template>
  <div class="attendance-page">
    <header class="page-header">
      <div class="header-content">
        <h2 class="page-title">Pase de Lista</h2>
        <div v-if="selectedDate !== new Date().toISOString().split('T')[0]" class="past-date-warning fade-in">
          <Timer :size="16" /> Editando fecha pasada: {{ new Date(selectedDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) }}
        </div>
      </div>
    </header>

    <div class="controls-bar glass fade-in">
      <div class="control-group">
        <label>Grupo</label>
        <select v-model="selectedGroupId" class="form-select">
          <option value="" disabled>Selecciona un grupo</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
        </select>
      </div>
      <div class="control-group">
        <label>Seleccionar fecha</label>
        <div class="date-input-wrapper">
          <input v-model="selectedDate" type="date" class="form-input-date">
          <button @click="selectedDate = new Date().toISOString().split('T')[0]" class="btn-today" title="Volver a hoy">Hoy</button>
        </div>
      </div>
    </div>

    <div v-if="!selectedGroupId" class="empty-state-container glass fade-in">
      <div class="empty-content">
        <BookDashed :size="64" class="text-slate-700" />
        <h3>Comienza el Pase de Lista</h3>
        <p>Selecciona un grupo para ver el aula virtual.</p>
      </div>
    </div>

    <div v-else-if="students?.length === 0" class="empty-state-container glass fade-in">
      <div class="empty-content">
        <Ghost :size="64" class="text-slate-700" />
        <h3>Sin Alumnos</h3>
        <p>Este grupo no tiene alumnos registrados todavía.</p>
        <NuxtLink :to="`/groups?group_id=${selectedGroupId}`" class="link-primary">Ir a gestión de grupos</NuxtLink>
      </div>
    </div>

    <div v-else class="attendance-workspace fade-in">
      <div class="roster-grid">
        <button 
          v-for="student in students" 
          :key="student.id"
          class="roster-card"
          :class="attendanceRecords[student.id]"
          @click="toggleStatus(student.id)"
        >
          <div class="card-status-indicator">
            <CheckCircle2 v-if="attendanceRecords[student.id] === 'present'" :size="18" />
            <XCircle v-else-if="attendanceRecords[student.id] === 'absent'" :size="18" />
            <Timer v-else :size="18" />
          </div>
          <div class="avatar-lg">
            {{ student.name.charAt(0) }}
          </div>
          <span class="student-name">{{ student.name.split(' ')[0] }}</span>
        </button>
      </div>

      <!-- Floating Action Bar -->
      <div class="floating-save-bar glass">
        <div class="summary-stats">
          <div class="stat-pill present">
            <span class="dot"></span> {{ summary.present }} Presentes
          </div>
          <div class="stat-pill absent">
            <span class="dot"></span> {{ summary.absent }} Faltas
          </div>
          <div class="stat-pill late">
            <span class="dot"></span> {{ summary.late }} Retardos
          </div>
        </div>
        <button @click="saveAttendance" class="btn-primary">
          <HardDriveDownload :size="20" /> Guardar Lista
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.attendance-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 100px; /* Space for floating bar */
}

.fade-in {
  animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.controls-bar {
  padding: 20px 24px;
  display: flex;
  gap: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-select, .form-input-date {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 16px;
  color: var(--text-main);
  outline: none;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 200px;
}

.date-input-wrapper {
  display: flex;
  gap: 8px;
}

.btn-today {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-today:hover {
  background: rgba(255, 255, 255, 0.1);
}

.past-date-warning {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 158, 11, 0.1);
  color: #fcd34d;
  padding: 6px 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 12px;
}

.empty-state-container {
  padding: 80px 32px;
  text-align: center;
  border-radius: 12px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.empty-content p {
  color: var(--text-muted);
  max-width: 400px;
  margin: 0;
  font-size: 0.95rem;
}

.link-primary {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
  margin-top: 12px;
  display: inline-block;
  font-size: 0.95rem;
}

.attendance-workspace {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.roster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.roster-card {
  background: rgba(15, 23, 42, 0.5);
  border: 2px solid var(--border);
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.roster-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
}

.card-status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  transition: all 0.2s;
}

.avatar-lg {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-main);
  transition: all 0.2s;
}

.student-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-main);
  text-align: center;
  word-break: break-word;
}

/* Status Styles */
.roster-card.present {
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(16, 185, 129, 0.05);
}
.roster-card.present .card-status-indicator {
  color: #10b981;
}
.roster-card.present .avatar-lg {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.roster-card.absent {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.1);
}
.roster-card.absent .card-status-indicator {
  color: #ef4444;
}
.roster-card.absent .avatar-lg {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.roster-card.late {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.1);
}
.roster-card.late .card-status-indicator {
  color: #f59e0b;
}
.roster-card.late .avatar-lg {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

/* Floating Save Bar */
.floating-save-bar {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-card);
  border: 1px solid var(--border);
  padding: 16px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.summary-stats {
  display: flex;
  gap: 16px;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.stat-pill .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.stat-pill.present .dot { background: #10b981; }
.stat-pill.absent .dot { background: #ef4444; }
.stat-pill.late .dot { background: #f59e0b; }

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.2);
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px -1px rgba(14, 165, 233, 0.3);
}

@media (max-width: 768px) {
  .controls-bar {
    flex-direction: column;
    gap: 16px;
  }
  
  .floating-save-bar {
    width: calc(100% - 48px);
    flex-direction: column;
    border-radius: 16px;
    gap: 16px;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>
