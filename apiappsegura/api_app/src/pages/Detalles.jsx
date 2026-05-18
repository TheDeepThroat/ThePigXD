import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function Detalles() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pokemonName, setPokemonName] = useState(searchParams.get('name') || '')
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (searchParams.get('name')) {
      loadPokemon(searchParams.get('name'))
    }
  }, [searchParams])

  const loadPokemon = async (name) => {
    if (!name) {
      setError('Ingrese un nombre de pokémon')
      return
    }

    setLoading(true)
    setError('')
    setPokemon(null)

    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      if (!response.ok) {
        throw new Error('Pokémon no encontrado')
      }
      const data = await response.json()
      setPokemon(data)
      setSearchParams({ name: data.name })
    } catch (err) {
      setError('No se encontró el pokémon ingresado')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    loadPokemon(pokemonName.trim())
  }

  return (
    <section className="page-section">
      <h2>Detalles</h2>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del pokémon"
          value={pokemonName}
          onChange={(event) => setPokemonName(event.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>
      {loading && <p>Cargando detalles...</p>}
      {error && <p className="error-message">{error}</p>}
      {pokemon && (
        <div className="detail-card">
          <h3>{pokemon.name}</h3>
          <img src={pokemon.sprites.front_default} alt={pokemon.name} />
          <div className="pokemon-meta">
            <div>
              <strong>Tipo</strong>
              <ul>
                {pokemon.types.map((item) => (
                  <li key={item.type.name}>{item.type.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Habilidades</strong>
              <ul>
                {pokemon.abilities.map((item) => (
                  <li key={item.ability.name}>{item.ability.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
