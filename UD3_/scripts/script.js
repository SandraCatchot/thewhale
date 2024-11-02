// Función para alternar entre "Els seus ossos" y "Altres feines d'alumnes" en ambas vistas
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

        // Carga el listado de "ossos" en la vista de escritorio
        loadList('ossos');
    } else if (type === 'feina') {
        tabOssos.classList.remove("active");
        tabFeina.classList.add("active");

        ossosCards.forEach(card => card.style.display = "none");
        feinaCards.forEach(card => card.style.display = "block");

        // Carga el listado de "feines" en la vista de escritorio
        loadList('feina');
    }
}

// Función para cargar el listado en la vista de escritorio según el tipo seleccionado
function loadList(type) {
    const listado = document.getElementById("listado");
    listado.innerHTML = ""; // Limpia el contenido actual del listado

    // Define los ítems según el tipo seleccionado
    const items = type === 'ossos' ? ["Ós 1", "Ós 2", "Ós 3", "Ós 4", "Ós 5"] : ["Feina 1", "Feina 2", "Feina 3", "Feina 4", "Feina 5"];

    // Crea los elementos de la lista
    items.forEach((item, index) => {
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerText = item;
        listItem.onclick = () => showDetail(type, index + 1); // Asigna el evento para mostrar el detalle
        listado.appendChild(listItem);
    });
}

// Función para mostrar el detalle del ítem seleccionado en la vista de escritorio
function showDetail(type, index) {
    const detailsImage = document.getElementById("details-image");
    const detailsText = document.getElementById("details-text");

    // Cambia la imagen y el texto según el tipo y el índice del ítem seleccionado
    detailsImage.src = `../images/${type}${index}.png`; // Cambia la imagen con una ruta dinámica
    detailsText.innerText = `Descripción detallada de ${type} ${index}.`; // Cambia el texto descriptivo
}

// Llama a la función al cargar la página para mostrar solo "Els seus ossos" inicialmente
document.addEventListener("DOMContentLoaded", () => {
    showContent('ossos'); // Muestra el contenido de "ossos" al iniciar
});

// Event listeners para los tabs de "Els seus ossos" y "Altres feines d'alumnes"
document.getElementById("tab-ossos").addEventListener("click", () => showContent('ossos'));
document.getElementById("tab-feina").addEventListener("click", () => showContent('feina'));
