import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Filtrar() {
  const [query, setQuery] = useState('')
  const [pokemonList, setPokemonList] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPokemonList() {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        const data = await response.json()
        setPokemonList(data.results || [])
      } catch (err) {
        setError('No se pudo cargar la lista para filtrar')
      } finally {
        setLoading(false)
      }
    }

    loadPokemonList()
  }, [])

  const filtered = useMemo(
    () => pokemonList.filter((pokemon) => pokemon.name.includes(query.trim().toLowerCase())),
    [pokemonList, query],
  )

  return (
    <section className="page-section">
      <h2>Filtrar</h2>
      <p>Filtra pokemones por nombre en los primeros 151 registros.</p>
      <input
        className="filter-input"
        type="text"
        placeholder="Escribe para filtrar"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {loading ? (
        <p>Cargando lista...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="pokemon-grid">
          {filtered.slice(0, 50).map((pokemon) => (
            <Link key={pokemon.name} to={`/detalles?name=${pokemon.name}`} className="pokemon-card">
              {pokemon.name}
            </Link>
          ))}
          {filtered.length === 0 && <p>No se encontraron resultados.</p>}
        </div>
      )}
    </section>
  )
}
