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
const itemFormTitle = document.getElementById("item-form-title");
const itemFormSubmit = document.getElementById("item-form-submit");
const itemsList = document.getElementById("items-list");
const closetNavLink = document.querySelector('.nav-link[data-page="closet"]');
const filterCategory = document.getElementById("filter-category");
const filterSubcategory = document.getElementById("filter-subcategory");
const filterColor = document.getElementById("filter-color");
const itemPhotoInput = document.getElementById("item-photo");
const sellForm = document.getElementById("sell-form");
const sellSelect = document.getElementById("sell-item");
const sellPriceInput = document.getElementById("sell-price");
const sellListEl = document.getElementById("sell-list");

// make sure the floating button is visible and says +
if (addItemBtn) {
  addItemBtn.classList.remove("hidden");
}

// ====== HELPERS ======
function generateId() {
  const cryptoObj = typeof crypto !== "undefined" ? crypto : null;
  if (cryptoObj && cryptoObj.randomUUID) return cryptoObj.randomUUID();
  return `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

function toTitleCase(str) {
  const lower = (str || "").toString().toLowerCase();
  const contractions = ["'s", "'t", "'m", "'d", "'re", "'ve", "'ll"];
  return lower.replace(/\b\w/g, (c, i) => {
    if (i > 0 && lower[i - 1] === "'") {
      const slice = lower.slice(i - 1, i + 2);
      if (contractions.some((contraction) => slice.startsWith(contraction))) {
        return c;
      }
    }
    return c.toUpperCase();
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const PLACEHOLDER_ICONS = {
  tops: "img/shirt.webp",
  bottoms: "img/bottoms.png",
  shoes: "img/shoe.png",
  outerwear: "img/outerwear.png",
  dresses: "img/dres.png",
  accessories: "img/accessory.png",
  other: "img/shirt.webp",
};

function getPlaceholderForCategory(category) {
  const key = (category || "other").toString().toLowerCase();
  return PLACEHOLDER_ICONS[key] || PLACEHOLDER_ICONS.other;
}

function saveUsers() {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserData() {
  if (!currentUser) return null;
  if (!users[currentUser]) {
    users[currentUser] = {
      password: "",
      items: [],
      outfits: [],
      sellList: []
    };
  }
  const data = users[currentUser];
  if (!Array.isArray(data.items)) data.items = [];
  if (!Array.isArray(data.outfits)) data.outfits = [];
  if (!Array.isArray(data.sellList)) data.sellList = [];
  return data;
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
        outfits: [],
        sellList: []
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
let editingItemId = null;
let filters = {
  category: "",
  subcategory: "",
  color: "",
};
let sellList = [];

function loadUserData() {
  const data = getCurrentUserData();
  if (!data) {
    items = [];
    outfits = [];
    sellList = [];
  } else {
    items = data.items || [];
    outfits = data.outfits || [];
    sellList = data.sellList || [];
  }
  renderItems();
  renderDashboard();
  renderOutfits();
  renderSellBox();
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

function saveSellListForUser() {
  if (!currentUser) return;
  users[currentUser].sellList = sellList;
  saveUsers();
}

// ====== MODAL ======
function openAddItemModal() {
  if (!currentUser) return; // require login
  addItemModal.classList.remove("hidden");
}
function closeAddItemModal() {
  addItemModal.classList.add("hidden");
  startAddMode();
}

function startAddMode() {
  editingItemId = null;
  if (itemForm) {
    itemForm.reset();
    document.getElementById("item-category").value = "tops";
    document.getElementById("item-condition").value = "new";
    const wearsInput = document.getElementById("item-wears");
    if (wearsInput) wearsInput.value = 0;
    if (itemPhotoInput) itemPhotoInput.value = "";
  }
  if (itemFormTitle) itemFormTitle.textContent = "Add an item";
  if (itemFormSubmit) itemFormSubmit.textContent = "Add item";
}

function handleAddItemClick() {
  startAddMode();
  openAddItemModal();
}

addItemBtn.addEventListener("click", handleAddItemClick);
closeModalBtn.addEventListener("click", closeAddItemModal);
addItemModal.addEventListener("click", (e) => {
  if (e.target === addItemModal) closeAddItemModal();
});

// ====== NAV ======
function showPage(target) {
  navLinks.forEach((link) => {
    const page = link.getAttribute("data-page");
    if (page === target) link.classList.add("active");
    else link.classList.remove("active");
  });

  pages.forEach((page) => {
    if (page.id === target) page.classList.remove("hidden");
    else page.classList.add("hidden");
  });

  if (target === "closet") renderItems();
  if (target === "home") renderDashboard();
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.getAttribute("data-page");
    showPage(target);
    // button stays floating + on all pages now
  });
});

// ====== RENDER: CLOSET ======
function renderItems() {
  if (!itemsList) return;
  updateFilterOptions();
  const filteredItems = getFilteredItems();
  itemsList.innerHTML = "";

  if (filteredItems.length === 0) {
    const emptyMsg =
      items.length === 0
        ? "Your closet is empty. Add your first item 👚"
        : "No items match these filters.";
    itemsList.innerHTML = `<p>${emptyMsg}</p>`;
    return;
  }

    filteredItems.forEach((item) => {
    const div = document.createElement("div");
    div.className = "item-card";

    const wears = item.wears || 0;
    const hasPrice = typeof item.price === "number" ? item.price > 0 : Boolean(item.price);
    const ppw = hasPrice && wears > 0 ? (item.price / wears).toFixed(2) : null;
    const statsLine = ppw ? `PPW: $${ppw}` : `Wears: ${wears}`;
    const placeholder = getPlaceholderForCategory(item.category);
    const photoElement = item.imageData
      ? `<img class="item-photo" src="${item.imageData}" alt="${toTitleCase(item.name)}">`
      : `<div class="item-photo" aria-hidden="true" style="background-image:url('${placeholder}');"></div>`;
    const photoHtml = `
      <div class="item-photo-wrap">
        ${photoElement}
        <button data-id="${item.id}" class="wear-btn photo-wear-label">Log wear</button>
      </div>
    `;

    div.innerHTML = `
      ${photoHtml}
      <div class="item-card__body">
        <div class="item-card__top">
          <div class="item-title">
            <strong>${toTitleCase(item.name)}</strong>
            ${item.brand ? `<span class="item-brand">${toTitleCase(item.brand)}</span>` : ""}
          </div>
          <p class="item-meta-line item-stat-line">${statsLine}</p>
        </div>
        <div class="item-actions">
          <div class="item-menu">
            <button class="item-menu-toggle" aria-label="More options" aria-expanded="false">⋯</button>
            <div class="item-menu-options hidden">
              <button data-id="${item.id}" class="set-wears-btn">Set wears</button>
              <button data-id="${item.id}" class="details-btn">See details</button>
              <button data-id="${item.id}" class="edit-btn">Edit</button>
              <button data-id="${item.id}" class="delete-btn danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `;
    itemsList.appendChild(div);
  });

  document.querySelectorAll(".wear-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      incrementWear(id);
    });
  });

  document.querySelectorAll(".set-wears-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      setWears(id);
    });
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      startEditItem(id);
    });
  });

  document.querySelectorAll(".details-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      startEditItem(id);
    });
  });

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      deleteItem(id);
    });
  });

  document.querySelectorAll(".item-menu-toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = btn.nextElementSibling;
      const isOpen = menu && !menu.classList.contains("hidden");
      closeAllMenus();
      if (menu && !isOpen) {
        menu.classList.remove("hidden");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  renderSellBox();
}

// Sell list UI for closet
function renderSellBox() {
  if (!sellSelect || !sellListEl) return;

  const alreadySelling = new Set(sellList.map((entry) => entry.itemId));
  const availableItems = items.filter((item) => !alreadySelling.has(item.id));
  const previousSelection = sellSelect.value;

  sellSelect.innerHTML = `<option value="">Select an item</option>`;
  availableItems.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = toTitleCase(item.name || "Untitled item");
    sellSelect.appendChild(option);
  });

  if (availableItems.some((item) => item.id === previousSelection)) {
    sellSelect.value = previousSelection;
  } else {
    sellSelect.value = "";
  }

  sellSelect.disabled = availableItems.length === 0;
  if (sellPriceInput) sellPriceInput.disabled = availableItems.length === 0;

  if (sellList.length === 0) {
    const emptyMsg =
      items.length === 0
        ? "Add items to your closet to start a sell list."
        : "Nothing on your sell list yet.";
    sellListEl.innerHTML = `<p class="dash-subtext" style="margin:0;">${emptyMsg}</p>`;
    return;
  }

  const formatPrice = (value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return "";
    return `$${num.toFixed(2)}`;
  };

  sellListEl.innerHTML = sellList
    .map((entry) => {
      const item = items.find((i) => i.id === entry.itemId);
      const name = item ? toTitleCase(item.name) : "Item not in closet";
      const details = item
        ? [toTitleCase(item.category), toTitleCase(item.color)].filter(Boolean).join(" • ")
        : "Removed from closet";
      const priceText = entry.price ? ` • Target ${formatPrice(entry.price)}` : "";
      return `
        <div class="sell-card">
          <div>
            <strong>${name}</strong>
            <div class="sell-card__meta">${details}${priceText}</div>
          </div>
          <button class="sell-remove-btn" data-item-id="${entry.itemId}">Remove</button>
        </div>
      `;
    })
    .join("");

  sellListEl.querySelectorAll(".sell-remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-item-id");
      sellList = sellList.filter((entry) => entry.itemId !== id);
      saveSellListForUser();
      renderSellBox();
    });
  });
}

