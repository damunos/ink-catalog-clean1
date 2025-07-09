// js/catalog.js

document.addEventListener('DOMContentLoaded', () => {
  let products = [];

  // Load the JSON data
  fetch('sanmar_catalog.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      populateCategoryFilter(products);
      renderProducts(products);
    })
    .catch(error => console.error('Error loading catalog JSON:', error));

  const searchBox = document.getElementById('searchBox');
  const categoryFilter = document.getElementById('categoryFilter');

  // Search input listener
  searchBox.addEventListener('input', () => {
    const filtered = filterProducts(products, searchBox.value, categoryFilter.value);
    renderProducts(filtered);
  });

  // Category dropdown listener
  categoryFilter.addEventListener('change', () => {
    const filtered = filterProducts(products, searchBox.value, categoryFilter.value);
    renderProducts(filtered);
  });
});

// Populate the category filter dropdown
function populateCategoryFilter(products) {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = new Set(products.map(p => p.category_name.trim()).filter(Boolean));

  // Add default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'All Categories';
  categoryFilter.appendChild(defaultOption);

  // Add categories
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Filter products based on search and category
function filterProducts(products, searchTerm, category) {
  return products.filter(product => {
    const matchesCategory = !category || product.category_name === category;
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      product.product_title.toLowerCase().includes(search) ||
      product.style_number.toLowerCase().includes(search) ||
      (product.product_description && product.product_description.toLowerCase().includes(search));
    return matchesCategory && matchesSearch;
  });
}

// Render the filtered products
function renderProducts(products) {
  const productGrid = document.getElementById('productGrid');
  productGrid.innerHTML = '';

  if (products.length === 0) {
    productGrid.innerHTML = '<p>No products found.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // Brand logo
    if (product.brand_logo_image) {
      const brandLogo = document.createElement('img');
      brandLogo.src = `SDL/BRAND_LOGO_IMAGE/${product.brand_logo_image}`;
      brandLogo.alt = product.style_number;
      brandLogo.className = 'brand-logo';
      card.appendChild(brandLogo);
    }

    // Main thumbnail
    if (product.variants && product.variants.length > 0) {
      const thumb = document.createElement('img');
      thumb.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.variants[0].thumbnail}`;
      thumb.alt = product.product_title;
      thumb.className = 'product-thumb';
      card.appendChild(thumb);
    }

    // Title
    const title = document.createElement('h3');
    title.textContent = product.product_title;
    card.appendChild(title);

    // Description
    if (product.product_description) {
      const description = document.createElement('p');
      description.textContent = product.product_description;
      card.appendChild(description);
    }

    productGrid.appendChild(card);
  });
}
