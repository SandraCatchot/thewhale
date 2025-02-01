document.ready(function () {
  const btnAccess = document.getElementById("btnAccess");
  const accessPanel = document.getElementById("access-panel");
  const closeAccessPanel = document.getElementById("closeAccessPanel");
  btnAccess.addEventListener("click", () => {
    accessPanel.classList.add("open");
  });
  closeAccessPanel.addEventListener("click", () => {
    accessPanel.classList.remove("open");
  });

  const buttons = document.querySelectorAll(".access-option button");
  const body = document.body;
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetClass = button.getAttribute("data-class");
      body.classList.remove(
        "grayscale",
        "dark-contrast",
        "light-contrast",
        "high-saturation",
        "low-saturation",
        "font-size-small",
        "font-size-medium",
        "font-size-large",
        "line-height-normal",
        "line-height-wide",
        "word-spacing-normal",
        "word-spacing-wide",
        "letter-spacing-normal",
        "letter-spacing-wide"
      );
      body.classList.add(targetClass);
    });
  });
});
