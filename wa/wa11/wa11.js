const API_KEY = "41e7a1f19f9247239d1070504bd52138"
const BASE_URL = "https://newsapi.org/v2/top-headlines"

const articlesEL = document.getElementById("articles");
const statusEL = document.getElementById("status");
const categorySelect = document.getElementById("categorySelect");
const rememberFilterCheckbox = document.getElementById("rememberFilter");
const hideImagesCheckbox = document.getElementById("hideImages");
const clearPrefsBtn = document.getElementById("clearPrefs");

let latestArticles = [];
let hideImages = false;

const savedRemember = localStorage.getItem("rememberFilter") === "true"; 
if (rememberFilterCheckbox) {
    rememberFilterCheckbox.checked = savedRemember;
}

const savedCategory = localStorage.getItem("newsCategory");
if (savedCategory && savedRemember && categorySelect) {
    categorySelect.value = savedCategory;
    fetchNews(savedCategory);
}else {
    fetchNews((categorySelect && categorySelect.value) || "");
}
 

const savedHideImages = localStorage.getItem("hideImages") === "true";
if (hideImagesCheckbox) {
    hideImagesCheckbox.checked = savedHideImages;
}
hideImages = savedHideImages;

if (categorySelect) {
    categorySelect.addEventListener("change", () => {
        const selected = categorySelect.value;

        if (rememberFilterCheckbox && rememberFilterCheckbox.checked) {
            localStorage.setItem("newsCategory", selected);
        }
        fetchNews(selected);
    });
}

if (rememberFilterCheckbox) {
    rememberFilterCheckbox.addEventListener("change", () => {
        if (rememberFilterCheckbox.checked) {
            localStorage.setItem("rememberFilter", "true");
            if (categorySelect) {
            localStorage.setItem("newsCategory", categorySelect.value);
          }  
        } else {
            localStorage.setItem("rememberFilter", "false");
            localStorage.removeItem("newsCategory");
        }
    });
}

if (hideImagesCheckbox) {
    hideImagesCheckbox.addEventListener("change", () => {
        hideImages = hideImagesCheckbox.checked;
        localStorage.setItem("hideImages", hideImages);
        renderArticles(latestArticles, hideImages);
    });
}

if (clearPrefsBtn) {
    clearPrefsBtn.addEventListener("click", () => {
        localStorage.removeItem("rememberFilter");
        localStorage.removeItem("newsCategory");
        localStorage.removeItem("hideImages");

        if (rememberFilterCheckbox) rememberFilterCheckbox.checked = false;
        if (hideImagesCheckbox) hideImagesCheckbox.checked = false;

        hideImages = false;
        statusEL.textContent = "Preferences cleared (stored locally only";
    });
}

async function fetchNews(category="") {
    statusEL.textContent = "Loading news...";
    articlesEL.innerHTML = "";

    const params = new URLSearchParams ({
        country: "us",
        apiKey: API_KEY,
    });
    if (category) params.append ("category", category);

    try {
        const res = await fetch (`${BASE_URL}?${params.toString()}`);
        if (!res.ok) throw new Error("Network response was not ok");

        const data = await res.json();

        if (!data.articles || data.articles.length === 0 ) {
            statusEL.textContent = "No articles found for this category.";
            latestArticles = [];
            renderArticles([], hideImages);
            return;
        } 
        
        statusEL.textContent = "";
        latestArticles = data.articles;
        renderArticles(latestArticles, hideImages);
      } catch (err) {
        console.error(err);
        statusEL.textContent = "Failed to load news. Try again."
        latestArticles = []
        renderArticles([], hideImages);
    }
}

function renderArticles(articles, hideImages = false) {
    if (!articles || articles.length == 0) {
        articlesEL.innerHTML = "";
        return;
    }
    
  articlesEL.innerHTML = articles
    .map((article) => {
      const img = 
        !hideImages && article.urlToImage
          ? `<img src="${article.urlToImage}" alt="article image" />`
          : "";
      return `
        <article class="article">
          ${img}
          <h2><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h2>
          <p>${article.description || ""}</p>
          <small>${article.source?.name || ""}</small>
        </article>
      `;
    })
    .join("");
}