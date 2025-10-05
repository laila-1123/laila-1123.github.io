
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

function toggleMenu (){
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !expanded);
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

document.getElementById('clear-data').addEventListener('click', () => {
    localStorage.clear();
    alert('Data cleared!');
});

function setTheme(theme) {
    const expiry = Date.now() + 100 *60*60*24;
    localStorage.setItem('userTheme', theme);
    localStorage.setItem('expiry', expiry);
    document.body.className = theme;
}

window.addEventListener('load', () => {
    const expiry = localStorage.getItem('expiry');
    if (expiry && Date.now () > expiry) {
        localStorage.clear ();
    }
    const savedTheme= localStorage.getItem('userTheme') || 'light';
    document.body.className = savedTheme;
})

const optOutCheckbox = document.getElementById("optOutCheckbox");
optOutCheckbox.checked = localStorage.getItem("optOut") === "true";

optOutCheckbox.addEventListener("change", () => {
    localStorage.setItem("optOut", optOutCheckbox.checked);
    if (optOutCheckbox.checked) {
        localStorage.clear();
    }
});

function savedTheme (theme) {
    const optOut = localStorage.getItem("optOut") === "true" ;
    if (!optOut) {
        localStorage.setItem("theme", theme);
    }
}