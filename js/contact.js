document.getElementById("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("form-status").innerHTML = "Submitting...";
  
    // Example for Formspree
    fetch("https://formspree.io/f/your_form_id", {
      method: "POST",
      body: new FormData(this),
      headers: {
        Accept: "application/json",
      },
    })
      .then(response => {
        if (response.ok) {
          document.getElementById("form-status").innerHTML = "Thanks for your message!";
          this.reset();
        } else {
          document.getElementById("form-status").innerHTML = "Oops! There was a problem.";
        }
      })
      .catch(() => {
        document.getElementById("form-status").innerHTML = "Oops! There was a problem.";
      });
  });
  