// catalog.js -- debug enhanced -- 2025-08-03T15:55
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 36;

const colorMap = {
  red: ["red", "crimson", "maroon", "burgundy"],
  green: ["green", "olive", "lime", "mint", "aloe"],
  blue: ["blue", "navy", "aqua", "teal", "turquoise"],
  yellow: ["yellow", "gold", "lemon"],
  orange: ["orange", "coral"],
  purple: ["purple", "lavender", "plum", "violet"],
  pink: ["pink", "fuchsia", "rose", "blush"],
  black: ["black", "charcoal"],
  white: ["white", "ivory"],
  gray: ["gray", "grey", "silver", "ash"],
  brown: ["brown", "khaki", "tan", "beige"],
};

function getGeneralColor(colorName) {
  const firstColorWord = colorName?.split(" ")[0]?.toLowerCase() || "";
  for (const [general, keywords] of Object.entries(colorMap)) {
    if (keywords.some(keyword => firstColorWord.includes(keyword))) {
      return general;
    }
  }
  return "other";
}

function parseCSV(csv) {
  // Handles quoted fields and embedded commas
  const lines = csv.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    let part = '', col = 0, inQuotes = false, row = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (inQuotes && line[j + 1] === '"') {
          part += '"'; j++;
        } else { inQuotes = !inQuotes; }
      } else if (c === ',' && !inQuotes) {
        row.push(part); part = ''; col++;
      } else { part += c; }
    }
    row.push(part);
    const record = {};
    headers.forEach((h, idx) => record[h] = row[idx] || "");
    rows.push(record);
  }
  return rows;
}

async function loadProducts() {
  console.log("Fetching CSV files...");
  const csv1 = await fetch("sanmar_catalog_part1.csv").then(r => r.text());
  const csv2 = await fetch("sanmar_catalog_part2.csv").then(r => r.text());

  const rawProducts = [...parseCSV(csv1), ...parseCSV(csv2)];
  console.log("Raw products parsed:", rawProducts.length);
  const deduped = new Map();

  rawProducts.forEach(product => {
    const style = product["STYLE#"]?.trim();
    const title = product.PRODUCT_TITLE?.toLowerCase().trim() ?? '';
    if (!style || title.includes("discontinued")) return;
    if (!deduped.has(style)) deduped.set(style, product);
  });
  allProducts = [...deduped.values()];
  console.log("Deduped products:", allProducts.length, allProducts.slice(0, 5));
  populateFilters();
  applyFilters();
}

function setupFilters() {
  const container = document.getElementById("filtersContainer");
  container.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search products..." />
    <label for="colorFilter">Color</label>
    <select id="colorFilter" title="Filter by color"></select>
    <label for="categoryFilter">Category</label>
    <select id="categoryFilter" title="Filter by category"></select>
  `;

  document.getElementById("searchInput").oninput = applyFilters;
  document.getElementById("colorFilter").onchange = applyFilters;
  document.getElementById("categoryFilter").onchange = applyFilters;
}

function populateFilters() {
  const colorSet = new Set();
  const categorySet = new Set();

  allProducts.forEach(p => {
    const genColor = getGeneralColor(p.COLOR_NAME);
    if (genColor) colorSet.add(genColor);
    if (p.CATEGORY_NAME) categorySet.add(p.CATEGORY_NAME);
  });

  document.getElementById("colorFilter").innerHTML =
    `<option value="">All Colors</option>` +
    [...colorSet].sort().map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join("");
  document.getElementById("categoryFilter").innerHTML =
    `<option value="">All Categories</option>` +
    [...categorySet].sort().map(c => `<option value="${c}">${c}</option>`).join("");
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const color = document.getElementById("colorFilter").value;
  const category = document.getElementById("categoryFilter").value;

  filteredProducts = allProducts.filter(p => {
    const matchesSearch =
      p.PRODUCT_TITLE?.toLowerCase().includes(search) ||
      p.PRODUCT_DESCRIPTION?.toLowerCase().includes(search) ||
      p["STYLE#"]?.toLowerCase().includes(search);
    const matchesColor = !color || getGeneralColor(p.COLOR_NAME) === color;
    const matchesCategory = !category || p.CATEGORY_NAME === category;
    return matchesSearch && matchesColor && matchesCategory;
  });

  currentPage = 1;
  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("productContainer");
  container.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;

  filteredProducts.slice(start, end).forEach(product => {
    const div = document.createElement("div");
    div.className = "product";
    const img = document.createElement("img");
    img.src = product.COLOR_PRODUCT_IMAGE_THUMBNAIL
      ? `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.COLOR_PRODUCT_IMAGE_THUMBNAIL}`
      : "placeholder.jpg";
    img.alt = product.PRODUCT_TITLE;

    div.innerHTML = `
      <div class="product-thumbnail"></div>
      <div class="product-style">${product["STYLE#"]}</div>
      <div class="product-title">${product.PRODUCT_TITLE}</div>
      <div class="product-description" title="${product.PRODUCT_DESCRIPTION}">${product.PRODUCT_DESCRIPTION}</div>
      <div class="product-price">${product.MSRP ? `$${product.MSRP}` : ""}</div>
    `;
    div.querySelector(".product-thumbnail").appendChild(img);
    container.appendChild(div);
  });

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const pagination = document.getElementById("pageButtons");
  pagination.innerHTML = "";

  const maxButtons = 10;
  const start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const end = Math.min(totalPages, start + maxButtons - 1);

  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => { currentPage = i; renderProducts(); };
    pagination.appendChild(btn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  loadProducts();
});
