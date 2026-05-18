<script setup>
import { ref } from 'vue'

const name = ref('')
const email = ref('')
</script>

<template>
  <div class="card form-card">
    <h2>Formulario de usuario</h2>
    <form @submit.prevent>
      <label>
        Nombre
        <input v-model="name" type="text" placeholder="Escribe tu nombre" />
      </label>
      <label>
        Correo electrónico
        <input v-model="email" type="email" placeholder="nombre@dominio.com" />
      </label>
    </form>

    <div class="preview">
      <p><strong>Nombre:</strong> <span>{{ name || 'No ingresado' }}</span></p>
      <p><strong>Correo:</strong> <span>{{ email || 'No ingresado' }}</span></p>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  border: 1px solid var(--border-color, #d0d0d0);
  border-radius: 1rem;
  background: #fff;
  max-width: 420px;
}

.form-card label {
  display: block;
  margin-bottom: 1rem;
  font-weight: 600;
}

input {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #c1c1c1;
  border-radius: 0.75rem;
  font-size: 1rem;
}

.preview {
  margin-top: 1.25rem;
  border-top: 1px solid #e6e6e6;
  padding-top: 1rem;
}

.preview p {
  margin: 0.5rem 0;
}
</style>
