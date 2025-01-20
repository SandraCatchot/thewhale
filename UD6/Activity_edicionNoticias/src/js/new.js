$(document).ready(function () {
  // Obtener el ID de la noticia de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get("id");

  if (!newsId) {
    $("main").html("<p>No s'ha trobat la notícia. Si us plau, torna enrere i selecciona una altra.</p>");
    return;
  }

  // Obtener la lista de noticias desde localStorage
  const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
  const newsItem = newsList.find((news) => news.id === newsId);

  if (!newsItem) {
    $("main").html("<p>No s'ha trobat la notícia. Si us plau, torna enrere i selecciona una altra.</p>");
    return;
  }

  // Renderizar el contenido de la noticia
  const { title, author, creationDate, content } = newsItem;

  $("#news-title").text(title); // Actualizar título
  $("#news-meta").html(`Publicat el ${creationDate} per <span class="font-semibold">${author}</span>`);

  const articleContainer = $("#news-content");
  articleContainer.empty(); // Limpiar contenido predeterminado

  // Generar contenido dinámico según la estructura
  content.forEach((row) => {
    const rowDiv = $('<div class="flex flex-wrap mb-4"></div>'); // Contenedor de fila

    row.forEach((column) => {
      const colDiv = $('<div class="w-full md:w-1/2 p-2"></div>'); // Columna

      column.forEach((element) => {
        if (element.type === "paragraph") {
          colDiv.append(`<p class="mb-2">${element.content}</p>`);
        } else if (element.type === "image") {
          colDiv.append(`<img src="${element.src}" alt="Imatge" class="w-full h-auto mb-2 rounded-lg shadow-md">`);
        }
      });

      rowDiv.append(colDiv);
    });

    articleContainer.append(rowDiv);
  });
});
