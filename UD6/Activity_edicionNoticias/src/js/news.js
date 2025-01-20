$(document).ready(function () {
  const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
  const newsContainer = $("#container-news");

  if (newsList.length === 0) {
    newsContainer.append("<p>No hay noticias disponibles.</p>");
    return;
  }

  newsList.forEach((news) => {
    // Generar el resumen
    const summary = news.content
      .map((row) =>
        row.columns
          .filter((col) => col.type === "paragraph" && col.content)
          .map((col) => col.content.trim())
          .join(" ")
      )
      .join(" ")
      .slice(0, 100);

    // Obtener la imagen o usar la predeterminada
    const image =
      news.content
        .find((row) => row.columns.some((col) => col.type === "image"))
        ?.columns.find((col) => col.type === "image")?.content ||
      "../images/logo_ok_AULAMUSEU.png";

    const newsCard = `
      <div class="card-component">
        <img src="${image}" alt="Imatge notícia" class="card-image">
        <div class="p-4">
          <h2 class="text-xl font-bold text-oscuroS mb-2">${news.title}</h2>
          <p class="mb-4">${news.creationDate} - ${news.author}</p>
          <p class="mb-4">${summary || "No hay contenido disponible"}...</p>
          <a href="new.html?id=${news.id}" class="text-azulS font-semibold hover:underline">Llegeix més</a>
        </div>
      </div>`;
    newsContainer.append(newsCard);
  });
});
