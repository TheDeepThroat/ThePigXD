import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
    const SECRET = "super_secreto";
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message:"No autenticado"});
    }

    try{
       const decoded= jwt.verify(token,SECRET);
       req.username=decoded;
       next();     
    }catch(error){
        console.log("Error en JWT", error.message);
        return res.status(401).json({message:"Token no valido"});
    }
}