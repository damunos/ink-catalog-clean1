document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');
  let products = [];

  function renderProducts(data) {
    productGrid.innerHTML = ''; // Clear grid
    if (!data.length) {
      productGrid.innerHTML = '<p>No matching products found.</p>';
      return;
    }
    data.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const img = document.createElement('img');
      img.src = product.THUMBNAIL_IMAGE || 'https://via.placeholder.com/150';
      img.alt = product.PRODUCT_TITLE || 'Product Image';
      card.appendChild(img);

      const title = document.createElement('h3');
      title.textContent = product.PRODUCT_TITLE || 'Untitled';
      card.appendChild(title);

      const desc = document.createElement('p');
      desc.textContent = product.PRODUCT_DESCRIPTION || '';
      card.appendChild(desc);

      productGrid.appendChild(card);
    });
  }

  Papa.parse('sanmar_catalog_part1.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      products = results.data;
      renderProducts(products);
    },
    error: function(err) {
      console.error('Error loading CSV:', err);
      productGrid.innerHTML = '<p>Error loading products.</p>';
    }
  });

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = products.filter(p =>
      (p.PRODUCT_TITLE || '').toLowerCase().includes(query) ||
      (p.PRODUCT_DESCRIPTION || '').toLowerCase().includes(query)
    );
    renderProducts(filtered);
  });
});
