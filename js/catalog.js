document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const productGrid = document.getElementById('productGrid');

  let products = [];

  // Load both CSV files and combine results
  Promise.all([
    fetch('sanmar_catalog_part1.csv').then(res => res.ok ? res.text() : ''),
    fetch('sanmar_catalog_part2.csv').then(res => res.ok ? res.text() : '')
  ])
    .then(([csv1, csv2]) => {
      const combinedCSV = `${csv1}\n${csv2}`;
      products = parseCSV(combinedCSV);
      populateCategories(products);
      displayProducts(products);
    })
    .catch(err => {
      console.error('Error loading CSV:', err);
    });

  function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const item = {};
      headers.forEach((header, idx) => {
        item[header.trim()] = values[idx] ? values[idx].trim() : '';
      });
      return item;
    });
  }

  function populateCategories(products) {
    const categories = new Set(products.map(p => p.CATEGORY_NAME).filter(Boolean));
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });
  }

  function displayProducts(filtered) {
    productGrid.innerHTML = '';
    if (!filtered.length) {
      productGrid.innerHTML = '<p>No matching products found.</p>';
      return;
    }
    filtered.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const img = document.createElement('img');
      img.src = product.THUMBNAIL_IMAGE || '';
      img.alt = product.PRODUCT_TITLE || 'Product';

      const title = document.createElement('h3');
      title.textContent = product.PRODUCT_TITLE || 'Untitled';

      const desc = document.createElement('p');
      desc.textContent = product.PRODUCT_DESCRIPTION || '';

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(desc);

      productGrid.appendChild(card);
    });
  }

  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCat = categoryFilter.value;
    const filtered = products.filter(p => {
      const matchesSearch = Object.values(p).some(val =>
        val.toLowerCase().includes(searchTerm)
      );
      const matchesCat = selectedCat === '' || p.CATEGORY_NAME === selectedCat;
      return matchesSearch && matchesCat;
    });
    displayProducts(filtered);
  }

  searchInput.addEventListener('input', filterProducts);
  categoryFilter.addEventListener('change', filterProducts);
});
