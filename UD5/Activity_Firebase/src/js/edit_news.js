import { db } from "./firebase_config.js";
import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  collection
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id"); 

  if (editingId) {
    try {
      const docRef = doc(db, "news", editingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const newsItem = docSnap.data();
        $("#news-title").val(newsItem.title);
        $("#news-author").val(newsItem.author);
        loadContentIntoBuilder(newsItem.content);
      } else {
        alert("No s'ha trobat la notícia que es vol editar.");
      }
    } catch (error) {
      console.error("S'ha produït un ERROR al carregar la notícia: ", error);
      alert("Error al carregar la notícia.");
    }
  }
  
  $(".tool").draggable({
    helper: "clone",
    revert: "invalid",
  });

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

        let newElement;
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

  $("#add-row").on("click", function () {
    const columnCount = $("#column-choice").val();
    let newRow = '<div class="row">';

    if (columnCount === "1") {
      newRow += `<div class="column"></div>`;
    } else {
      newRow += `
        <div class="column half"></div>
        <div class="column half"></div>`;
    }
    newRow += `<button class="delete-row-btn">Eliminar fila</button></div>`;

    $(".row-container").append(newRow);
    initializeDroppable();
    initializeDeleteButtons();
  });

  function initializeDeleteButtons() {
    $(".delete-row-btn").off("click").on("click", function () {
      $(this).closest(".row").remove();
    });
  }

  initializeDroppable();
  initializeDeleteButtons();

  $("#save-news").on("click", async function () {
    const title = $("#news-title").val().trim();
    const author = $("#news-author").val().trim();
    if (!title || !author) {
      alert("Si us plau, has d'omplir títol i autor.");
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
          modificationDate: new Date().toISOString().split("T")[0]
        });
        alert("Notícia actualitzada correctament.");
        window.location.href = `news.html?id=${editingId}`;
      } catch (error) {
        console.error("Error al actualitzar la notícia: ", error);
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
          status: 0
        };
        const docRef = await addDoc(collection(db, "news"), newNews);
        alert("Notícia creada correctament.");
        window.location.href = `news.html?id=${docRef.id}`;
      } catch (error) {
        console.error("Error al crear la noticia: ", error);
        alert("Error al crear la notícia.");
      }
    }
  });

  function loadContentIntoBuilder(contentArray) {
    $(".row-container").empty();
    contentArray.forEach((rowObj) => {
      const columnCount = rowObj.columns.length;
      let newRowHtml = '<div class="row">';

      rowObj.columns.forEach((columnObj) => {
        const columnArr = columnObj.elements; 
        if (columnCount === 2) {
          newRowHtml += `<div class="column half">`;
        } else {
          newRowHtml += `<div class="column">`;
        }

        columnArr.forEach((element) => {
          if (element.type === "paragraph") {
            newRowHtml += `
              <div class="element">
                <p class="editable" onclick="editParagraph(this)">${element.content}</p>
              </div>
            `;
          } else if (element.type === "image") {
            newRowHtml += `
              <div class="element">
                <img src="${element.content}" alt="Imagen">
              </div>
            `;
          }
        });
        newRowHtml += `</div>`;
      });

      newRowHtml += `<button class="delete-row-btn">Eliminar fila</button></div>`;
      $(".row-container").append(newRowHtml);
    });

    initializeDroppable();
    initializeDeleteButtons();
  }

  async function collectContentWithBase64() {
    const content = [];
    await Promise.all(
      $(".row").map(async function () {
        const rowObj = { type: "row", columns: [] };
        const $columns = $(this).find(".column");

        await Promise.all(
          $columns.map(async function () {
            const colElements = [];
            const $elements = $(this).find(".element");
            await Promise.all(
              $elements.map(async function () {
                const $element = $(this);
                if ($element.find("p").length > 0) {
                  colElements.push({
                    type: "paragraph",
                    content: $element.find("p").text().trim(),
                  });
                } else if ($element.find("img").length > 0) {
                  const $fileInput = $element.find("input[type='file']");
                  let base64Image = "";
                  if ($fileInput.length > 0 && $fileInput[0].files[0]) {
                    base64Image = await convertFileToBase64($fileInput[0].files[0]);
                  } else {
                    base64Image = $element.find("img").attr("src") || "";
                  }
                  colElements.push({
                    type: "image",
                    content: base64Image,
                  });
                }
              }).get() 
            );
            rowObj.columns.push({ elements: colElements });
          }).get()
        );
        content.push(rowObj);
      }).get()
    );
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

window.loadImage = function(event) {
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

window.editParagraph = function(paragraph) {
  const $p = $(paragraph);
  const currentText = $p.text();
  const textarea = $(`<textarea class="editable-input">${currentText}</textarea>`);

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
