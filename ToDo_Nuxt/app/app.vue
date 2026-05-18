<template>
  <div class="app-layout">
    <NuxtRouteAnnouncer />
    <main class="content">
      <NuxtPage />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --bg-color: #f4f7f6;
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --accent-primary: #0ea5e9;
  --accent-secondary: #38bdf8;
  --accent-danger: #ef4444;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-color);
  color: var(--text-primary);
  font-family: 'Outfit', sans-serif;
  overflow-x: hidden;
  min-height: 100vh;
}

.app-layout {
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.content {
  position: relative;
  z-index: 10;
  min-height: 100vh;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
