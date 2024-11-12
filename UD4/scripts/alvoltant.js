document.addEventListener("DOMContentLoaded", () => {
    // Diccionario con las descripciones y las imágenes correspondientes para los huesos
    const boneDetails = {
        os1: {
            image: "../images/ossos/ossos1.webp",
            text: "Aquest ós formava part de la secció superior de la columna vertebral de la balena..."
        },
        os2: {
            image: "../images/ossos/ossos2.webp",
            text: "Aquesta costella protegia el cor i els pulmons de la balena..."
        },
        os3: {
            image: "../images/ossos/ossos3.webp",
            text: "L'escàpula d'una balena és essencial per a la unió de les aletes anteriors..."
        },
        os4: {
            image: "../images/ossos/ossos4.webp",
            text: "Encara que les balenes modernes no tenen extremitats posteriors visibles..."
        },
        os5: {
            image: "../images/ossos/ossos5.webp",
            text: "Aquest os allargat i robust formava part de la mandíbula de la balena..."
        },
        os6: {
            image: "../images/ossos/ossos6.webp",
            text: "Situada a prop de la cua, aquesta vèrtebra era part de l'estructura que donava suport..."
        },
    };

    // Función para alternar entre "Els seus ossos" y "Altres feines d'alumnes"
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
        const items = type === 'ossos' ? [
            "Ós 1: VÈRTEX DORSAL",
            "Ós 2: COSTELLA TORÀCICA",
            "Ós 3: ESCÀPULA DRETA",
            "Ós 4: FÉMUR VESTIGIAL",
            "Ós 5: MANDÍBULA INFERIOR",
            "Ós 6: VÈRTEBRA CAUDAL"
        ] : [
            "Feina 1",
            "Feina 2",
            "Feina 3",
            "Feina 4",
            "Feina 5"
        ];

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
        if (type === 'ossos') {
            // Usa la información de boneDetails para ossos
            const boneKey = `os${index}`;
            if (boneDetails[boneKey]) {
                detailsImage.src = boneDetails[boneKey].image; // Imagen específica del hueso
                detailsText.innerText = boneDetails[boneKey].text; // Descripción específica del hueso
            }
        } else {
            // Para otros tipos (feina), muestra una descripción genérica
            detailsImage.src = `../images/feina/feina${index}.webp`; // Cambia la imagen con una ruta dinámica
            detailsText.innerText = `Descripción detallada de feina ${index}.`; // Cambia el texto descriptivo
        }
    }

    // Inicialización al cargar la página
    showContent('ossos'); // Muestra el contenido de "ossos" al iniciar

    // Event listeners para los tabs
    const tabOssos = document.getElementById("tab-ossos");
    const tabFeina = document.getElementById("tab-feina");

    if (tabOssos && tabFeina) {
        tabOssos.addEventListener("click", () => showContent('ossos'));
        tabFeina.addEventListener("click", () => showContent('feina'));
    }
});
