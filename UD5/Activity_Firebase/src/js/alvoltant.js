document.addEventListener("DOMContentLoaded", () => {
    const boneDetails = {
        os1: {
            image: "../images/ossos/ossos1.webp",
            text: "Aquest os formava part de la secció superior de la columna vertebral de la balena, un punt de connexió crucial entre les vèrtebres i els músculs de l'esquena. La seva estructura robusta i corba permetia distribuir la pressió i suportar el pes del cos de la balena mentre nedava a l'oceà. Les marques de desgast evidencien anys de moviment constant, impulsant el gran cetaci a través de les aigües profundes."
        },
        os2: {
            image: "../images/ossos/ossos2.webp",
            text: "Aquesta costella protegia el cor i els pulmons de la balena, formant part de la seva gran caixa toràcica. La forma lleugerament arquejada i allargada indica la seva funció de protecció a la part frontal de l'animal. Les senyals de desgast i les petites marques a la superfície suggereixen que aquesta balena podria haver viscut una vida plena de trobades i batalles en el seu entorn marí."
        },
        os3: {
            image: "../images/ossos/ossos3.webp",
            text: "L'escàpula d'una balena és essencial per a la unió de les aletes anteriors. Aquest os ample i aplanat actuava com a base per als músculs i els lligaments de l'aleta, proporcionant flexibilitat i potència. La seva forma asimètrica revela la força i l'agilitat de la balena al nedar i maniobrar a l'oceà, amb una resistència estructural que evidencia la seva importància en la mobilitat de l'animal."
        },
        os4: {
            image: "../images/ossos/ossos4.webp",
            text: "Encara que les balenes modernes no tenen extremitats posteriors visibles, posseeixen restes vestigials com aquest petit os que en temps antics era part d'una cama. Aquest fèmur reduït és una relíquia evolutiva, un recordatori de quan els ancestres de les balenes caminaven per terra. La seva mida reduïda i estructura simplificada parlen de milions d'anys d'adaptació al medi aquàtic."
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

    function showContent(type) {
        const tabOssos = document.getElementById("tab-ossos");
        const tabFeina = document.getElementById("tab-feina");
        const ossosCards = document.querySelectorAll(".card-ossos");
        const feinaCards = document.querySelectorAll(".card-feina");

        if (type === 'ossos') {
            tabOssos.classList.add("active");
            tabFeina.classList.remove("active");

            ossosCards.forEach(card => card.style.display = "block");
            feinaCards.forEach(card => card.style.display = "none");

            loadList('ossos');
        } else if (type === 'feina') {
            tabOssos.classList.remove("active");
            tabFeina.classList.add("active");

            ossosCards.forEach(card => card.style.display = "none");
            feinaCards.forEach(card => card.style.display = "block");

            loadList('feina');
        }
    }

    function loadList(type) {
        const listado = document.getElementById("listado");
        listado.innerHTML = ""; 

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

        items.forEach((item, index) => {
            const listItem = document.createElement("div");
            listItem.className = "list-item";
            listItem.innerText = item;
            listItem.onclick = () => showDetail(type, index + 1); 
            listado.appendChild(listItem);
        });
    }

    function showDetail(type, index) {
        const detailsImage = document.getElementById("details-image");
        const detailsText = document.getElementById("details-text");

        if (type === 'ossos') {
            const boneKey = `os${index}`;
            if (boneDetails[boneKey]) {
                detailsImage.src = boneDetails[boneKey].image; 
                detailsText.innerText = boneDetails[boneKey].text; 
            }
        } else {
            detailsImage.src = `../images/feina/feina${index}.webp`; 
            detailsText.innerText = `Descripción detallada de feina ${index}.`; 
        }
    }

    showContent('ossos'); 

    const tabOssos = document.getElementById("tab-ossos");
    const tabFeina = document.getElementById("tab-feina");

    if (tabOssos && tabFeina) {
        tabOssos.addEventListener("click", () => showContent('ossos'));
        tabFeina.addEventListener("click", () => showContent('feina'));
    }
});
