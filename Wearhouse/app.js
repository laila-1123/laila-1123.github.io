// ====== STORAGE KEYS ======
const USERS_KEY = "wearhouse_users";
const CURRENT_USER_KEY = "wearhouse_current_user";

// load users object (username -> data)
let users = JSON.parse(localStorage.getItem(USERS_KEY)) || {};
let currentUser = localStorage.getItem(CURRENT_USER_KEY) || null;

// ====== DOM ======
const loginScreen = document.getElementById("login-screen");
const loginForm = document.getElementById("login-form");
const navBar = document.querySelector(".top-nav");
const addItemBtn = document.getElementById("add-item-btn");
const mainEl = document.querySelector("main");
const navLinks = document.querySelectorAll(".nav-link");
const pages = document.querySelectorAll(".page-section");
const addItemModal = document.getElementById("add-item-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const itemForm = document.getElementById("item-form");
const itemsList = document.getElementById("items-list");

// make sure the floating button is visible and says +
if (addItemBtn) {
  addItemBtn.classList.remove("hidden");
  addItemBtn.textContent = "+";
}

// ====== HELPERS ======
function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserData() {
  if (!currentUser) return null;
  if (!users[currentUser]) {
    users[currentUser] = {
      password: "",
      items: [],
      outfits: []
    };
  }
  return users[currentUser];
}

// ====== SHOW / HIDE APP ======
function showApp() {
  loginScreen.classList.add("hidden");
  navBar.classList.remove("hidden");
  mainEl.classList.remove("hidden");

  // show floating +
  addItemBtn.classList.remove("hidden");
  addItemBtn.textContent = "+";
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  navBar.classList.add("hidden");
  mainEl.classList.add("hidden");

  // still show floating +
  addItemBtn.classList.remove("hidden");
  addItemBtn.textContent = "+";
}

// ====== AUTH ======
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();
    if (!username || !password) return;

    // create user if not exists
    if (!users[username]) {
      users[username] = {
        password: password,
        items: [],
        outfits: []
      };
    } else {
      if (users[username].password !== password) {
        alert("Wrong password.");
        return;
      }
    }

    currentUser = username;
    localStorage.setItem(CURRENT_USER_KEY, currentUser);
    saveUsers();

    loadUserData();
    showApp();
  });
}

// ====== STATE ======
let items = [];
let outfits = [];

function loadUserData() {
  const data = getCurrentUserData();
  if (!data) {
    items = [];
    outfits = [];
  } else {
    items = data.items || [];
    outfits = data.outfits || [];
  }
  renderItems();
  renderDashboard();
  renderOutfits();
}

function saveItemsForUser() {
  if (!currentUser) return;
  users[currentUser].items = items;
  saveUsers();
}

function saveOutfitsForUser() {
  if (!currentUser) return;
  users[currentUser].outfits = outfits;
  saveUsers();
}

// ====== MODAL ======
function openAddItemModal() {
  if (!currentUser) return; // require login
  addItemModal.classList.remove("hidden");
}
function closeAddItemModal() {
  addItemModal.classList.add("hidden");
}

addItemBtn.addEventListener("click", openAddItemModal);
closeModalBtn.addEventListener("click", closeAddItemModal);
addItemModal.addEventListener("click", (e) => {
  if (e.target === addItemModal) closeAddItemModal();
});

// ====== NAV ======
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("data-page");

    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    pages.forEach((page) => {
      if (page.id === target) page.classList.remove("hidden");
      else page.classList.add("hidden");
    });

    // button stays floating + on all pages now
  });
});

