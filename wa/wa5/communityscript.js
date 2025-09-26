
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

function toggleMenu (){
    navMenu.classList.toggle('active');
}

navToggle.addEventListener('click', toggleMenu);

const filterButtons = document.querySelectorAll(".filter-buttons button");
const books = document.querySelectorAll(".book");
let activeFilter = null

filterButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        const filter = button.getAttribute("data-filter");
        
        if (activeFilter === filter) {
            activeFilter = null;
            button.classList.remove("active");
            books.forEach(book => book.style.display = "");
            return;
        }
        
        activeFilter = filter;

        filterButtons.forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");
        
        //filtering
        books.forEach(book => {
            if (filter === 'all' || book.getAttribute("data-genre") === filter) {
        book.style.display = '';
        } else {
        book.style.display = 'none';
        }
    });
});
});