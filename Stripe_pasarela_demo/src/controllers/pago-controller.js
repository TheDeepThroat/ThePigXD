import Stripe from "stripe";
import { SECRET_STRIPE } from "../config.js";

const stripe = new Stripe(SECRET_STRIPE);

const crearSesionPago = async (req, res) =>{
    const sesion = await stripe.checkout.sessions.create({
    line_items:[
            {
                price_data: {
                    product_data:{
                        name:'Laptop',
                        description: 'Gamer laptop',
                    },
                    currency:'mxn',
                    unit_amount: 1000, 
                },
                quantity: 2,
            }, //primer producto
            {
                price_data: {
                    product_data:{
                        name:'Refrigerador LG',
                        description: 'Inverter 14 pies',
                    },
                    currency:'mxn',
                    unit_amount: 2000, 
                },
                quantity: 1,
            } //segundo producto
        ],
        mode:"payment",
        success_url:'http://localhost:4000/exito',
        cancel_url:'http://localhost:4000/cancelado'
    });
    res.json(sesion);
};

export default crearSesionPago;
