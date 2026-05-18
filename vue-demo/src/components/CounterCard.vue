<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => {
  count.value += 1
}
const decrement = () => {
  count.value -= 1
}
</script>

<template>
  <div class="card">
    <h2>Contador</h2>
    <p class="count">{{ count }}</p>
    <div class="button-group">
      <button @click="decrement">Decrementar</button>
      <button @click="increment">Incrementar</button>
    </div>
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  border: 1px solid var(--border-color, #d0d0d0);
  border-radius: 1rem;
  background: #fff;
  max-width: 360px;
}

.count {
  font-size: 2.5rem;
  margin: 1rem 0;
  font-weight: 700;
}

.button-group {
  display: flex;
  gap: 1rem;
}

button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.75rem;
  background: #42b883;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

button:hover {
  background: #36946a;
}
</style>