// ====== RENDER: CLOSET ======
function renderItems() {
  if (!itemsList) return;
  itemsList.innerHTML = "";

  if (items.length === 0) {
    itemsList.innerHTML = "<p>Your closet is empty. Add your first item 👚</p>";
    return;
  }

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item-card";

    const wears = item.wears || 0;
    const ppw = item.price && wears > 0 ? (item.price / wears).toFixed(2) : null;
    const conditionLabel = item.condition === "secondhand" ? "Secondhand" : "Bought new";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div style="font-size: 0.8rem; color: #666;">
          ${item.category || ""}${item.subcategory ? " • " + item.subcategory : ""}${item.brand ? " • " + item.brand : ""}
        </div>
        <div style="font-size: 0.8rem; color: #666;">
          ${item.color || ""}${item.price ? " • $" + item.price : ""}
        </div>
        <div style="font-size: 0.75rem; margin-top: 4px;">
          Condition: ${conditionLabel}
        </div>
        <div style="font-size: 0.75rem; margin-top: 4px;">
          Wears: ${wears} ${ppw ? "• PPW: $" + ppw : ""}
        </div>
      </div>
      <button data-id="${item.id}" class="wear-btn">Wore it</button>
    `;
    itemsList.appendChild(div);
  });

  document.querySelectorAll(".wear-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      incrementWear(id);
    });
  });
}

// ====== RENDER: DASHBOARD ======
function renderDashboard() {
  const homeStats = document.getElementById("home-stats");
  if (!homeStats) return;

  const totalItems = items.length;
  const totalWears = items.reduce((sum, item) => sum + (item.wears || 0), 0);

  homeStats.innerHTML = `
    <div style="display:flex; gap:1rem; flex-wrap:wrap;">
      <div style="background:#fff; padding:1rem; border-radius:0.75rem; flex:1; min-width:200px;">
        <h3 style="margin-top:0;">Total items</h3>
        <p style="font-size:1.5rem; font-weight:700;">${totalItems}</p>
      </div>
      <div style="background:#fff; padding:1rem; border-radius:0.75rem; flex:1; min-width:200px;">
        <h3 style="margin-top:0;">Total wears</h3>
        <p style="font-size:1.5rem; font-weight:700;">${totalWears}</p>
      </div>
    </div>
  `;
}

// ====== RENDER: OUTFITS ======
function renderOutfits() {
  const outfitsList = document.getElementById("outfits-list");
  if (!outfitsList) return;

  outfitsList.innerHTML = "";

  if (outfits.length === 0) {
    outfitsList.innerHTML = "<p>No outfits yet. Later you'll be able to build them from your closet.</p>";
    return;
  }

  outfits.forEach((outfit) => {
    const div = document.createElement("div");
    div.className = "item-card";
    div.innerHTML = `
      <div>
        <strong>${outfit.name}</strong>
        <div style="font-size:.8rem; color:#666;">
          Items: ${outfit.itemIds.length}
        </div>
      </div>
    `;
    outfitsList.appendChild(div);
  });
}

// ====== ITEM ACTIONS ======
function incrementWear(id) {
  items = items.map((item) => {
    if (item.id === id) {
      const currentWears = item.wears || 0;
      return { ...item, wears: currentWears + 1 };
    }
    return item;
  });
  saveItemsForUser();
  renderItems();
  renderDashboard();
}

// ====== FORM SUBMIT ======
if (itemForm) {
  itemForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const subcategory = document.getElementById("item-subcategory").value.trim();
    const brand = document.getElementById("item-brand").value.trim();
    const color = document.getElementById("item-color").value.trim();
    const priceRaw = document.getElementById("item-price").value;
    const condition = document.getElementById("item-condition").value;

    if (!name || !color) return;

    const price = priceRaw ? parseFloat(priceRaw) : null;

    const newItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      name,
      category,
      subcategory,
      brand,
      color,
      price,
      condition,
      wears: 0,
    };

    items.push(newItem);
    saveItemsForUser();
    renderItems();
    renderDashboard();
    itemForm.reset();
    document.getElementById("item-category").value = "tops";
    document.getElementById("item-condition").value = "new";
    closeAddItemModal();
  });
}

// ====== INITIAL LOAD ======
if (currentUser && users[currentUser]) {
  showApp();
  loadUserData();
} else {
  showLogin();
}
