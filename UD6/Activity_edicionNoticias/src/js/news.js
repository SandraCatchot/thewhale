// news.js
$(document).ready(function () {
  const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
  const newsContainer = $("#container-news");

  if (newsList.length === 0) {
    newsContainer.append("<p>No hay noticias disponibles.</p>");
    return;
  }

  newsList.forEach((newsItem) => {
    const image = findFirstImage(newsItem.content) || "../images/logo_ok_AULAMUSEU.png";
    const summary = createSummary(newsItem.content);

    const newsCard = `
      <div class="card-component">
        <img src="${image}" alt="Imatge notícia" class="card-image">
        <div class="p-4">
          <h2 class="text-xl font-bold text-oscuroS mb-2">${newsItem.title}</h2>
          <p class="mb-4">${newsItem.creationDate} - ${newsItem.author}</p>
          <p class="mb-4">${summary}</p>
          <a href="new.html?id=${newsItem.id}" class="text-azulS font-semibold hover:underline">Llegeix més</a>
        </div>
      </div>
    `;
    newsContainer.append(newsCard);
  });

  function findFirstImage(contentArray) {
    if (!Array.isArray(contentArray)) return null;
    for (const row of contentArray) {
      if (row && Array.isArray(row.columns)) {
        for (const columnArr of row.columns) {
          if (!Array.isArray(columnArr)) continue;
          for (const element of columnArr) {
            if (element.type === "image" && element.content) {
              return element.content;
            }
          }
        }
      }
    }
    return null;
  }

  function createSummary(contentArray) {
    if (!Array.isArray(contentArray)) return "No hay contenido disponible.";

    let text = "";
    for (const row of contentArray) {
      if (row && Array.isArray(row.columns)) {
        for (const columnArr of row.columns) {
          if (!Array.isArray(columnArr)) continue;
          for (const element of columnArr) {
            if (element.type === "paragraph" && element.content) {
              text += element.content.trim() + " ";
            }
          }
        }
      }
    }

    text = text.trim();
    if (!text) return "No hay contenido disponible.";
    if (text.length > 100) {
      return text.slice(0, 100) + "...";
    }
    return text;
  }
});
