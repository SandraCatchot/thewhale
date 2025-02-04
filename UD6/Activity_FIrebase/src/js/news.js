import { app, db } from "./firebase_config.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  const newsContainer = $("#container-news");

  try {
    const querySnapshot = await getDocs(collection(db, "news"));
    const newsList = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      data.docId = docSnap.id;
      newsList.push(data);
    });

    if (newsList.length === 0) {
      newsContainer.append("<p>No hi ha notícies disponibles.</p>");
      return;
    }

    newsList.forEach((newsItem) => {
      const image =
        findFirstImage(newsItem.content) || "../images/logo_ok_AULAMUSEU.png";
      const summary = createSummary(newsItem.content);

      const newsCard = `
       <div class="card-component">
       <img src="${image}" alt="Imatge notícia" class="card-image">
    <div class="p-4">
      <h2 class="text-xl font-bold text-oscuroS mb-2">
        <a href="new.html?id=${newsItem.docId}" class="hover:underline">${newsItem.title}</a>
      </h2>
      <p class="mb-4">${newsItem.creationDate} - ${newsItem.author}</p>
      <p class="mb-4">${summary}</p>
      <a href="new.html?id=${newsItem.docId}" class="text-azulS font-semibold hover:underline">Llegeix més</a>
    </div>
  </div>
`;

      newsContainer.append(newsCard);
    });
  } catch (error) {
    console.error("Error al cargar noticias:", error);
    newsContainer.append("<p>Error al cargar notícies.</p>");
  }

  function findFirstImage(contentArray) {
    if (!Array.isArray(contentArray)) return null;
    for (const row of contentArray) {
      if (row && Array.isArray(row.columns)) {
        for (const colObj of row.columns) {
          if (colObj && Array.isArray(colObj.elements)) {
            for (const element of colObj.elements) {
              if (element.type === "image" && element.content) {
                return element.content;
              }
            }
          }
        }
      }
    }
    return null;
  }

  function createSummary(contentArray) {
    if (!Array.isArray(contentArray)) return "No hi ha contingut disponible.";
    let text = "";
    for (const row of contentArray) {
      if (row && Array.isArray(row.columns)) {
        for (const colObj of row.columns) {
          if (colObj && Array.isArray(colObj.elements)) {
            for (const element of colObj.elements) {
              if (element.type === "paragraph" && element.content) {
                text += element.content.trim() + " ";
              }
            }
          }
        }
      }
    }
    text = text.trim();
    if (!text) return "No hi ha contingut disponible.";
    return text.length > 100 ? text.slice(0, 100) + "..." : text;
  }
});
