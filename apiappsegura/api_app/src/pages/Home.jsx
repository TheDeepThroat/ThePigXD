import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadPokemons() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
        const data = await response.json()
        setPokemonList(data.results || [])
      } catch (err) {
        setError('No se pudo cargar la lista de pokémon')
      } finally {
        setLoading(false)
      }
    }

    loadPokemons()
  }, [])

  return (
    <section className="page-section">
      <h2>Home</h2>
      <p>Lista de pokemones desde la PokeAPI</p>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <Link key={pokemon.name} to={`/detalles?name=${pokemon.name}`} className="pokemon-card">
              {pokemon.name}
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
