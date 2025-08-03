// catalog.js

// Configuration
const PRODUCTS_CSV = 'sanmar_catalog_part1.csv'; // Change if using a different csv file name
const PRODUCTS_PER_PAGE = 24;

// State
let products = [];
let filteredProducts = [];
let categories = [];
let colors = [];
let currentPage = 1;

// DOM Elements
const filtersContainer = document.getElementById('filtersContainer');
const productContainer = document.getElementById('productContainer');
const pageButtons = document.getElementById('pageButtons');

// 1. CSV Parsing
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = [];
    let inQuotes = false;
    let value = '';
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        values.push(value);
        value = '';
      } else {
        value += c;
      }
    }
    values.push(value);
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim() || '';
    });
    return obj;
  });
}

// 2. Load CSV Products
async function loadProducts() {
  try {
    const res = await fetch(PRODUCTS_CSV);
    if (!res.ok) throw new Error('Could not load product catalog!');
    const csv = await res.text();
    products = parseCSV(csv);
    updateCategoryColorLists();
    renderFilters();
    filterProducts();
  } catch (err) {
    productContainer.innerHTML = `<p class="error">Error loading catalog: ${err.message}</p>`;
  }
}

// 3. Extract Category & Color Lists
function updateCategoryColorLists() {
  const categorySet = new Set();
  const colorSet = new Set();
  for (const p of products) {
    if (p['CATEGORY_NAME']) categorySet.add(p['CATEGORY_NAME']);
    if (p['COLOR_NAME']) colorSet.add(p['COLOR_NAME']);
  }
  categories = Array.from(categorySet).sort();
  colors = Array.from(colorSet).sort();
}

// 4. Render Filters
function renderFilters() {
  if (!filtersContainer) return;
  filtersContainer.innerHTML = `
    <label>
      Category:
      <select id="categoryFilter">
        <option value="">All</option>
        ${categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
      </select>
    </label>
    <label>
      Color:
      <select id="colorFilter">
        <option value="">All</option>
        ${colors.map(color => `<option value="${color}">${color}</option>`).join('')}
      </select>
    </label>
    <label>
      Search:
      <input id="searchFilter" placeholder="Product name, style, etc." />
    </label>
  `;
  document.getElementById('categoryFilter').onchange = filterProducts;
  document.getElementById('colorFilter').onchange = filterProducts;
  document.getElementById('searchFilter').oninput = filterProducts;
}

// 5. Filter Logic
function filterProducts() {
  const category = document.getElementById('categoryFilter')?.value || '';
  const color = document.getElementById('colorFilter')?.value || '';
  const search = document.getElementById('searchFilter')?.value.toLowerCase() || '';
  filteredProducts = products.filter(p =>
    (!category || p['CATEGORY_NAME'] === category) &&
    (!color || p['COLOR_NAME'] === color) &&
    (!search ||
      (p['PRODUCT_TITLE'] && p['PRODUCT_TITLE'].toLowerCase().includes(search)) ||
      (p['PRODUCT_DESCRIPTION'] && p['PRODUCT_DESCRIPTION'].toLowerCase().includes(search)) ||
      (p['STYLE#'] && p['STYLE#'].toLowerCase().includes(search))
    )
  );
  currentPage = 1;
  renderProducts();
  renderPagination();
}

// 6. Product Cards
function renderProducts() {
  if (!productContainer) return;
  if (!filteredProducts.length) {
    productContainer.innerHTML = `<p>No products found.</p>`;
    return;
  }
  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

  productContainer.innerHTML = pageProducts.map(p => {
    const imgSrc = p['THUMBNAIL_IMAGE'] ? `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${p['THUMBNAIL_IMAGE']}` : 'placeholder.png';
    return `
      <div class="product-card">
        <img src="${imgSrc}" alt="${p['PRODUCT_TITLE'] || ''}" loading="lazy" onerror="this.src='placeholder.png'">
        <div class="product-info">
          <div class="product-title">${p['PRODUCT_TITLE'] || ''}</div>
          <div class="product-style">${p['STYLE#'] || ''}</div>
          <div class="product-desc">${(p['PRODUCT_DESCRIPTION'] || '').substring(0, 60)}${(p['PRODUCT_DESCRIPTION'] && p['PRODUCT_DESCRIPTION'].length > 60) ? '...' : ''}</div>
          <div class="product-color">${p['COLOR_NAME'] || ''}</div>
        </div>
      </div>
    `;
  }).join('');
}

// 7. Pagination
function renderPagination() {
  if (!pageButtons) return;
  const pages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  if (pages <= 1) {
    pageButtons.innerHTML = '';
    return;
  }
  let html = '';
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn${i === currentPage ? ' active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  pageButtons.innerHTML = html;
}
window.goToPage = function(n) {
  currentPage = n;
  renderProducts();
  renderPagination();
};

// 8. INIT
window.addEventListener('DOMContentLoaded', loadProducts);
