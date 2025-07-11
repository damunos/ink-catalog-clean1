document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('productGrid');
  const searchInput = document.getElementById('searchInput');

  let catalogData = []; // Store CSV rows here for searching

  // Load CSV with PapaParse
  Papa.parse('sanmar_catalog_part1.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      console.log('CSV loaded. Headers:', results.meta.fields);
      console.log('Sample row:', results.data[0]);

      catalogData = results.data;

      if (!catalogData.length) {
        productGrid.innerHTML = '<p>No products found in CSV.</p>';
        return;
      }

      renderProducts(catalogData);
    },
    error: function(err) {
      console.error('Error loading CSV:', err);
      productGrid.innerHTML = '<p>Error loading products.</p>';
    }
  });

  // Render helper function
  function renderProducts(data) {
    productGrid.innerHTML = ''; // Clear old results
    if (!data.length) {
      productGrid.innerHTML = '<p>No products match your search.</p>';
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

  // Search input listener
  searchInput.addEventListener('keyup', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = catalogData.filter(product =>
      product.PRODUCT_TITLE.toLowerCase().includes(query) ||
      product.PRODUCT_DESCRIPTION.toLowerCase().includes(query)
    );
    renderProducts(filtered);
  });
});
