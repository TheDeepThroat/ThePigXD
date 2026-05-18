import { useEffect, useState } from 'react'
import './PokemonCard.css'

function MuestraPokemon(props) {

    const [pokemon, setPokemon] = useState(null);

    useEffect(
        () => {
            fetch(`https://pokeapi.co/api/v2/pokemon/${props.pokemonid}`)
            .then(res => res.json())
            .then(data => setPokemon(data));
        },[props.pokemonid]
    );

    if (!pokemon) {
        return (
            <div className="loading">
                <h1>Cargando datos...</h1>
            </div>
        );
    }

    const { id, name, sprites, types, height, weight, abilities } = pokemon;

    return (
        <div className="pokemon-card">
            <div className="pokemon-image">
                <img 
                    src={sprites.front_default} 
                    alt={name} 
                />
                <h1>{name}</h1>
                <p>#{id.toString().padStart(3, '0')}</p>
            </div>
            <div>
                <h3>Tipos:</h3>
                <div className="types">
                    {types.map(type => (
                        <span 
                            key={type.type.name} 
                            className="type"
                        >
                            {type.type.name}
                        </span>
                    ))}
                </div>
            </div>
            <div className="details">
                <p><strong>Altura:</strong> {height / 10} m</p>
                <p><strong>Peso:</strong> {weight / 10} kg</p>
            </div>
            <div>
                <h3>Habilidades:</h3>
                <ul>
                    {abilities.map(ability => (
                        <li key={ability.ability.name}>
                            {ability.ability.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default MuestraPokemon;