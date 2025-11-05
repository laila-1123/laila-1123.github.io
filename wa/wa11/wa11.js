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

async function fetchNews() {
    statusEL.textContent = "Loading news...";
    articlesEL.innerHTML = "";

    try {
        const res = await fetch ("https://api.spaceflightnewsapi.net/v4/articles");
        const data = await res.json();
        latestArticles = data.results;
        renderArticles(latestArticles, hideImages);
      } catch (err) {
        console.error(err);
        statusEL.textContent = "Failed to load news. Try again."
    }
}

function renderArticles(articles, hideImages = false) {
    if (!articles || articles.length == 0) {
        articlesEL.innerHTML = "";
        return;
    }
    
  articlesEL.innerHTML = articles
    .map((article) => {
      const img = !hideImages && article.image_url
          ? `<img src="${article.image_url}" alt="article image" />`
          : "";
      return `
        <article class="article">
          ${img}
          <h2><a href="${article.url}" target="_blank" rel="noopener noreferrer">${article.title}</a></h2>
          <p>${article.description || ""}</p>
          <small>${article.news_site || ""}</small>
        </article>
      `;
    })
    .join("");
}