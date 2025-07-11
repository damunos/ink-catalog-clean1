let catalogData = [];

function renderProducts(products) {
  const productGrid = document.getElementById('productGrid');
  productGrid.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');

    const title = document.createElement('h3');
    title.textContent = product.PRODUCT_TITLE || 'No Title';

    const desc = document.createElement('p');
    desc.textContent = product.PRODUCT_DESCRIPTION || '';

    const img = document.createElement('img');
    img.src = product.THUMBNAIL_IMAGE || '';
    img.alt = product.PRODUCT_TITLE || 'Product';

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(desc);

    productGrid.appendChild(card);
  });
}

Papa.parse('sanmar_catalog_part1.csv', {
  download: true,
  header: true,
  complete: function(results) {
    catalogData = results.data.filter(p => p.PRODUCT_TITLE);

    renderProducts(catalogData);

    // Build category buttons
    const uniqueCategories = [...new Set(catalogData.map(p => p.CATEGORY_NAME).filter(Boolean))];
    const filtersDiv = document.getElementById('filters');

    uniqueCategories.forEach(category => {
      const btn = document.createElement('button');
      btn.textContent = category;
      btn.addEventListener('click', () => {
        const filtered = catalogData.filter(p => p.CATEGORY_NAME === category);
        renderProducts(filtered);
      });
      filtersDiv.appendChild(btn);
    });

    // Setup search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      const filtered = catalogData.filter(p =>
        p.PRODUCT_TITLE.toLowerCase().includes(query) ||
        p.PRODUCT_DESCRIPTION.toLowerCase().includes(query)
      );
      renderProducts(filtered);
    });
  }
});
