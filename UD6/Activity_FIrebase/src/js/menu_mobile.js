document.ready(function () {
  const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
  const mobileMenu = document.querySelector(".mobile-menu");
  const closeMenuBtn = document.querySelector(".mobile-menu .close-btn");
  mobileMenuIcon.addEventListener("click", () => {
    mobileMenu.classList.add("open");
  });
  closeMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
});
