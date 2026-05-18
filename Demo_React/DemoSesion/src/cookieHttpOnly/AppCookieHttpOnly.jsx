import { useState } from "react";

export default function AppCookieHttpOnly(){
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("12345");
    const [mensaje, setMensaje] = useState("");

    const login = async () =>{
        
        const res = await fetch("http://localhost:3000/login",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({username, password})
        });
        console.log("Haciendo el fetch");
        const data=await res.json();
        setMensaje(data.message);
    };

    const obtenerPerfil = async () =>{
        const res= await fetch("http://localhost:3000/perfil",{
            credentials:"include"
        });

        const data=res.json();
        setMensaje(JSON.stringify(data));
    };

    const logout = async() =>{
        const res= await fetch("http://localhost:3000/logout",{
            method:"POST",
            credentials:"include"
        });

        const data= res.json();
        setMensaje(data.message);
    };


    return(
        <div>
            <h2>Autenticación con Cookies Seguras</h2>

            <input
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                placeholder="Usuario"
            />

            <input
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                type="password"
                placeholder="password"
            />
            <button onClick={login}>
                Login
            </button>
            <button onClick={obtenerPerfil}>
                Perfil
            </button>
            <button onClick={logout}>
                Logout
            </button>
            <div>
                <h3>Mensaje:</h3>
                <h3>{mensaje}</h3>
            </div>
        </div>
    );
};