const endpoint = "https://randomfox.ca/floof/";

const imageElement = document.getElementById("fox-image");
const newPicBtn = document.getElementById("js-new-pic");
const favBtn = document.getElementById("favBtn");
const favoritesEl = document.getElementById("favorites");


async function foxImage(){
    try {
        const response = await fetch(endpoint);
        
        if(!response.ok) 
            throw new Error(response.statusText);
        const data = await response.json();
        const imageElement = document.getElementById("fox-image");
        const imageURL = data.image;
        imageElement.src = data.image;
        imageElement.alt = "Random fox"
    } catch (error) {
        console.log("error");
        alert('Failed to get new picture');
    }
}

function addFavorite (url) {
    if(!url) {
        alert("No fox yet! Click 'New picture!' first.");
        return;
    }
    const wrap = document.createElement("div");
    wrap.className = "fav";
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Favorited fox";
    wrap.addEventListener("click", () => wrap.remove());
    wrap.appendChild(img);
    favoritesEl.prepend(wrap);
}

function favoriteCurrent (){
    const url = imageElement.src;
    addFavorite(url);
}

window.addEventListener("load", foxImage);
newPicBtn.addEventListener("click", foxImage);
favBtn.addEventListener("click", favoriteCurrent);


