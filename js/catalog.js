document.addEventListener('DOMContentLoaded', () => {
  let products = [];

  // Load JSON data
  fetch('sanmar_catalog.json')
    .then(res => res.json())
    .then(data => {
      console.log("Loaded", data.length, "products.");
      products = data;
      populateCategoryFilter(products);
      renderProducts(products);
    })
    .catch(error => console.error('Error loading catalog JSON:', error));

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
  const categories = new Set();
  products.forEach(p => {
    if (p.category) {
      p.category.split(';').forEach(cat => categories.add(cat.trim()));
    }
  });

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

function filterProducts(products, searchTerm, category) {
  return products.filter(product => {
    const matchesCategory = !category || product.category.includes(category);
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.style.toLowerCase().includes(searchTerm.toLowerCase());
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

    const thumb = document.createElement('img');
    thumb.src = `SDL/COLOR_PRODUCT_IMAGE_THUMBNAIL/${product.thumbnail}`;
    thumb.alt = product.title;

    const title = document.createElement('h3');
    title.textContent = product.title;

    const desc = document.createElement('p');
    desc.textContent = product.description;

    card.appendChild(thumb);
    card.appendChild(title);
    card.appendChild(desc);

    productGrid.appendChild(card);
  });
}
