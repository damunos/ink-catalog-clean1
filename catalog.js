// catalog.js (NO brand logo code!)

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

let products = [];
let filteredProducts = [];
let categories = new Set();
let colors = new Set();

async function loadProducts() {
  // Load CSV or product data here (replace with your actual method!)
  // For demonstration, use a mock array.
  products = [
    {
      name: "T-Shirt",
      category: "Apparel",
      color: "Black",
      price: 9.99,
      image: "img/tshirt-black.jpg",
      description: "Classic black t-shirt."
    },
    {
      name: "Hoodie",
      category: "Apparel",
      color: "Gray",
      price: 19.99,
      image: "img/hoodie-gray.jpg",
      description: "Cozy gray hoodie."
    }
    // ... more products
  ];

  // Populate categories and colors from product data
  products.forEach(prod => {
    categories.add(prod.category);
    colors.add(prod.color);
  });

  filteredProducts = products; // Default is all products

  renderFilters();
  renderProducts();
}

function renderFilters() {
  const container = document.getElementById("filtersContainer");
  container.innerHTML = `
    <select id="categoryFilter">
      <option value="">All Categories</option>
      ${Array.from(categories).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
    </select>
    <select id="colorFilter">
      <option value="">All Colors</option>
      ${Array.from(colors).map(color => `<option value="${color}">${color}</option>`).join('')}
    </select>
    <button id="clearFilters">Clear Filters</button>
  `;

  document.getElementById("categoryFilter").addEventListener("change", filterProducts);
  document.getElementById("colorFilter").addEventListener("change", filterProducts);
  document.getElementById("clearFilters").addEventListener("click", () => {
    document.getElementById("categoryFilter").value = "";
    document.getElementById("colorFilter").value = "";
    filterProducts();
  });
}

function filterProducts() {
  const category = document.getElementById("categoryFilter").value;
  const color = document.getElementById("colorFilter").value;

  filteredProducts = products.filter(prod =>
    (category === "" || prod.category === category) &&
    (color === "" || prod.color === color)
  );

  renderProducts();
}

function renderProducts() {
  const container = document.getElementById("productContainer");
  if (!filteredProducts.length) {
    container.innerHTML = "<p>No products found.</p>";
    return;
  }

  container.innerHTML = filteredProducts.map(prod => `
    <div class="product-card">
      <img src="${prod.image}" alt="${prod.name}" />
      <h3>${prod.name}</h3>
      <p>${prod.description}</p>
      <span class="price">$${prod.price.toFixed(2)}</span>
    </div>
  `).join('');
}
