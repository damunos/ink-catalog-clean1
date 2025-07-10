// js/catalog.js

function loadCSVParts() {
  const files = [
    'sanmar_catalog_part1.csv',
    'sanmar_catalog_part2.csv'
  ];

  const allData = [];

  const promises = files.map(file =>
    fetch(file)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
        return response.text();
      })
      .then(csv => Papa.parse(csv, { header: true }).data)
  );

  Promise.all(promises)
    .then(results => {
      results.forEach(part => allData.push(...part));
      console.log("Combined CSV Data:", allData);
      displayCatalog(allData);
    })
    .catch(error => {
      console.error('Error loading CSV parts:', error);
    });
}

function displayCatalog(data) {
  const container = document.getElementById('catalog');
  if (!container) return;

  // Clear any existing content
  container.innerHTML = '';

  data.forEach(item => {
    // Skip empty rows (sometimes PapaParse adds a blank)
    if (!item.PRODUCT_TITLE && !item.STYLE_NUMBER) return;

    const div = document.createElement('div');
    div.className = 'product-item';
    div.innerHTML = `
      <h3>${item.PRODUCT_TITLE || 'No Title'}</h3>
      <p>Style #: ${item.STYLE_NUMBER || 'N/A'}</p>
      <p>Category: ${item.CATEGORY_NAME || 'N/A'}</p>
    `;
    container.appendChild(div);
  });
}

document.addEventListener('DOMContentLoaded', loadCSVParts);
