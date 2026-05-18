import mango from '../imagenes/mango.jpg';
import nopal  from '../imagenes/nopal.jpg';
import coco from '../imagenes/coco.jpg';
import '../estilos/Tarjeta.css';

const imagenes= {
    mango, nopal, coco
}

function Tarjeta(props){
    return(
        <div className="contenedor-tarjeta">
            <img 
                className="imagen-tarjeta"
                src={imagenes[props.imagen]} 
                alt='Imagen de fruta ${props.nombre}' />
            <div className="contenedor-texto-tarjeta">
                <p className="titulo-tarjeta">
                    <strong>{props.nombre}</strong>
                </p>
                <p className="subtitulo-tarjeta">
                    {props.region}
                </p>
                <p className="texto-tarjeta">
                    {props.texto}
                </p>
            </div>
        </div>
    );
}

export default Tarjeta;