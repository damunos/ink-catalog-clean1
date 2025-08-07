// catalog.js -- REV 2024-08-03 15:05 EDT

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

// Robust CSV parser supporting quoted fields with commas/newlines
function parseCSV(csv) {
  const rows = [];
  let cur = "", row = [], inQuotes = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i], next = csv[i+1];
    if (char === '"') {
      if (inQuotes && next === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(cur); cur = "";
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
      cur = ""; row = [];
      // skip \r\n for Windows files
      if (char === '\r' && next === '\n') i++;
    } else {
      cur += char;
    }
  }
  // last row
  if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
  const headers = rows.shift().map(h => h.trim());
  return rows.filter(row => row.length > 1).map(row =>
    Object.fromEntries(headers.map((h, i) => [h, row[i] || ""]))
  );
}

function getGeneralColor(colorName) {
  const firstColorWord = colorName?.split(" ")[0]?.toLowerCase() || "";
  for (const [general, keywords] of Object.entries(colorMap)) {
    if (keywords.some(keyword => firstColorWord.includes(keyword))) {
      return general;
    }
  }
  return "other";
}

async function loadProducts() {
  console.log("Fetching CSV files...");
  const csv1 = await fetch("sanmar_catalog_part1.csv").then(r => r.text());
  const csv2 = await fetch("sanmar_catalog_part2.csv").then(r => r.text());

  console.log("CSV1 Length:", csv1.split('\n').length, "CSV2 Length:", csv2.split('\n').length);
  console.log("Parsing CSV...");
  const parsed1 = parseCSV(csv1);
  const parsed2 = parseCSV(csv2);

  // Merge and deduplicate by STYLE# + COLOR_NAME
  const deduped = new Map();
  [...parsed1, ...parsed2].forEach(product => {
    const style = product["STYLE#"]?.trim();
    const color = product["COLOR_NAME"]?.trim();
    const status = product["PRODUCT_STATUS"]?.toLowerCase() ?? "";
    if (!style || status === "discontinued") return;
    const key = style + (color ? ("::" + color) : "");
    if (!deduped.has(key)) deduped.set(key, product);
  });
  allProducts = [...deduped.values()];
  console.log("Total parsed products:", parsed1.length + parsed2.length);
  console.log("Deduped products:", allProducts.length);

  populateFilters();
  applyFilters();
  // Optionally: loadBrandLogos(); (disable if not needed)
}

function setupFilters() {
  const container = document.getElementById("filtersContainer");
  container.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search products..." aria-label="Search products" />
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
  const colorFilter = document.getElementById("colorFilter");
  const categoryFilter = document.getElementById("categoryFilter");
  colorFilter.innerHTML = `<option value="">All Colors</option>` +
    [...colorSet].sort().map(c => `<option value="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</option>`).join("");
  categoryFilter.innerHTML = `<option value="">All Categories</option>` +
    [...categorySet].sort().map(c => `<option value="${c}">${c}</option>`).join("");
  console.log("Filters populated:", { colors: [...colorSet], categories: [...categorySet] });
}

function applyFilters() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const color = document.getElementById("colorFilter").value;
  const category = document.getElementById("categoryFilter").value;
  filteredProducts = allProducts.filter(p => {
    const matchesSearch =
      (p.PRODUCT_TITLE?.toLowerCase() || "").includes(search) ||
      (p.PRODUCT_DESCRIPTION?.toLowerCase() || "").includes(search) ||
      (p["STYLE#"]?.toLowerCase() || "").includes(search);
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
    img.alt = product.PRODUCT_TITLE || "";
    div.innerHTML = `
      <div class="product-thumbnail"></div>
      <div class="product-style">${product["STYLE#"] || ""}</div>
      <div class="product-title">${product.PRODUCT_TITLE || ""}</div>
      <div class="product-description" title="${product.PRODUCT_DESCRIPTION || ""}">${product.PRODUCT_DESCRIPTION || ""}</div>
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
  if (totalPages <= 1) return;
  const maxButtons = 10;
  let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);
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
