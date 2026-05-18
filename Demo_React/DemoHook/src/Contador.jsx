import { useState } from "react";

export function Contador(){
    const [contador, setContador] = useState(0);

    const incrementa = ()=>{setContador(contador + 1)}
    const decrementa = ()=>{setContador(contador - 1)}
     
    return (
        <div>
            <h1>{contador}</h1>
            <button onClick={incrementa}>Incrementa</button>
            <button onClick={decrementa}>Decrementa</button>
        </div>
    );
}
