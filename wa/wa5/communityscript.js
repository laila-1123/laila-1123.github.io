
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
    button.setAttribute("aria-pressed", "false");
    button.addEventListener('click', (event) => {
        const filter = button.getAttribute("data-filter");
        
        if (activeFilter === filter) {
            activeFilter = null;
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
            books.forEach(book => book.style.display = "");
            return;
        }
        
        activeFilter = filter;

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        });
            
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
        
    
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

document.addEventListener("keydown", (e) => {
    if(e.key.toLocaleLowerCase() ==="f") {
        document.querySelector("[data-filter='fiction']").click();
    } else if (e.key.toLocaleLowerCase()=== "n") {
        document.querySelector("[data-filter='nonfiction']").click();
    
    }
})

// Save user's theme choice
function setTheme(theme) {
    localStorage.setItem('userTheme', theme);
    document.body.className = theme;
}

// Load saved theme on page load
window.addEventListener('load', function() {
    const savedTheme = localStorage.getItem('userTheme') || 'light';
    document.body.className = savedTheme;
});