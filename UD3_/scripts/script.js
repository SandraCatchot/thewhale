function showContent(type) {
    // Selecciona los tabs y las tarjetas
    const tabOssos = document.getElementById("tab-ossos");
    const tabFeina = document.getElementById("tab-feina");
    const ossosCards = document.querySelectorAll(".card-ossos");
    const feinaCards = document.querySelectorAll(".card-feina");

    // Alterna la visibilidad de las tarjetas según el tipo seleccionado
    if (type === 'ossos') {
        tabOssos.classList.add("active");
        tabFeina.classList.remove("active");

        ossosCards.forEach(card => card.style.display = "block");
        feinaCards.forEach(card => card.style.display = "none");
    } else if (type === 'feina') {
        tabOssos.classList.remove("active");
        tabFeina.classList.add("active");

        ossosCards.forEach(card => card.style.display = "none");
        feinaCards.forEach(card => card.style.display = "block");
    }
}

// Llama a la función al cargar la página para mostrar solo "Els seus òssos" inicialmente
document.addEventListener("DOMContentLoaded", () => {
    showContent('ossos');
});
