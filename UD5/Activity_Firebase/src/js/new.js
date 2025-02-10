import { app, db } from "./firebase_config.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");
  
  if (!newsId) {
    $("main").html("<p>No s'ha trobat la notícia. Torna enrere i selecciona una altra.</p>");
    return;
  }
  
  try {
    // Obtenemos el documento de la noticia desde Firestore
    const docRef = doc(db, "news", newsId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      $("main").html("<p>Aquesta notícia no existeix. Torna enrere i selecciona una altra.</p>");
      return;
    }
    
    const newsItem = docSnap.data();
    // Rellenamos título y metadatos
    $("#news-title").text(newsItem.title);
    $("#news-meta").html(`Publicat el ${newsItem.creationDate} per <span class="font-semibold">${newsItem.author}</span>`);
    
    const articleContainer = $("#news-content");
    articleContainer.empty();
    
    if (!Array.isArray(newsItem.content)) {
      articleContainer.html("<p>Error en el format del contingut (no és un array).</p>");
      return;
    }
    
    // Recorremos cada fila. Cada fila debe tener un array "columns", y cada columna es un objeto con la propiedad "elements"
    newsItem.content.forEach((row) => {
      if (!row.columns || !Array.isArray(row.columns)) {
        console.error("Fila amb columnes no vàlides:", row);
        return;
      }
      
      const rowDiv = $('<div class="flex flex-wrap gap-6 mb-6"></div>');
      row.columns.forEach((colObj) => {
        // Cada columna es un objeto { elements: [...] }
        const colDiv = $('<div class="w-full md:w-1/2 px-2"></div>');
        if (!colObj.elements || !Array.isArray(colObj.elements)) {
          console.error("Columna sense elements vàlids:", colObj);
          return;
        }
        colObj.elements.forEach((element) => {
          if (element.type === "paragraph") {
            colDiv.append(`
              <p class="mb-4 leading-relaxed" style="text-align: justify;">
                ${element.content}
              </p>
            `);
          } else if (element.type === "image") {
            colDiv.append(`
              <img 
                src="${element.content}" 
                alt="Imatge" 
                class="max-w-full h-auto mb-4 rounded-lg shadow-md"
              >
            `);
          }
        });
        rowDiv.append(colDiv);
      });
      articleContainer.append(rowDiv);
    });
    
    // Mostramos los botones de edición y eliminación
    $("#news-actions").show();
    
    $("#btnDelete").on("click", async function () {
      if (!confirm("¿Estàs segur d'eliminar aquesta notícia?")) return;
      try {
        await deleteDoc(doc(db, "news", newsId));
        alert("Notícia eliminada correctament.");
        window.location.href = "news.html";
      } catch (error) {
        console.error("Error al eliminar la notícia:", error);
        alert("Error al eliminar la notícia.");
      }
    });
    
    $("#btnEdit").on("click", function () {
      window.location.href = `edit_news.html?id=${newsId}`;
    });
    
  } catch (error) {
    console.error("Error al carregar la notícia:", error);
    $("main").html("<p>Error al carregar la notícia.</p>");
  }
});
