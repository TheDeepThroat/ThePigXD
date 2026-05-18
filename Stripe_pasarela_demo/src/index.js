import express from "express";
import path from "path";
import { PORT } from "./config.js";
import router from "../src/routes/payment-routes.js";

const app=express();
app.use(router);
app.use(express.json());
app.use(express.static(path.resolve("src/public")));

app.listen(PORT);
console.log("Servidor en localhost:",PORT);