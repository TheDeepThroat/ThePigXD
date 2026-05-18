<script setup>
import CounterCard from './components/CounterCard.vue'
import UserForm from './components/UserForm.vue'
import PokemonCard from './components/PokemonCard.vue'

const pokemon = {
  name: 'Pikachu',
  type: 'Eléctrico',
  hp: 35,
  ability: 'Estática',
  image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
}
</script>

<template>
  <div class="app-container">
    <section class="hero">
      <h1>Mi proyecto Vue</h1>
      <p>Contador, formulario y tarjeta de Pokémon integrados en una sola aplicación.</p>
    </section>

    <section class="grid">
      <CounterCard />
      <UserForm />
      <PokemonCard :pokemon="pokemon" />
    </section>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 3rem;
  background: #f5f6fa;
  color: #212121;
}

.hero {
  text-align: center;
  margin: 0 auto 2.5rem;
  max-width: 860px;
}

.hero h1 {
  margin: 0;
  font-size: clamp(2.25rem, 3vw, 3.5rem);
}

.hero p {
  margin: 1rem auto 0;
  max-width: 720px;
  color: #4b5563;
  line-height: 1.8;
}

.grid {
  display: grid;
  gap: 2rem;
  justify-items: center;
  width: min(100%, 1000px);
  margin: 0 auto;
}

@media (min-width: 900px) {
  .grid {
    grid-template-columns: repeat(3, minmax(300px, 1fr));
    align-items: start;
    gap: 2.25rem;
  }
}
</style>
