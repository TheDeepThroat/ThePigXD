//Helpers

import { useState, useEffect } from "react";

export function useAuthLocalStorage(){
    const [token, setToken]=useState(null);

    useEffect(()=>{
        const saved=localStorage.getItem("token");
        if (saved) setToken(saved);
    },[]);

    const login = () =>{
        const fakeToken ="xyz123";
        localStorage.setItem("token",fakeToken);
        setToken(fakeToken);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
    };

    return { token, login, logout };
}