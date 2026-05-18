<script setup>
import { Shapes, Library, CalendarCheck, FolderOpen } from 'lucide-vue-next';

const { data: groups, pending } = await useFetch('/api/groups');

// Calculate some quick stats from groups if needed
const totalStudents = computed(() => {
  if (!groups.value) return 0;
  return groups.value.reduce((acc, g) => acc + (g.total_students || 0), 0);
});

// We can mock an "activity feed" or just show "Quick Actions"
const today = new Date().toISOString().split('T')[0];

</script>

<template>
  <div class="dashboard fade-in">
    <header class="page-header">
      <div class="header-content">
        <h2 class="page-title">¡Hola de nuevo!</h2>
        <p class="text-muted">Aquí tienes un resumen de tus clases para hoy, {{ new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }) }}.</p>
      </div>
    </header>

    <div class="dashboard-grid">
      <!-- Left Column: Quick Actions & Groups -->
      <div class="main-column">
        <section class="dashboard-section glass">
          <div class="section-header">
            <h3>Tus Grupos Hoy</h3>
            <NuxtLink to="/groups" class="link-manage">Ver todos</NuxtLink>
          </div>
          
          <div v-if="pending" class="loading-state">Cargando grupos...</div>
          
          <div v-else-if="groups?.length > 0" class="action-cards">
            <div v-for="group in groups" :key="group.id" class="action-card">
              <div class="action-icon">
                <FolderOpen :size="24" />
              </div>
              <div class="action-info">
                <h4>{{ group.name }}</h4>
                <p>{{ group.total_students || 0 }} alumnos registrados</p>
              </div>
              <NuxtLink :to="`/attendance?group_id=${group.id}`" class="btn-action">
                <CalendarCheck :size="18" /> Pasar Lista
              </NuxtLink>
            </div>
          </div>
          
          <div v-else class="empty-state">
            <FolderOpen :size="48" class="text-slate-500 mb-4" />
            <p>Aún no tienes grupos registrados.</p>
            <NuxtLink to="/groups" class="btn-primary mt-4">Crear mi primer grupo</NuxtLink>
          </div>
        </section>
      </div>

      <!-- Right Column: Stats Snapshot -->
      <div class="side-column">
        <section class="dashboard-section glass">
          <h3>Resumen Global</h3>
          <div class="stats-list">
            <div class="stat-item">
              <div class="stat-icon sky"><Shapes :size="20" /></div>
              <div class="stat-details">
                <span class="stat-label">Grupos Activos</span>
                <span class="stat-value">{{ groups?.length || 0 }}</span>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon purple"><Library :size="20" /></div>
              <div class="stat-details">
                <span class="stat-label">Total Alumnos</span>
                <span class="stat-value">{{ totalStudents }}</span>
              </div>
            </div>
          </div>
        </section>
        
        <section class="dashboard-section glass mt-6">
          <h3>Actividad Reciente</h3>
          <div class="activity-feed">
            <!-- Mocked activity since we don't have a real activity endpoint -->
            <div class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-content">
                <p>Sistema inicializado correctamente.</p>
                <span class="activity-time">Hoy</span>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-dot"></div>
              <div class="activity-content">
                <p>Nuevos atajos añadidos al panel.</p>
                <span class="activity-time">Ayer</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.fade-in {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 8px;
}

.page-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.text-muted {
  color: var(--text-muted);
  font-size: 1.1rem;
  margin: 0;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.dashboard-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.mt-6 { margin-top: 24px; }
.mb-4 { margin-bottom: 16px; }
.mt-4 { margin-top: 16px; }

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-section h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-main);
}

.link-manage {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
}

.action-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s;
}

.action-card:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(14, 165, 233, 0.3);
  transform: translateX(4px);
}

.action-icon {
  width: 48px;
  height: 48px;
  background: rgba(14, 165, 233, 0.1);
  color: var(--primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-info {
  flex: 1;
}

.action-info h4 {
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  color: var(--text-main);
}

.action-info p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.btn-action {
  background: var(--primary);
  color: white;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-action:hover {
  background: var(--primary-hover);
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
}

.btn-primary {
  background: var(--primary);
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  display: inline-block;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.empty-state {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 10px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.sky { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
.stat-icon.purple { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

.stat-details {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
}

.activity-feed {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: relative;
}

.activity-feed::before {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 5px;
  width: 2px;
  background: var(--border);
}

.activity-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.activity-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--primary);
  z-index: 1;
  margin-top: 4px;
}

.activity-content p {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: var(--text-main);
}

.activity-time {
  font-size: 0.8rem;
  color: var(--text-muted);
}
</style>
