document.addEventListener('DOMContentLoaded', () => {
  const productGrid = document.getElementById('productGrid');

  Papa.parse('sanmar_catalog_part1.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      console.log('Headers:', results.meta.fields);
      console.log('First row:', results.data[0]);

      const data = results.data;

      if (!data.length) {
        productGrid.innerHTML = '<p>No products found in CSV.</p>';
        return;
      }

      productGrid.innerHTML = ''; // Clear loading text

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
    },
    error: function(err) {
      console.error('Error loading CSV:', err);
      productGrid.innerHTML = '<p>Error loading products.</p>';
    }
  });
});
