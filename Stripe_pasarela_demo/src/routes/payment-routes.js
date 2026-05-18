import { Router } from "express";
import crearSesionPago from "../controllers/pago-controller.js";

const router = Router();

router.post("/pagar", crearSesionPago);
router.get("/exito", (req,res)=>res.redirect("pagado.html"));
router.get("/cancelado", (req,res)=>res.redirect("cancelado.html"));

export default router;