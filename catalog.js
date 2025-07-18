// catalog.js

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
  const [headersLine, ...lines] = csv.trim().split("\n");
  const headers = headersLine.split(",").map(h => h.trim());

  return lines.map(line => {
    const parts = [];
    let inQuotes = false;
    let current = "";

    for (const char of line) {
      if (char === '"' && inQuotes) inQuotes = false;
      else if (char === '"' && !inQuotes) inQuotes = true;
      else if (char === ',' && !inQuotes) {
        parts.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current);
    return Object.fromEntries(headers.map((key, i) => [key, parts[i] ?? ""]));
  });
}

async function loadProducts() {
  const csv1 = await fetch("sanmar_catalog_part1.csv").then(r => r.text());
  const csv2 = await fetch("sanmar_catalog_part2.csv").then(r => r.text());

  const rawProducts = [...parseCSV(csv1), ...parseCSV(csv2)];
  const deduped = new Map();

  rawProducts.forEach(product => {
    const style = product["STYLE#"];
    const title = product.PRODUCT_TITLE.toLowerCase();
    if (!style || title.includes("discontinued")) return;
    if (!deduped.has(style)) deduped.set(style, product);
  });

  allProducts = [...deduped.values()];
  populateFilters();
  applyFilters();
  loadBrandLogos();
}

function loadBrandLogos() {
  const container = document.getElementById("brandLogos");
  container.innerHTML = "";

  const brands = [...new Set(allProducts.map(p => p.BRAND_NAME).filter(Boolean))].sort();
  brands.forEach(brand => {
    const img = document.createElement("img");
    img.src = `SDL/BRAND_LOGO_IMAGE/${brand.toLowerCase()}header.jpg`;
    img.alt = brand;
    img.className = "brand-logo";
    img.dataset.brand = brand;
    img.onerror = () => { img.src = "SDL/BRAND_LOGO_IMAGE/placeholder.jpg"; };

    img.addEventListener("click", () => {
      filteredProducts = allProducts.filter(p => p.BRAND_NAME === brand);
      currentPage = 1;
      renderProducts();
    });

    container.appendChild(img);
  });
}

function setupFilters() {
  const container = document.getElementById("filtersContainer");
  container.innerHTML = `
    <input type="text" id="searchInput" placeholder="Search products..."/>
    <select id="colorFilter"></select>
    <select id="categoryFilter"></select>
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
    [...colorSet].sort().map(c => `<option value="${c}">${c}</option>`).join("");
  categoryFilter.innerHTML = `<option value="">All Categories</option>` +
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

    // Create the image element
    const img = document.createElement("img");
    if (product.COLOR_PRODUCT_IMAGE_THUMBNAIL) {
      img.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.COLOR_PRODUCT_IMAGE_THUMBNAIL}`;
    } else {
      img.src = "placeholder.jpg"; // Fallback for missing images
    }
    img.alt = product.PRODUCT_TITLE;

    // Add the rest of the product details
    div.innerHTML = `
      <div class="product-thumbnail"></div>
      <div class="product-style">${product["STYLE#"]}</div>
      <div class="product-title">${product.PRODUCT_TITLE}</div>
      <div class="product-description" title="${product.PRODUCT_DESCRIPTION}">${product.PRODUCT_DESCRIPTION}</div>
      <div class="product-price">${product.MSRP ? `$${product.MSRP}` : ""}</div>
    `;

    // Append the image to the product thumbnail container
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
    btn.onclick = () => {
      currentPage = i;
      renderProducts();
    };
    pagination.appendChild(btn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  loadProducts();
});
