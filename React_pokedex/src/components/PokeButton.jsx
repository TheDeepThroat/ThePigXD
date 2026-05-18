import { useState } from 'react'
import PokemonCard from './PokemonCard.jsx'

function PokeButton() {
    const [contador, setContador] = useState(1);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const incrementar = () => setContador(prev => prev + 1);
    const decrementar = () => setContador(prev => Math.max(1, prev - 1));

    const handleSearch = async (event) => {
        event.preventDefault();
        const query = search.trim().toLowerCase();

        if (!query) {
            setError('Escribe un nombre de Pokémon.');
            return;
        }

        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);

            if (!response.ok) {
                throw new Error('No encontrado');
            }

            const data = await response.json();
            setContador(data.id);
            setError('');
        } catch (err) {
            setError('Pokémon no encontrado.');
        }
    };

    return (
        <div className="container py-4 poke-gallery-container">
            <div className="row justify-content-center mb-4">
                <div className="col-12 col-md-8">
                    <form onSubmit={handleSearch} className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Buscar Pokémon por nombre"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <button className="btn btn-warning" type="submit">Buscar</button>
                    </form>
                    {error && (
                        <div className="mt-2 text-danger">{error}</div>
                    )}
                </div>
            </div>
            <div className="row align-items-stretch justify-content-center gy-3">
                <div className="col-12 d-flex justify-content-between d-md-none">
                    <button onClick={decrementar} className="btn btn-primary btn-lg gallery-arrow-button">←</button>
                    <button onClick={incrementar} className="btn btn-primary btn-lg gallery-arrow-button">→</button>
                </div>
                <div className="col-auto d-none d-md-flex justify-content-center align-items-center">
                    <button onClick={decrementar} className="btn btn-primary btn-lg gallery-arrow-button">←</button>
                </div>
                <div className="col-12 col-md-10">
                    <div className="row g-3 justify-content-center align-items-stretch">
                        <div className="col-12 col-md-4 d-flex">
                            <PokemonCard pokemonid={contador} />
                        </div>
                        <div className="col-12 col-md-4 d-flex">
                            <PokemonCard pokemonid={contador + 1} />
                        </div>
                        <div className="col-12 col-md-4 d-flex">
                            <PokemonCard pokemonid={contador + 2} />
                        </div>
                    </div>
                </div>
                <div className="col-auto d-none d-md-flex justify-content-center align-items-center">
                    <button onClick={incrementar} className="btn btn-primary btn-lg gallery-arrow-button">→</button>
                </div>
            </div>
        </div>
    );
}

export default PokeButton;