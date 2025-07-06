let products = [];

fetch('sanmar_catalog.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    renderCatalog(products);
  });

function renderCatalog(items) {
  const container = document.getElementById('catalog');
  container.innerHTML = ''; // Clear existing

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const title = document.createElement('h3');
    title.textContent = item.PRODUCT_TITLE + ' (' + item["STYLE#"] + ')';

    const desc = document.createElement('p');
    desc.textContent = item.PRODUCT_DESCRIPTION;

    const img = document.createElement('img');
    img.src = item.COLORS[0].FRONT_MODEL_IMAGE_URL || item.COLORS[0].FRONT_FLAT_IMAGE_URL;
    img.alt = item.PRODUCT_TITLE;

    const spec = document.createElement('a');
    spec.href = item.SPEC_SHEET;
    spec.textContent = 'View Spec Sheet';

    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(img);
    card.appendChild(spec);

    container.appendChild(card);
  });
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();
  const filtered = products.filter(item =>
    item.PRODUCT_TITLE.toLowerCase().includes(keyword) ||
    item["STYLE#"].toLowerCase().includes(keyword) ||
    item.PRODUCT_DESCRIPTION.toLowerCase().includes(keyword)
  );
  renderCatalog(filtered);
});
