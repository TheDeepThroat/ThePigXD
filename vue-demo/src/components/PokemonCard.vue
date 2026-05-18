<script setup>
const props = defineProps({
  pokemon: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="pokemon-card">
    <div class="pokemon-image">
      <img :src="pokemon.image" :alt="pokemon.name" />
    </div>
    <div class="pokemon-body">
      <h2>{{ pokemon.name }}</h2>
      <p><strong>Tipo:</strong> {{ pokemon.type }}</p>
      <p><strong>HP:</strong> {{ pokemon.hp }}</p>
      <p><strong>Habilidad:</strong> {{ pokemon.ability }}</p>
    </div>
  </div>
</template>

<style scoped>
.pokemon-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #d0d0d0);
  border-radius: 1rem;
  background: #fff;
  max-width: 520px;
}

.pokemon-image {
  width: 120px;
  min-width: 120px;
  height: 120px;
  display: grid;
  place-items: center;
  background: #f7f7f7;
  border-radius: 1rem;
}

.pokemon-image img {
  width: 100%;
  height: auto;
}

.pokemon-body h2 {
  margin: 0 0 0.5rem;
}

.pokemon-body p {
  margin: 0.35rem 0;
}
</style>
