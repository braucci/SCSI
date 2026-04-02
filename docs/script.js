document.addEventListener("DOMContentLoaded", () => {
  const year = new Date().getFullYear();
  const footer = document.querySelector(".site-footer p");
  if (footer) {
    footer.innerHTML = `© ${year} Biagio Raucci – Archivio didattico di Costruzioni Aeronautiche`;
  }
});
