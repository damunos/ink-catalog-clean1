// catalog.js -- rev2025-08-03T16:12, built for Ink N Threadworks live catalog

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 36;

// General color mapping
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

// Map a color name to general color
function getGeneralColor(colorName) {
  const firstColorWord = colorName?.split(/[ /]/)[0]?.toLowerCase() || "";
  for (const [general, keywords] of Object.entries(colorMap)) {
    if (keywords.some(keyword => firstColorWord.includes(keyword))) {
      return general;
    }
  }
  return "other";
}

// Robust CSV parser (handles quoted fields)
function parseCSV(csv) {
  const lines = csv.replace(/\r/g, "").split("\n");
  const headers = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    let line = lines[i];
    if (!line.trim()) continue; // skip blank
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      let char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          field += '"'; j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(field);
        field = "";
      } else {
        field += char;
      }
    }
    row.push(field);
    let product = {};
    headers.forEach((h, idx) => (product[h] = row[idx] ? row[idx].trim() : ""));
    rows.push(product);
  }
  return rows;
}

async function loadProducts() {
  console.log("Fetching CSV files...");
  const csv1 = await fetch("sanmar_catalog_part1.csv").then(r => r.text());
  const csv2 = await fetch("sanmar_catalog_part2.csv").then(r => r.text());
  const rawProducts = [...parseCSV(csv1), ...parseCSV(csv2)];
  console.log("Parsed products from CSV:", rawProducts.length);

  // Deduplicate by STYLE# and skip "discontinued"
  const deduped = new Map();
  rawProducts.forEach(product => {
    const style = product["STYLE#"]?.trim();
    const title = product.PRODUCT_TITLE?.toLowerCase().trim() || "";
    if (!style) return;
    if (!deduped.has(style)) deduped.set(style, product);
  });

  allProducts = [...deduped.values()];
  console.log("Deduped products loaded:", allProducts.length);
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

  console.log("Filters populated:", {
    colors: [...colorSet],
    categories: [...categorySet]
  });
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const color = document.getElementById("colorFilter").value;
  const category = document.getElementById("categoryFilter").value;

  filteredProducts = allProducts.filter(p => {
    const matchesSearch =
      (p.PRODUCT_TITLE?.toLowerCase().includes(search) ?? false) ||
      (p.PRODUCT_DESCRIPTION?.toLowerCase().includes(search) ?? false) ||
      (p["STYLE#"]?.toLowerCase().includes(search) ?? false);
    const matchesColor = !color || getGeneralColor(p.COLOR_NAME) === color;
    const matchesCategory = !category || p.CATEGORY_NAME === category;
    return matchesSearch && matchesColor && matchesCategory;
  });

  currentPage = 1;
  renderProducts();
  console.log("Products after filter:", filteredProducts.length);
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
