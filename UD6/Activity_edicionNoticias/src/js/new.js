$(document).ready(function () {
  // Obtener el ID de la noticia de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");

  if (!newsId) {
    $("main").html("<p>No s'ha trobat la notícia. Si us plau, torna enrere i selecciona una altra opció.</p>");
    return;
  }

  // Obtener la lista de noticias desde localStorage
  const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
  console.log("[new.js] Lista de noticias:", newsList);

  if (!newsList.length) {
    $("main").html("<p>No s'ha trobat cap notícia disponible.</p>");
    return;
  }

  // Buscar la noticia por ID
  const newsItem = newsList.find((news) => news.id === newsId);
  console.log("[new.js] Noticia encontrada:", newsItem);

  if (!newsItem) {
    $("main").html("<p>No s'ha trobat la notícia. Si us plau, torna enrere i selecciona una altra.</p>");
    return;
  }

  // Renderizar el contenido de la noticia
  const { title, author, creationDate, content } = newsItem;
  $("#news-title").text(title);
  $("#news-meta").html(`Publicat el ${creationDate} per <span class="font-semibold">${author}</span>`);

  const articleContainer = $("#news-content");
  articleContainer.empty(); // Limpiar contenido predeterminado

  if (!Array.isArray(content)) {
    console.error("[new.js] El contenido no es un array:", content);
    articleContainer.html("<p>Error en el formato del contenido.</p>");
    return;
  }

  // Generar contenido dinámico según la estructura (triple bucle)
  content.forEach((row, rowIndex) => {
    if (!row.columns || !Array.isArray(row.columns)) {
      console.error(`[new.js] La fila ${rowIndex} no tiene columnas válidas:`, row);
      return;
    }

    // Contenedor de fila con flex + gap
    const rowDiv = $('<div class="flex flex-wrap gap-6 mb-6"></div>');

    row.columns.forEach((column) => {
      // Columna a media pantalla en escritorio
      const colDiv = $('<div class="w-full md:w-1/2 px-2"></div>');

      column.forEach((element) => {
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

  // === MOSTRAR BOTONES DE EDITAR/ELIMINAR ===
  $("#news-actions").show();

  // === MANEJAR ELIMINAR NOTICIA ===
  $("#btnDelete").on("click", function () {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) {
      return;
    }
    const updatedList = newsList.filter((n) => n.id !== newsId);
    localStorage.setItem("newsList", JSON.stringify(updatedList));

    // Redirigimos de vuelta a la lista
    window.location.href = "news.html";
  });

  // === MANEJAR EDITAR NOTICIA ===
  $("#btnEdit").on("click", function () {
    // Vamos a la página de edición con el id en la URL
    window.location.href = `edit_news.html?id=${newsId}`;
  });
});
