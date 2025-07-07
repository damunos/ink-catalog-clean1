document.addEventListener('DOMContentLoaded', () => {
  let products = [];

  // Load the JSON data
  fetch('sanmar_catalog.json')
    .then(response => response.json())
    .then(data => {
      products = data;
      populateCategoryFilter(products);
      renderProducts(products);
    });

  const searchBox = document.getElementById('searchBox');
  const categoryFilter = document.getElementById('categoryFilter');

  searchBox.addEventListener('input', () => {
    const filtered = filterProducts(products, searchBox.value, categoryFilter.value);
    renderProducts(filtered);
  });

  categoryFilter.addEventListener('change', () => {
    const filtered = filterProducts(products, searchBox.value, categoryFilter.value);
    renderProducts(filtered);
  });
});

function populateCategoryFilter(products) {
  const categoryFilter = document.getElementById('categoryFilter');
  const categories = new Set(products.map(p => p.category_name.trim()).filter(Boolean));
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterProducts(products, searchTerm, category) {
  return products.filter(product => {
    const matchesCategory = !category || product.category_name === category;
    const matchesSearch = product.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.style_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand_logo_image.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

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

    const brandLogo = document.createElement('img');
    brandLogo.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.brand_logo_image}`;
    brandLogo.alt = product.style_number;

    const title = document.createElement('h3');
    title.textContent = product.product_title;

    const description = document.createElement('p');
    description.textContent = product.product_description;

    const thumb = document.createElement('img');
    if (product.variants && product.variants.length > 0) {
      thumb.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.variants[0].thumbnail}`;
      thumb.alt = product.product_title;
    }

    card.appendChild(brandLogo);
    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(description);

    productGrid.appendChild(card);
  });
}
