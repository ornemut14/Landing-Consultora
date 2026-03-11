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

const track = document.getElementById("track");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");

let cards = document.querySelectorAll(".card");

const cardWidth = 170;
const gap = 25;
const fullWidth = cardWidth + gap;

// CLONAR PARA LOOP
cards.forEach(card => {
  const firstClone = card.cloneNode(true);
  const lastClone = card.cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);
});

let allCards = document.querySelectorAll(".card");

const numOriginals = cards.length;

// empezamos en la primera original
let index = numOriginals;

function updateCarousel(instant = false){

  if(instant){
    track.style.transition = "none";
  }else{
    track.style.transition = "transform 0.5s ease";
  }

  const offset = (index - 2) * fullWidth;
  track.style.transform = `translateX(${-offset}px)`;

  allCards.forEach((card,i)=>{
    card.classList.toggle("active", i === index);
  });

}

next.addEventListener("click",()=>{

  index++;
  updateCarousel();

  if(index >= allCards.length - numOriginals){
    setTimeout(()=>{
      index = numOriginals;
      updateCarousel(true);
    },500);
  }

});

prev.addEventListener("click",()=>{

  index--;
  updateCarousel();

  if(index < numOriginals){
    setTimeout(()=>{
      index = allCards.length - numOriginals * 2;
      updateCarousel(true);
    },500);
  }

});

updateCarousel(true);




/* SCROLL SUAVE UNIFORME */

function smoothScroll(target, duration = 900){

const element = document.querySelector(target);
const targetPosition = element.offsetTop;
const startPosition = window.pageYOffset;
const distance = targetPosition - startPosition;

let startTime = null;

function animation(currentTime){

if(!startTime) startTime = currentTime;

const timeElapsed = currentTime - startTime;
const progress = Math.min(timeElapsed / duration, 5);

window.scrollTo(0, startPosition + distance * progress);

if(timeElapsed < duration){
requestAnimationFrame(animation);
}

}

requestAnimationFrame(animation);

}


document.querySelectorAll('a[href^="#"]').forEach(anchor => {

anchor.addEventListener("click", function(e){

e.preventDefault();

const target = this.getAttribute("href");

smoothScroll(target);

});

});



});