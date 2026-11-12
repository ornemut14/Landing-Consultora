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

const numOriginals = cards.length;

function getMetrics(){
  const cardEl = track.querySelector(".card");
  const realWidth = cardEl.offsetWidth;
  const realGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--card-gap'));
  return { realWidth, realGap, fullWidth: realWidth + realGap };
}

// CLONAR PARA LOOP (los clones son solo visuales: se ocultan a lectores de pantalla)
cards.forEach(card => {
  const firstClone = card.cloneNode(true);
  const lastClone = card.cloneNode(true);

  [firstClone, lastClone].forEach(clone => {
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("alt", "");
  });

  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);
});

let allCards = document.querySelectorAll(".card");

let index = numOriginals;

function updateCarousel(instant = false){

  const { realWidth, realGap, fullWidth } = getMetrics();
  const wrapperWidth = document.querySelector('.carousel-wrapper').offsetWidth;
  const centerOffset = (wrapperWidth / 2) - (realWidth / 2);
  const offset = index * fullWidth - centerOffset;

  if(instant){
    track.style.transition = "none";
  }else{
    track.style.transition = "transform 0.5s ease";
  }

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

window.addEventListener("resize", ()=>{
  updateCarousel(true);
});


/* SCROLL SUAVE UNIFORME */

function smoothScroll(target, duration = 900){

const element = document.querySelector(target);
const navbarOffset = 100; /* altura del navbar fijo + aire */
const targetPosition = Math.max(0, element.offsetTop - navbarOffset);
const startPosition = window.pageYOffset;
const distance = targetPosition - startPosition;

let startTime = null;

function animation(currentTime){

if(!startTime) startTime = currentTime;

const timeElapsed = currentTime - startTime;
const progress = Math.min(timeElapsed / duration, 1);

window.scrollTo(0, startPosition + distance * progress);

if(timeElapsed < duration){
requestAnimationFrame(animation);
}

}

requestAnimationFrame(animation);

}


document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(anchor => {

anchor.addEventListener("click", function(e){

e.preventDefault();

const target = this.getAttribute("href");

smoothScroll(target);

});

});



});