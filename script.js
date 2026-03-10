function openModal(service){

const title = document.getElementById("modal-title");
const text = document.getElementById("modal-text");
const modal = document.getElementById("modal");

if(service === "mineria"){
title.innerText="Construcción y Sector Minero";
text.innerText="Brindamos asesoramiento técnico y legal especializado para la industria minera y constructora. Gestionamos la viabilidad de proyectos, normativas locales y optimización de recursos, asegurando que su operación cumpla con los más altos estándares de la industria sanjuanina.";
}

if(service === "finanzas"){
title.innerText="Proyectos de Inversión y Finanzas";
text.innerText="Transformamos ideas en activos rentables. Realizamos análisis de factibilidad, evaluación de riesgos y diseño de estructuras financieras sólidas para captar capital y maximizar el retorno de su inversión.";
}

if(service === "contable"){
title.innerText="Asesoramiento Contable y Empresarial";
text.innerText="Mucho más que liquidación de impuestos. Ofrecemos una consultoría contable estratégica que organiza su estructura administrativa, garantiza el cumplimiento normativo y facilita la toma de decisiones informadas.";
}

modal.style.display="flex";
}

function closeModal(){
document.getElementById("modal").style.display="none";
}






document.addEventListener("DOMContentLoaded", function(){

/* NAVBAR SCROLL */

window.addEventListener("scroll", function(){

const navbar = document.querySelector(".navbar");

if(window.scrollY > 80){
navbar.classList.add("scrolled");
}else{
navbar.classList.remove("scrolled");
}

});



/* CARRUSEL */

const track = document.getElementById("track");
const cards = document.querySelectorAll(".card");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let index = 2;

function updateFocus(){

cards.forEach(c => c.classList.remove("active"));
cards[index].classList.add("active");

}

function moveCarousel(){

const cardWidth = cards[0].offsetWidth + 25;

track.style.transform =
`translateX(${-(index - 2) * cardWidth}px)`;

updateFocus();

}

next.addEventListener("click", ()=>{

index++;
track.style.transition="transform 0.5s";
moveCarousel();

});

prev.addEventListener("click", ()=>{

index--;
track.style.transition="transform 0.5s";
moveCarousel();

});

track.addEventListener("transitionend", ()=>{

if(cards[index].classList.contains("clone")){

track.style.transition="none";

if(index >= cards.length-2){
index = 2;
}

if(index <= 1){
index = cards.length-3;
}

moveCarousel();

}

});

moveCarousel();

});