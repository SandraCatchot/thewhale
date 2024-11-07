const btnAcces = document.getElementById("btnAccess");
const panel = document.getElementById("access-panel");

function toggleAccessPanel() {        
    panel.classList.toggle("visible");
}

document.addEventListener("DOMContentLoaded", () => {
    btnAcces.addEventListener("click", () => toggleAccessPanel());
    
});


