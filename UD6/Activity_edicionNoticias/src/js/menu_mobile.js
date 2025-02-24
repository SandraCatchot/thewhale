const mobileMenuIcon = document.querySelector(".mobile-menu-icon");
const mobileMenu = document.querySelector(".mobile-menu");
const closeMenuBtn = document.querySelector(".mobile-menu .close-btn");

if (mobileMenuIcon && mobileMenu) {
  mobileMenuIcon.addEventListener("click", () => {
    mobileMenu.classList.add("open");
  });
}

if (closeMenuBtn && mobileMenu) {
  closeMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });
}
