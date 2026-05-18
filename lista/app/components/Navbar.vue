<script setup>
import { PieChart, Layers, Users, CalendarCheck, Rocket } from 'lucide-vue-next';

const navItems = [
  { name: 'Dashboard', path: '/', icon: PieChart },
  { name: 'Grupos', path: '/groups', icon: Layers },
  { name: 'Asistencia', path: '/attendance', icon: CalendarCheck },
];
</script>

<template>
  <header class="navbar">
    <div class="nav-container">
      <div class="logo-section">
        <div class="logo-icon">
          <Rocket class="text-white" :size="24" />
        </div>
        <h1 class="logo-text">Attendify</h1>
      </div>

      <nav class="nav-menu">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="nav-item"
        >
          <component 
            :is="item.icon" 
            :size="20" 
            class="nav-icon"
          />
          <span class="nav-label">{{ item.name }}</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  width: 100%;
  height: 80px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  font-family: 'Plus Jakarta Sans', sans-serif;
  letter-spacing: -0.03em;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.2s ease;
  font-weight: 500;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-main);
}

.router-link-active {
  background: rgba(14, 165, 233, 0.1) !important;
  color: var(--primary) !important;
  font-weight: 600;
}

.nav-icon {
  transition: color 0.3s ease;
}

.nav-label {
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .nav-label {
    display: none;
  }
  
  .nav-item {
    padding: 10px;
  }
}
</style>