function addToSellList(itemId, price = null) {
  if (!itemId) return;
  sellList = sellList.filter((entry) => entry.itemId !== itemId);
  sellList.push({ itemId, price });
  saveSellListForUser();
  renderSellBox();
  renderDashboard();
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
    .filter((item) => typeof item.price === "number" && item.price > 0 && (item.wears || 0) > 0)
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

  const normalizeCategoryKey = (value) =>
    value && value.toString().trim().length ? value.toString().trim().toLowerCase() : "other";

  const categoryCounts = items.reduce((acc, item) => {
    const key = normalizeCategoryKey(item.category || "Other");
    const label = key ? toTitleCase(key) : "Other";
    if (!acc[key]) acc[key] = { count: 0, label };
    acc[key].count += 1;
    return acc;
  }, {});

  const conditionCounts = items.reduce(
    (acc, item) => {
      const label = item.condition === "secondhand" ? "Secondhand" : "Bought new";
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    },
    { "Bought new": 0, Secondhand: 0 }
  );

  const colors = [
    "#43309f",
    "#ff9f1c",
    "#2ec4b6",
    "#e56b6f",
    "#118ab2",
    "#f25f5c",
    "#8d99ae",
  ];

  const categoryEntries = Object.values(categoryCounts);
  let start = 0;
  const pieSegments = categoryEntries.map((entry, idx) => {
    const percent = totalItems ? Math.round((entry.count / totalItems) * 1000) / 10 : 0;
    const end = start + (totalItems ? (entry.count / totalItems) * 100 : 0);
    const color = colors[idx % colors.length];
    const segment = `${color} ${start}% ${end}%`;
    start = end;
    return { cat: entry.label, count: entry.count, percent, color, segment };
  });

  const gradient =
    pieSegments.length > 0
      ? `conic-gradient(${pieSegments.map((p) => p.segment).join(", ")})`
      : "#f1eee9";

  // new vs secondhand chart
  const conditionEntries = Object.entries(conditionCounts);
  let condStart = 0;
  const conditionColors = ["#43309f", "#ff9f1c"];
  const conditionSegments = conditionEntries.map(([label, count], idx) => {
    const percent = totalItems ? Math.round((count / totalItems) * 1000) / 10 : 0;
    const end = condStart + (totalItems ? (count / totalItems) * 100 : 0);
    const color = conditionColors[idx % conditionColors.length];
    const segment = `${color} ${condStart}% ${end}%`;
    condStart = end;
    return { label, count, percent, color, segment };
  });

  const conditionGradient =
    conditionSegments.length > 0
      ? `conic-gradient(${conditionSegments.map((p) => p.segment).join(", ")})`
      : "#f1eee9";

  const renderHoverLabels = (segments, labelFormatter, emptyText) => {
    if (!segments.length) return `<p class="dash-subtext" style="margin:0;">${emptyText}</p>`;
    return `
      <ul class="hover-list">
        ${segments
          .map(
            (seg) => `
              <li>
                <span class="hover-swatch" style="background:${seg.color};"></span>
                <span>${labelFormatter(seg)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  };

  const renderList = (list, emptyText, valueFormatter) => {
    if (!list.length) return `<p class="dash-subtext">${emptyText}</p>`;
    return `
      <ul class="dash-list">
        ${list
          .map(
            (item) => `
              <li>
                <span>${toTitleCase(item.name)}</span>
                <span class="pill">${valueFormatter(item)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  };

  const renderQuickSellList = (list, emptyText, valueFormatter) => {
    if (!list.length) return `<p class="dash-subtext">${emptyText}</p>`;
    const alreadySelling = new Set(sellList.map((entry) => entry.itemId));
    return `
      <ul class="dash-list quick-sell-list">
        ${list
          .map((item) => {
            const isSelling = alreadySelling.has(item.id);
            const buttonText = isSelling ? "On sell list" : "Add to sell list";
            return `
              <li>
                <span>${toTitleCase(item.name)}</span>
                <span class="pill">${valueFormatter(item)}</span>
                <button class="quick-sell-btn" data-id="${item.id}" type="button" ${
                  isSelling ? "disabled" : ""
                }>${buttonText}</button>
              </li>
            `;
          })
          .join("")}
      </ul>
    `;
  };

  homeStats.innerHTML = `
    <div class="dashboard-top">
      <div class="dash-card">
        <h3>Total items</h3>
        <p class="dash-value">${totalItems}</p>
      </div>

      <div class="dash-card">
        <h3>Total investment</h3>
        <p class="dash-value">${formatCurrency(totalInvestment)}</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dash-card">
        <h3>Most worn</h3>
        ${renderList(byMostWorn, "No wears yet.", (item) => `${item.wears || 0} wears`)}
      </div>

      <div class="dash-card">
        <h3>Least worn</h3>
        ${renderQuickSellList(
          byLeastWorn,
          "Add items to track wears.",
          (item) => `${item.wears || 0} wears`
        )}
      </div>

      <div class="dash-card">
        <h3>Price per wear</h3>
        <div class="ppw-split">
          <div>
            <p class="ppw-label">Highest</p>
            ${
              highestPpw
                ? `<p class="dash-value">${formatCurrency(highestPpw.ppw)}</p><p class="dash-subtext">${toTitleCase(highestPpw.name)}</p>`
                : `<p class="dash-subtext">Need prices and wears.</p>`
            }
          </div>
          <div>
            <p class="ppw-label">Lowest</p>
            ${
              lowestPpw
                ? `<p class="dash-value">${formatCurrency(lowestPpw.ppw)}</p><p class="dash-subtext">${toTitleCase(lowestPpw.name)}</p>`
                : `<p class="dash-subtext">Need prices and wears.</p>`
            }
          </div>
        </div>
      </div>

      <div class="dash-card chart-card">
        <div class="chart-block">
          <h3>New vs secondhand</h3>
          <div class="chart-hover-wrap">
            <div class="pie" style="background: ${conditionGradient};"></div>
            <div class="pie-hover-labels">
              ${renderHoverLabels(
                conditionSegments,
                (seg) => `${seg.label} (${seg.count}) — ${seg.percent}%`,
                "Add condition info to see the mix."
              )}
            </div>
          </div>
        </div>
        <div class="chart-block">
          <h3>Wardrobe by category</h3>
          <div class="chart-hover-wrap">
            <div class="pie" style="background: ${gradient};"></div>
            <div class="pie-hover-labels">
              ${renderHoverLabels(
                pieSegments,
                (seg) => `${toTitleCase(seg.cat)} (${seg.count}) — ${seg.percent}%`,
                "Add items to see the mix."
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  homeStats.querySelectorAll(".quick-sell-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      addToSellList(id);
    });
  });
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
        <strong>${toTitleCase(outfit.name)}</strong>
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

function setWears(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  const input = prompt("Set wears to:", item.wears || 0);
  if (input === null) return;
  const value = parseInt(input, 10);
  if (Number.isNaN(value) || value < 0) {
    alert("Please enter a valid non-negative number.");
    return;
  }
  items = items.map((i) => (i.id === id ? { ...i, wears: value } : i));
  saveItemsForUser();
  renderItems();
  renderDashboard();
}

function startEditItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  editingItemId = id;
  if (itemFormTitle) itemFormTitle.textContent = "Edit item";
  if (itemFormSubmit) itemFormSubmit.textContent = "Save changes";
  document.getElementById("item-name").value = item.name || "";
  document.getElementById("item-category").value = item.category || "tops";
  document.getElementById("item-subcategory").value = item.subcategory || "";
  document.getElementById("item-brand").value = item.brand || "";
  document.getElementById("item-color").value = item.color || "";
  document.getElementById("item-price").value = item.price ?? "";
  const wearsInput = document.getElementById("item-wears");
  if (wearsInput) wearsInput.value = item.wears || 0;
  document.getElementById("item-condition").value = item.condition || "new";
  if (itemPhotoInput) itemPhotoInput.value = "";
  openAddItemModal();
}

function deleteItem(id) {
  const item = items.find((i) => i.id === id);
  if (!item) return;
  const confirmDelete = confirm(`Delete "${item.name}" from your closet?`);
  if (!confirmDelete) return;
  items = items.filter((i) => i.id !== id);
  // also drop from sell list so the box stays in sync
  sellList = sellList.filter((entry) => entry.itemId !== id);
  saveItemsForUser();
  saveSellListForUser();
  renderItems();
  renderDashboard();
  renderSellBox();
}

function closeAllMenus() {
  document.querySelectorAll(".item-menu-options").forEach((menu) => {
    menu.classList.add("hidden");
  });
  document.querySelectorAll(".item-menu-toggle").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
  });
}

// close item menus when clicking elsewhere
document.addEventListener("click", (e) => {
  if (!e.target.closest(".item-menu")) {
    closeAllMenus();
  }
});

// ====== FILTERS ======
function updateFilterOptions() {
  if (!filterCategory || !filterSubcategory || !filterColor) return;

  const setSelectOptions = (select, options, defaultLabel, currentValue) => {
    const prev = currentValue || select.value || "";
    select.innerHTML = `<option value="">${defaultLabel}</option>`;
    options.forEach((opt) => {
      const optionEl = document.createElement("option");
      optionEl.value = opt;
      optionEl.textContent = toTitleCase(opt);
      select.appendChild(optionEl);
    });
    if ([...select.options].some((o) => o.value === prev)) {
      select.value = prev;
    } else {
      select.value = "";
    }
  };

  const uniqueSorted = (arr) => {
    const map = new Map();
    arr.forEach((v) => {
      const cleaned = v ? v.toString().trim() : "";
      if (!cleaned) return;
      const key = cleaned.toLowerCase();
      if (!map.has(key)) map.set(key, cleaned);
    });
    return [...map.values()].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    );
  };

  const categories = uniqueSorted(items.map((i) => i.category));
  const subcategories = uniqueSorted(items.map((i) => i.subcategory));
  const colors = uniqueSorted(items.map((i) => i.color));

  setSelectOptions(filterCategory, categories, "All categories", filters.category);
  setSelectOptions(filterSubcategory, subcategories, "All subcategories", filters.subcategory);
  setSelectOptions(filterColor, colors, "All colors", filters.color);
}

function getFilteredItems() {
  const match = (value, filter) =>
    !filter || (value || "").toString().toLowerCase() === filter.toLowerCase();
  return items.filter(
    (item) =>
      match(item.category, filters.category) &&
      match(item.subcategory, filters.subcategory) &&
      match(item.color, filters.color)
  );
}

function handleFilterChange() {
  filters = {
    category: filterCategory ? filterCategory.value : "",
    subcategory: filterSubcategory ? filterSubcategory.value : "",
    color: filterColor ? filterColor.value : "",
  };
  renderItems();
}

if (filterCategory) filterCategory.addEventListener("change", handleFilterChange);
if (filterSubcategory) filterSubcategory.addEventListener("change", handleFilterChange);
if (filterColor) filterColor.addEventListener("change", handleFilterChange);

// ====== SELL LIST ======
if (sellForm) {
  sellForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selectedId = sellSelect ? sellSelect.value : "";
    if (!selectedId) return;

    const priceRaw = sellPriceInput ? sellPriceInput.value.trim() : "";
    const price = priceRaw ? parseFloat(priceRaw) : null;
    if (priceRaw && Number.isNaN(price)) {
      alert("Enter a valid price or leave it blank.");
      return;
    }

    // Prevent duplicates; update price if they re-add
    sellList = sellList.filter((entry) => entry.itemId !== selectedId);
    sellList.push({ itemId: selectedId, price: price });
    saveSellListForUser();
    if (sellPriceInput) sellPriceInput.value = "";
    if (sellSelect) sellSelect.value = "";
    renderSellBox();
  });
}

// ====== FORM SUBMIT ======
if (itemForm) {
  itemForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("item-name").value.trim();
    const category = document.getElementById("item-category").value;
    const subcategory = document.getElementById("item-subcategory").value.trim();
    const brand = document.getElementById("item-brand").value.trim();
    const color = document.getElementById("item-color").value.trim();
    const priceRaw = document.getElementById("item-price").value;
    const wearsRaw = document.getElementById("item-wears").value;
    const condition = document.getElementById("item-condition").value;
    const photoFile = itemPhotoInput ? itemPhotoInput.files[0] : null;

    if (!name || !color) return;

    const price = priceRaw ? parseFloat(priceRaw) : null;
    const wearsValue = wearsRaw ? parseInt(wearsRaw, 10) : 0;
    const wears = Number.isNaN(wearsValue) || wearsValue < 0 ? 0 : wearsValue;
    const existing = editingItemId ? items.find((i) => i.id === editingItemId) : null;

    let imageData = existing ? existing.imageData || null : null;
    if (photoFile) {
      try {
        imageData = await readFileAsDataUrl(photoFile);
      } catch (err) {
        console.error("Could not read file", err);
        alert("Could not read that photo. Please try another image.");
        return;
      }
    }

    if (editingItemId) {
      items = items.map((item) =>
        item.id === editingItemId
          ? { ...item, name, category, subcategory, brand, color, price, condition, wears, imageData }
          : item
      );
    } else {
      const newItem = {
        id: generateId(),
        name,
        category,
        subcategory,
        brand,
        color,
        price,
        condition,
        wears,
        imageData,
      };
      items.push(newItem);
    }

    saveItemsForUser();
    renderItems();
    renderDashboard();
    itemForm.reset();
    document.getElementById("item-category").value = "tops";
    document.getElementById("item-condition").value = "new";
    const wearsInput = document.getElementById("item-wears");
    if (wearsInput) wearsInput.value = 0;
    if (itemPhotoInput) itemPhotoInput.value = "";
    editingItemId = null;
    if (itemFormTitle) itemFormTitle.textContent = "Add an item";
    if (itemFormSubmit) itemFormSubmit.textContent = "Add item";
    closeAddItemModal();

    // jump to Closet so the new item is visible immediately
    if (closetNavLink) {
      showPage("closet");
    }
  });
}

// ====== INITIAL LOAD ======
if (currentUser && users[currentUser]) {
  showApp();
  loadUserData();
} else {
  showLogin();
}
