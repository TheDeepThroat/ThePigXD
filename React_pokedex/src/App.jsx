import './App.css'
import MuestraPokemon from './components/PokemonCard'

function App() {
  const featuredPokemon = [1, 4, 7]

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Selección Pokémon</h1>
      </header>

      <section className="card-grid">
        {featuredPokemon.map((pokemonId) => (
          <MuestraPokemon key={pokemonId} pokemonid={pokemonId} />
        ))}
      </section>
    </main>
  )
}

export default App
