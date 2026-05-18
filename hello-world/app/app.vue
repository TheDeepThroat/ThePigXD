<template>
  <div class="container">
    <NuxtRouteAnnouncer />
    <div class="content">
      <h1 class="title">¡Hola Mundo!</h1>
      <p class="subtitle">Bienvenido a tu aplicación Nuxt</p>
      <div class="info">
        <p>Esta es una pantalla de bienvenida personalizada.</p>
        <p>Tu proyecto Nuxt está configurado y listo para usar.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0d0d0d;
  font-family: 'Courier New', Courier, monospace;
  color: #00ff00;
}

.content {
  text-align: left;
  padding: 2.5rem;
  max-width: 600px;
  background-color: #1a1a1a;
  border: 2px solid #00ff00;
  box-shadow: 8px 8px 0px rgba(0, 255, 0, 0.2);
  border-radius: 0;
}

.title {
  font-size: 3rem;
  font-weight: normal;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: #aaaaaa;
  border-bottom: 1px dashed #333;
  padding-bottom: 1rem;
}

.info {
  background: transparent;
  padding: 1rem;
  border-left: 4px solid #00ff00;
}

.info p {
  font-size: 1rem;
  margin: 0.5rem 0;
  line-height: 1.5;
  color: #cccccc;
}
.info p::before {
  content: "> ";
  color: #00ff00;
}
</style>
