/*
getElementById("id")
getElementsByClassName()
getElementsByTagName()
querySelector()
querySelectorAll()
const titulo=document.getElementById("titulo");
console.log(titulo.attributes);
console.log(typeof(titulo.innerHTML))

const container = document.getElementsByClassName("contenedor");
console.log(container);

const div_container = document.getElementsByTagName("li");
console.log(div_container[1]);


const contenedor = document.querySelectorAll("li"); //el primer elemento
console.log(contenedor);

const contenedor = document.querySelectorAll("ul li:not(.items-tipo1)"); //el primer elemento
console.log(contenedor);

const titulo= document.getElementById("titulo");
console.log(titulo.style);
titulo.style.backgroundColor="red";
titulo.style.textTransform="uppercase";

const ul_node= document.getElementsByTagName("ul");
console.log(ul_node[0].innerText);
console.log(ul_node[0].textContent);
console.log(ul_node[0].innerHTML);


//Modificar contenido de un nodo
const titulo=document.getElementById("titulo");
titulo.innerText="Listado de Cafés";

//Acceder y cambiar un atributo

const enlace= document.getElementsByTagName("a");
console.log(enlace[0].getAttribute("href"));
enlace[0].setAttribute("href","www.geeksforgeeks.org");
console.log(enlace[0].getAttribute("href"));
enlace[0].removeAttribute("href");



const contenedor=document.getElementsByTagName("div");
console.log(contenedor[0].classList);
contenedor[0].classList.add("color-texto");  

let res=contenedor[0].classList.contains('items-tipo1');
console.log(res);

contenedor[0].classList.remove("color-texto");
*/

// vinculamos el elemento HTML con un objeto en JS


//Agregar un nuevo elemento al documento

const listado= document.getElementsByClassName("listado");
const nuevoElemento = document.createElement("li");
nuevoElemento.innerText="Item 5";
nuevoElemento.classList.add("items-tipo1");
listado[0].append(nuevoElemento);
nuevoElemento.remove();
