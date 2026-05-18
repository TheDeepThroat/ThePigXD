const express=require("express");
const cors=require("cors");
const mongoose = require("mongoose");

const Usuario = require("./models/Usuario");

const app=express();
const port=3600;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ThePigXD:ElCerdoXD@cluster0.dskabrw.mongodb.net/?appName=Cluster0")
.then(
    ()=>console.log("MongoDB database service listo!")
)
.catch(
    err => console.log(err)
);


app.get("/api/usuarios", async(req, res)=>{
   const usuarios= await Usuario.find();
   res.json(usuarios);
});

app.post("/api/usuarios", async (req, res)=>{
    const nuevo = new Usuario(
        {
            nombre: req.body.nombre,
            email: req.body.email,
            genero: req.body.genero,
            plataformas: req.body.plataformas
        }
    );
    const guardado= await nuevo.save();
    res.json(guardado);
});

app.put("/api/usuarios/:id", async (req, res)=>{
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: "Id inválido" });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate(
            req.params.id,
            {
                nombre: req.body.nombre,
                email: req.body.email,
                genero: req.body.genero,
                plataformas: req.body.plataformas || []
            },
            { new: true, runValidators: true }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        res.json(usuarioActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, ()=>{
    console.log("Listening at http://localhost:3600");
});

