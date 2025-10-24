const endpoint = "https://randomfox.ca/floof/";

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

window.addEventListener("load", foxImage);

document
    .getElementById("js-new-pic")
    .addEventListener('click', foxImage);