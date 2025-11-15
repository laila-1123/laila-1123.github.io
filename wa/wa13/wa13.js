const articlesEL = document.getElementById("articles");
const statusEL = document.getElementById("status");
const categorySelect = document.getElementById("categorySelect");
const rememberFilterCheckbox = document.getElementById("rememberFilter");
const hideImagesCheckbox = document.getElementById("hideImages");
const clearPrefsBtn = document.getElementById("clearPrefs");
const darkModeCheckbox = document.getElementById("darkMode");
const controlsEl = document.querySelector(".controls");
const controlsToggle = document.getElementById("controlsToggle");


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
        statusEL.textContent = 
        "On most news sites, this choice would be stored on a server and added to your profile. Here, it stays only in your browser.";

    });
}

if (rememberFilterCheckbox) {
    rememberFilterCheckbox.addEventListener("change", () => {
        if (rememberFilterCheckbox.checked) {
            localStorage.setItem("rememberFilter", "true");
            statusEL.textContent = 
            "Most news sites permanently store your reading habits on their servers. Here, your preference stays on your device only.";
            if (categorySelect) {
            localStorage.setItem("newsCategory", categorySelect.value);
          }  
        } else {
            localStorage.setItem("rememberFilter", "false");
            localStorage.removeItem("newsCategory");
            statusEL.textContent = 
            "Preference syncing disabled — nothing is saved anywhere, not even locally.";

        }
    });
}

if (hideImagesCheckbox) {
    hideImagesCheckbox.addEventListener("change", () => {
        hideImages = hideImagesCheckbox.checked;
        localStorage.setItem("hideImages", hideImages);
        renderArticles(latestArticles, hideImages);
        statusEL.textContent =
        "On most news sites, even visual preferences are tracked to target ads. Here, this preference never leaves your browser.";

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
        statusEL.textContent = "Your preferences are fully erased. On many sites, the server would still keep a long-term history even after 'clearing' settings.";
    });
}

if (controlsToggle && controlsEl) {
  // Optional: restore previous state from localStorage
  const savedCollapsed = localStorage.getItem("controlsCollapsed");
  if (savedCollapsed === "false") {
    controlsEl.classList.remove("controls--collapsed");
    controlsToggle.setAttribute("aria-expanded", "true");
  }

  controlsToggle.addEventListener("click", () => {
    const isCollapsed = controlsEl.classList.toggle("controls--collapsed");
    const expanded = !isCollapsed;

    controlsToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    localStorage.setItem("controlsCollapsed", isCollapsed ? "true" : "false");

    statusEL.textContent = expanded
      ? "Controls expanded — on most sites these settings are buried but still heavily tracked."
      : "Controls hidden. Your settings are still stored locally only.";
  });
}

async function fetchNews(category = "") {
    // statusEL.textContent = "Loading news...";
    articlesEL.innerHTML = "";

    try {
        const baseUrl = "https://api.spaceflightnewsapi.net/v4/articles";
        const url = category 
        ? `${baseUrl}?title_contains=${encodeURIComponent(category)}`
        : baseUrl;

        const res = await fetch(url);
        const data = await res.json();
        latestArticles = data.results;
        renderArticles(latestArticles, hideImages);
      } catch (err) {
        console.error(err);
        statusEL.textContent = "Failed to load news. Try again."
    }
}

function renderArticles(articles, hideImages = false) {
  if (!articles || articles.length === 0) {
    articlesEL.innerHTML = "<p>No articles found.</p>";
    return;
  }

  articlesEL.innerHTML = articles
    .map((article) => {
      const shouldShowImg = !hideImages && article.image_url;
      const img = shouldShowImg
        ? `<img src="${article.image_url}" alt="">`
        : "";

      return `
        <article class="article">
          ${img}
          <h2>
            <a href="${article.url}" target="_blank" rel="noopener noreferrer">
              ${article.title}
            </a>
          </h2>
          <p>${article.summary || article.description || ""}</p>
          <small>${article.news_site || ""}</small>
        </article>
      `;
    })
    .join("");
}

const savedDark = localStorage.getItem("darkMode") === "true";
if (savedDark) {
  document.body.classList.add("dark");
}
if (darkModeCheckbox) {
  darkModeCheckbox.checked = savedDark;
}
if (darkModeCheckbox) {
  darkModeCheckbox.addEventListener("change", () => {
    const isDark = darkModeCheckbox.checked;
    if (isDark) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", isDark);
    statusEL.textContent =
    "Dark mode saved locally — real platforms often log this to profile your preferences.";

  });
}