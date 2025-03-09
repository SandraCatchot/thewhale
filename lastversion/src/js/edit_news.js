import { db } from "./firebase_config.js";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  let loggedInUserName = "";
  const usuarioLogueado = localStorage.getItem("logged_in_user");
  if (usuarioLogueado) {
    const user = JSON.parse(usuarioLogueado);
    loggedInUserName = user.name;
  }

  // Obtener parámetro 'id' para saber si se está editando una noticia
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id");

  // Cargar Notícia (modo edición)
  if (editingId) {
    try {
      const docRef = doc(db, "news", editingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newsItem = docSnap.data();
        $("#news-title").val(newsItem.title);
        loadContentIntoBuilder(newsItem.content);
      } else {
        alert("No s'ha trobat la notícia que es vol editar.");
      }
    } catch (error) {
      console.error("Error al carregar la notícia:", error);
      alert("Error al carregar la notícia.");
    }
  }

  initDraggableTools();
  initializeDroppable();
  initializeDeleteButtons();

  $("#add-row").on("click", addNewRow);
  $("#save-news").on("click", saveNewsHandler);


  function initDraggableTools() {
    $(".tool").draggable({
      helper: "clone",
      revert: "invalid",
    });
  }

  function initializeDroppable() {
    $(".column").droppable({
      accept: ".tool",
      over: function () {
        $(this).addClass("drag-over");
      },
      out: function () {
        $(this).removeClass("drag-over");
      },
      drop: function (event, ui) {
        $(this).removeClass("drag-over");
        const type = ui.draggable.data("type");

        if ($(this).children().length >= 2 && $(this).hasClass("half")) {
          alert("Només està permès 2 elements per columna.");
          return;
        }
        if ($(this).children().length >= 1 && !$(this).hasClass("half")) {
          alert("Només pots utilitzar un element.");
          return;
        }

        let newElement = "";
        if (type === "paragraph") {
          newElement = $(`
            <div class="element">
              <p class="editable" onclick="editParagraph(this)">Escriu aqui el teu text...</p>
            </div>
          `);
        } else if (type === "image") {
          newElement = $(`
            <div class="element">
              <input type="file" accept="image/*" onchange="loadImage(event)" />
              <img src="" alt="Imagen" style="display: none;">
            </div>
          `);
        }
        $(this).append(newElement);
        makeElementsDraggable();
      },
    });
  }

  function makeElementsDraggable() {
    $(".element").draggable({
      helper: "original",
      revert: "invalid",
    });
  }

  function addNewRow() {
    const columnCount = $("#column-choice").val();
    let newRowHtml = '<div class="row">';
    if (columnCount === "1") {
      newRowHtml += `<div class="column"></div>`;
    } else {
      newRowHtml += `
        <div class="column half"></div>
        <div class="column half"></div>`;
    }
    newRowHtml += `<button class="delete-row-btn">Eliminar fila</button></div>`;
    $(".row-container").append(newRowHtml);
    initializeDroppable();
    initializeDeleteButtons();
  }

  function initializeDeleteButtons() {
    $(".delete-row-btn")
      .off("click")
      .on("click", function () {
        $(this).closest(".row").remove();
      });
  }

  function loadContentIntoBuilder(contentArray) {
    $(".row-container").empty();
    contentArray.forEach((rowObj) => {
      const columnCount = rowObj.columns.length;
      let rowHtml = `<div class="row">`;
      rowObj.columns.forEach((columnObj) => {
        const elementsArray = columnObj.elements;
        rowHtml +=
          columnCount === 2
            ? `<div class="column half">`
            : `<div class="column">`;
        elementsArray.forEach((element) => {
          if (element.type === "paragraph") {
            rowHtml += `
              <div class="element">
                <p class="editable" onclick="editParagraph(this)">${element.content}</p>
              </div>
            `;
          } else if (element.type === "image") {
            rowHtml += `
              <div class="element">
                <img src="${element.content}" alt="Imagen">
              </div>
            `;
          }
        });
        rowHtml += `</div>`;
      });
      rowHtml += `<button class="delete-row-btn">Eliminar fila</button></div>`;
      $(".row-container").append(rowHtml);
    });
    
    initializeDroppable();
    initializeDeleteButtons();
  }


  async function saveNewsHandler() {
    const title = $("#news-title").val().trim();
    const author = loggedInUserName;
    if (!title || !author) {
      alert(
        "Si us plau, has d'omplir títol i tenir sessió iniciada per definir l'autor."
      );
      return;
    }
    const content = await collectContentWithBase64();
    if (editingId) {
      try {
        const docRef = doc(db, "news", editingId);
        await updateDoc(docRef, {
          title: title,
          author: author,
          content: content,
          modificationDate: new Date().toISOString().split("T")[0],
        });
        alert("Notícia actualitzada correctament.");
        window.location.href = `news.html?id=${editingId}`;
      } catch (error) {
        console.error("Error al actualitzar la notícia:", error);
        alert("Error al actualitzar la notícia.");
      }
    } else {
      try {
        const creationDate = new Date().toISOString().split("T")[0];
        const newNews = {
          title: title,
          author: author,
          creationDate: creationDate,
          modificationDate: creationDate,
          content: content,
          status: 0,
        };
        const docRef = await addDoc(collection(db, "news"), newNews);
        alert("Notícia creada correctament.");
        window.location.href = `news.html?id=${docRef.id}`;
      } catch (error) {
        console.error("Error al crear la notícia:", error);
        alert("Error al crear la notícia.");
      }
    }
  }

  async function collectContentWithBase64() {
    const content = [];
    const rows = $(".row").toArray();
    for (const rowElem of rows) {
      const rowObj = { type: "row", columns: [] };
      const columns = $(rowElem).find(".column").toArray();
      for (const colElem of columns) {
        const colElements = [];
        const elements = $(colElem).find(".element").toArray();
        for (const el of elements) {
          const $el = $(el);
          if ($el.find("p").length > 0) {
            colElements.push({
              type: "paragraph",
              content: $el.find("p").text().trim(),
            });
          } else if ($el.find("img").length > 0) {
            const $fileInput = $el.find("input[type='file']");
            let base64Image = "";
            if ($fileInput.length > 0 && $fileInput[0].files[0]) {
              base64Image = await convertFileToBase64($fileInput[0].files[0]);
            } else {
              base64Image = $el.find("img").attr("src") || "";
            }
            colElements.push({
              type: "image",
              content: base64Image,
            });
          }
        }
        rowObj.columns.push({ elements: colElements });
      }
      content.push(rowObj);
    }
    return content;
  }

  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
});


window.loadImage = function (event) {
  const input = event.target;
  const reader = new FileReader();
  reader.onload = function () {
    const img = $(input).siblings("img");
    img.attr("src", reader.result);
    img.show();
    $(input).hide();
  };
  reader.readAsDataURL(input.files[0]);
};

window.editParagraph = function (paragraph) {
  const $p = $(paragraph);
  const currentText = $p.text();
  const textarea = $(
    `<textarea class="editable-input">${currentText}</textarea>`
  );
  textarea.on("blur", function () {
    const newText = $(this).val();
    $p.text(newText);
    $p.show();
    $(this).remove();
  });
  $p.hide();
  $p.after(textarea);
  textarea.focus();
};
