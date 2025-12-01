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
}

function showLogin() {
  loginScreen.classList.remove("hidden");
  navBar.classList.add("hidden");
  mainEl.classList.add("hidden");

  // still show floating +
  addItemBtn.classList.remove("hidden");
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
  const totalInvestment = items.reduce(
    (sum, item) => sum + (typeof item.price === "number" ? item.price : 0),
    0
  );

  const formatCurrency = (value) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const byMostWorn = [...items]
    .filter((item) => (item.wears || 0) > 0)
    .sort((a, b) => (b.wears || 0) - (a.wears || 0))
    .slice(0, 3);

  const byLeastWorn = [...items]
    .sort((a, b) => (a.wears || 0) - (b.wears || 0))
    .slice(0, 3);

  const ppwItems = items
    .filter((item) => typeof item.price === "number" && (item.wears || 0) > 0)
    .map((item) => ({
      ...item,
      ppw: item.price / (item.wears || 1),
    }));

  const highestPpw = ppwItems.length
    ? [...ppwItems].sort((a, b) => b.ppw - a.ppw)[0]
    : null;
  const lowestPpw = ppwItems.length
    ? [...ppwItems].sort((a, b) => a.ppw - b.ppw)[0]
    : null;

  const categoryCounts = items.reduce((acc, item) => {
    const cat = item.category || "Other";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const colors = [
    "#43309f",
    "#ff9f1c",
    "#2ec4b6",
    "#e56b6f",
    "#118ab2",
    "#f25f5c",
    "#8d99ae",
  ];

  const categoryEntries = Object.entries(categoryCounts);
  let start = 0;
  const pieSegments = categoryEntries.map(([cat, count], idx) => {
    const percent = totalItems ? Math.round((count / totalItems) * 1000) / 10 : 0;
    const end = start + (totalItems ? (count / totalItems) * 100 : 0);
    const color = colors[idx % colors.length];
    const segment = `${color} ${start}% ${end}%`;
    start = end;
    return { cat, count, percent, color, segment };
  });

  const gradient =
    pieSegments.length > 0
      ? `conic-gradient(${pieSegments.map((p) => p.segment).join(", ")})`
      : "#f1eee9";

  const renderList = (list, emptyText, valueFormatter) => {
    if (!list.length) return `<p class="dash-subtext">${emptyText}</p>`;
    return `
      <ul class="dash-list">
        ${list
          .map(
            (item) => `
              <li>
                <span>${item.name}</span>
                <span class="pill">${valueFormatter(item)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  };

  homeStats.innerHTML = `
    <div class="dashboard-grid">
      <div class="dash-card">
        <h3>Total items</h3>
        <p class="dash-value">${totalItems}</p>
        <p class="dash-subtext">Everything in your wardrobe. Wears logged: ${totalWears}</p>
      </div>

      <div class="dash-card">
        <h3>Total investment</h3>
        <p class="dash-value">${formatCurrency(totalInvestment)}</p>
        <p class="dash-subtext">Sum of item prices you've entered.</p>
      </div>

      <div class="dash-card">
        <h3>Most worn</h3>
        ${renderList(byMostWorn, "No wears yet.", (item) => `${item.wears || 0} wears`)}
      </div>

      <div class="dash-card">
        <h3>Least worn</h3>
        ${renderList(byLeastWorn, "Add items to track wears.", (item) => `${item.wears || 0} wears`)}
      </div>

      <div class="dash-card">
        <h3>Highest price per wear</h3>
        ${
          highestPpw
            ? `<p class="dash-value">${formatCurrency(highestPpw.ppw)}</p><p class="dash-subtext">${highestPpw.name}</p>`
            : `<p class="dash-subtext">Need prices and wears to calculate.</p>`
        }
      </div>

      <div class="dash-card">
        <h3>Lowest price per wear</h3>
        ${
          lowestPpw
            ? `<p class="dash-value">${formatCurrency(lowestPpw.ppw)}</p><p class="dash-subtext">${lowestPpw.name}</p>`
            : `<p class="dash-subtext">Need prices and wears to calculate.</p>`
        }
      </div>

      <div class="dash-card chart-card">
        <div class="pie" style="background: ${gradient};">
          <div class="pie-label">
            ${totalItems ? `${totalItems} items` : "No data"}
          </div>
        </div>
        <div>
          <h3 style="margin-top:0;">Wardrobe by category</h3>
          <div class="legend">
            ${
              pieSegments.length
                ? pieSegments
                    .map(
                      (seg) => `
                        <div class="legend-row">
                          <span class="legend-swatch" style="background:${seg.color};"></span>
                          <span>${seg.cat} (${seg.count}) — ${seg.percent}%</span>
                        </div>
                      `
                    )
                    .join("")
                : '<p class="dash-subtext">Add items to see the mix.</p>'
            }
          </div>
        </div>
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
