// npm i express cors cookie-parser jsonwebtoken

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import auth from "./auth.js";

const app=express();
app.use(express.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true
    }
));

const SECRET = "super_secreto"; // no debe ir aqui, sino es .env

app.post("/login", (req, res)=>{
    console.log("Logueando...");
    const {username, password} = req.body;

    if(username==="admin" && password==="12345"){
        const token = jwt.sign({username}, SECRET, {expiresIn:"1h"});

        res.cookie("token",token, {
            httpOnly:true,  //no se puede leer con JS
            secure: false, // true si usas https
            sameSite: "strict",
            maxAge:3600000
        });

        return res.json({message:"Login exitoso"});
    }

    return res.status(401).json({message:"Credeciales inválidas"});
});

app.post("/logout", (req, res)=>{
    res.clearCookie("token");
    res.json({message: "Logout exitoso, bye!"});
});

app.get("/perfil", auth, (req, res)=>{
    console.log("En el perfil...");
    res.json({
        message: "Seccion protegida",
        user: req.username
    });
});

app.listen(3000, ()=>{
    console.log("Servidor en http://localhost:3000");
});

