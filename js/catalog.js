// catalog.js

document.addEventListener('DOMContentLoaded', () => {
  const searchBox = document.getElementById('searchBox');
  const categoryFilter = document.getElementById('categoryFilter');
  const productGrid = document.getElementById('productGrid');

  let products = [];

  // Load products from CSV or JSON (this example assumes JSON)
  fetch('sanmar_catalog.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      populateCategories(products);
      renderProducts(products);
    })
    .catch(error => console.error('Error loading catalog:', error));

  // Populate categories into dropdown
  function populateCategories(products) {
    const categories = [...new Set(products.map(p => p.CATEGORY_NAME))].sort();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  }

  // Render products into grid
  function renderProducts(filteredProducts) {
    productGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
      productGrid.innerHTML = '<p>No products found.</p>';
      return;
    }

    filteredProducts.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const image = document.createElement('img');
      image.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.THUMBNAIL_IMAGE}`;
      image.alt = product.PRODUCT_TITLE;

      const title = document.createElement('h3');
      title.textContent = product.PRODUCT_TITLE;

      const styleNum = document.createElement('p');
      styleNum.textContent = `Style: ${product.STYLE}`;

      const category = document.createElement('p');
      category.textContent = product.CATEGORY_NAME;

      card.appendChild(image);
      card.appendChild(title);
      card.appendChild(styleNum);
      card.appendChild(category);

      productGrid.appendChild(card);
    });
  }

  // Filter logic
  function filterProducts() {
    const searchTerm = searchBox.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = products.filter(product => {
      const matchesCategory = selectedCategory === '' || product.CATEGORY_NAME === selectedCategory;
      const matchesSearch =
        product.PRODUCT_TITLE.toLowerCase().includes(searchTerm) ||
        product.STYLE.toLowerCase().includes(searchTerm) ||
        (product.BRAND_NAME && product.BRAND_NAME.toLowerCase().includes(searchTerm));
      return matchesCategory && matchesSearch;
    });

    renderProducts(filtered);
  }

  searchBox.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
});
