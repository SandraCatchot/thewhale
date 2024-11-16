document.addEventListener("DOMContentLoaded", function () {
  const btnAcces = document.getElementById("btnAccess");
  const panel = document.getElementById("access-panel");
  const closeBtn = document.getElementById("closeAccessPanel");

  const btnGrisos = document.getElementById("grayscale");
  const btnMesContrast = document.getElementById("dark-contrast");
  const btnMenysContrast = document.getElementById("light-contrast");
  const btnMesSaturacio = document.getElementById("high-saturation");
  const btnMenysSaturacio = document.getElementById("low-saturation");

  const btnIncreaseFont = document.getElementById("increase-font");
  const btnDecreaseFont = document.getElementById("decrease-font");
  const btnIncreaseLineHeight = document.getElementById("increase-line-height");
  const btnDecreaseLineHeight = document.getElementById("decrease-line-height");
  const btnIncreaseWordSpacing = document.getElementById(
    "increase-word-spacing"
  );
  const btnDecreaseWordSpacing = document.getElementById(
    "decrease-word-spacing"
  );
  const btnIncreaseLetterSpacing = document.getElementById(
    "increase-letter-spacing"
  );
  const btnDecreaseLetterSpacing = document.getElementById(
    "decrease-letter-spacing"
  );

  let fontSize = 100;
  let lineHeight = 100;
  let wordSpacing = 0;
  let letterSpacing = 0;

  //ACCESO AL PANEL Y BOTON DE CERRAR
  function toggleAccessPanel() {
    panel.classList.toggle("visible");
  }

  if (btnAcces && panel) {
    btnAcces.addEventListener("click", toggleAccessPanel);
  }

  if (closeBtn && panel) {
    closeBtn.addEventListener("click", toggleAccessPanel);
  }

  //AJUSTES DE ACCESIBILIDAD (BOTONES)
  function ajustarFuente(cambio) {
    fontSize += cambio;
    if (fontSize < 50) fontSize = 50;
    document.body.style.fontSize = fontSize + "%";
  }

  function ajustarInterlineado(cambio) {
    lineHeight += cambio;
    if (lineHeight < 50) lineHeight = 50;
    document.body.style.lineHeight = lineHeight + "%";
  }

  function ajustarEspacioPalabras(cambio) {
    wordSpacing += cambio;
    if (wordSpacing < 0) wordSpacing = 0;
    document.body.style.wordSpacing = wordSpacing + "px";
  }

  function ajustarEspacioLetras(cambio) {
    letterSpacing += cambio;
    if (letterSpacing < 0) letterSpacing = 0;
    document.body.style.letterSpacing = letterSpacing + "px";
  }

  function aplicarClase(clase) {
    document.body.classList.remove(
      "grayscale",
      "dark-contrast",
      "light-contrast",
      "high-saturation",
      "low-saturation"
    );

    if (clase) {
      document.body.classList.add(clase);
    }
  }

  if (btnGrisos) {
    btnGrisos.addEventListener("click", function () {
      aplicarClase("grayscale");
    });
  }

  if (btnMesContrast) {
    btnMesContrast.addEventListener("click", function () {
      aplicarClase("dark-contrast");
    });
  }

  if (btnMenysContrast) {
    btnMenysContrast.addEventListener("click", function () {
      aplicarClase("light-contrast");
    });
  }

  if (btnMesSaturacio) {
    btnMesSaturacio.addEventListener("click", function () {
      aplicarClase("high-saturation");
    });
  }

  if (btnMenysSaturacio) {
    btnMenysSaturacio.addEventListener("click", function () {
      aplicarClase("low-saturation");
    });
  }

  if (btnIncreaseFont) {
    btnIncreaseFont.addEventListener("click", function () {
      ajustarFuente(10); 
    });
  }

  if (btnDecreaseFont) {
    btnDecreaseFont.addEventListener("click", function () {
      ajustarFuente(-10); 
    });
  }

  if (btnIncreaseLineHeight) {
    btnIncreaseLineHeight.addEventListener("click", function () {
      ajustarInterlineado(10);
    });
  }

  if (btnDecreaseLineHeight) {
    btnDecreaseLineHeight.addEventListener("click", function () {
      ajustarInterlineado(-10);
    });
  }

  if (btnIncreaseWordSpacing) {
    btnIncreaseWordSpacing.addEventListener("click", function () {
      ajustarEspacioPalabras(1); 
    });
  }

  if (btnDecreaseWordSpacing) {
    btnDecreaseWordSpacing.addEventListener("click", function () {
      ajustarEspacioPalabras(-1); 
    });
  }

  if (btnIncreaseLetterSpacing) {
    btnIncreaseLetterSpacing.addEventListener("click", function () {
      ajustarEspacioLetras(0.5); 
    });
  }

  if (btnDecreaseLetterSpacing) {
    btnDecreaseLetterSpacing.addEventListener("click", function () {
      ajustarEspacioLetras(-0.5); 
    });
  }
});
