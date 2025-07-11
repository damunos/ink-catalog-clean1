document.addEventListener('DOMContentLoaded', function () {
  const catalogUrl = "https://raw.githubusercontent.com/damunos/ink-catalog-clean1/master/sanmar_catalog_part1.csv";
  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('category-select');
  const productContainer = document.getElementById('product-list');

  // Load CSV with Papa Parse
  Papa.parse(catalogUrl, {
    download: true,
    header: true,
    complete: function (results) {
      console.log("CSV loaded:", results);
      const products = results.data;
      const categories = getUniqueCategories(products);
      populateCategories(categories);
      displayProducts(products);

      // Search handler
      searchInput.addEventListener('input', function () {
        const term = searchInput.value.toLowerCase();
        const filtered = products.filter(p =>
          p.PRODUCT_TITLE && p.PRODUCT_TITLE.toLowerCase().includes(term)
        );
        displayProducts(filtered);
      });

      // Category filter handler
      categorySelect.addEventListener('change', function () {
        const selected = categorySelect.value;
        let filtered = products;
        if (selected) {
          filtered = products.filter(p => p.CATEGORY_NAME === selected);
        }
        displayProducts(filtered);
      });
    }
  });

  function getUniqueCategories(products) {
    const set = new Set();
    products.forEach(p => {
      if (p.CATEGORY_NAME) {
        set.add(p.CATEGORY_NAME);
      }
    });
    return Array.from(set).sort();
  }

  function populateCategories(categories) {
    categorySelect.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }

  function displayProducts(products) {
    productContainer.innerHTML = '';
    if (products.length === 0) {
      productContainer.innerHTML = '<p>No products found.</p>';
      return;
    }

    products.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';

      div.innerHTML = `
        <h3>${p.PRODUCT_TITLE || 'No Title'}</h3>
        <p>${p.CATEGORY_NAME || ''}</p>
        <p>${p.PRODUCT_DESCRIPTION || ''}</p>
      `;

      productContainer.appendChild(div);
    });
  }
});
