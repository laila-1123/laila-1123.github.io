
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

function toggleMenu (){
    navMenu.classList.toggle('active');
}

navToggle.addEventListener('click', toggleMenu);