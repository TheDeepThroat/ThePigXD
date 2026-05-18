import { useEffect, useState } from "react";

export default function Pokemon(){
    const [pokemon, setPokemon]=useState(null);

    useEffect(()=>{
        const timer= setInterval(()=>{
                fetch("https://pokeapi.co/api/v2/pokemon/pikachu")
                .then(res => res.json())
                .then(data=>setPokemon(data));
            }, 5000);
        
        return () => clearInterval(timer)
    },[]);

    return pokemon ? <h1>{pokemon.name}</h1> : <h1>Cargando...</h1>
}