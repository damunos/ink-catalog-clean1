
// catalog.js
fetch('sanmar_catalog.json')
  .then(res => res.json())
  .then(data => {
    console.log("Loaded", data.length, "products.");
    // TODO: render search, filters, results
  });
