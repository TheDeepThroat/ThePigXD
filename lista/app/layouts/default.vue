<template>
  <div class="app-container">
    <Navbar />
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-dark);
}

.main-content {
  padding: 32px;
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
}
</style>
