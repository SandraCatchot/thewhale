$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");
  if (!newsId) {
    $("main").html("<p>No s'ha trobat la notícia. Torna enrere i selecciona una altra.</p>");
    return;
  }

  const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
  if (!newsList.length) {
    $("main").html("<p>No hi ha notícies disponibles.</p>");
    return;
  }

  const newsItem = newsList.find((n) => n.id === newsId);
  if (!newsItem) {
    $("main").html("<p>Aquesta notícia no existeix. Torna enrere i selecciona una altra.</p>");
    return;
  }

  $("#news-title").text(newsItem.title);
  $("#news-meta").html(`Publicat el ${newsItem.creationDate} per <span class="font-semibold">${newsItem.author}</span>`);

  const articleContainer = $("#news-content");
  articleContainer.empty();

  // Verificamos que sea array
  if (!Array.isArray(newsItem.content)) {
    articleContainer.html("<p>Error en el formato del contenido (no es un array).</p>");
    return;
  }

  // Añadimos filas/columnas
  newsItem.content.forEach((row, rowIndex) => {
    if (!row.columns || !Array.isArray(row.columns)) {
      console.error("Fila con columnas no válidas:", row);
      return;
    }

    const rowDiv = $('<div class="flex flex-wrap gap-6 mb-6"></div>');
    row.columns.forEach((column) => {
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

  // Mostramos los botones de editar/eliminar
  $("#news-actions").show();

  $("#btnDelete").on("click", function () {
    if (!confirm("¿Estás seguro de eliminar esta noticia?")) return;

    const updatedList = newsList.filter((n) => n.id !== newsId);
    localStorage.setItem("newsList", JSON.stringify(updatedList));
    window.location.href = "news.html";
  });

  $("#btnEdit").on("click", function () {
    window.location.href = `edit_news.html?id=${newsId}`;
  });
});
