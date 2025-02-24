$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const editingId = urlParams.get("id"); // si existe => modo EDICIÓN

  if (editingId) {
    // Cargar la noticia
    const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
    const newsItem = newsList.find((n) => n.id === editingId);

    if (!newsItem) {
      alert("No se encontró la noticia a editar.");
    } else {
      // Llenar título/autor
      $("#news-title").val(newsItem.title);
      $("#news-author").val(newsItem.author);
      // Construir filas/columnas con su contenido
      loadContentIntoBuilder(newsItem.content);
    }
  }
  // Si no hay editingId => modo creación normal

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

        // Reglas para cuántos elementos caben en cada columna
        if ($(this).children().length >= 2 && $(this).hasClass("half")) {
          alert("Solo se permiten dos elementos por columna.");
          return;
        }
        if ($(this).children().length >= 1 && !$(this).hasClass("half")) {
          alert("Solo se permite un elemento en esta columna.");
          return;
        }

        let newElement;
        if (type === "paragraph") {
          newElement = $(`
            <div class="element">
              <p class="editable" onclick="editParagraph(this)">Escribe aquí tu texto...</p>
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
    const user = JSON.parse(localStorage.getItem("logged_in_user")) || [];
    const author = user.name;    

    if (!title || !author) {
      alert("Por favor, rellena título y autor.");
      return;
    }

    // Recolectar filas/columnas con posible conversión Base64
    const content = await collectContentWithBase64();
    const newsList = JSON.parse(localStorage.getItem("newsList")) || [];

    if (editingId) {
      // Modo EDICIÓN
      const index = newsList.findIndex((n) => n.id === editingId);
      if (index === -1) {
        alert("No se encontró la noticia a editar.");
        return;
      }

      // Actualizamos
      newsList[index].title = title;
      newsList[index].author = author;
      newsList[index].content = content;
      newsList[index].modificationDate = new Date().toISOString().split("T")[0];

      localStorage.setItem("newsList", JSON.stringify(newsList));
      alert("Noticia actualizada correctamente.");
      window.location.href = `new.html?id=${editingId}`;
    } else {
      // Modo CREACIÓN
      const creationDate = new Date().toISOString().split("T")[0];
      const newNews = {
        id: Date.now().toString(),
        title,
        author,
        creationDate,
        modificationDate: creationDate,
        content,
        status: 0,
      };
      newsList.push(newNews);
      localStorage.setItem("newsList", JSON.stringify(newsList));
      alert("Noticia creada exitosamente.");
      window.location.href = "news.html";
    }
  });

  function loadContentIntoBuilder(contentArray) {
    // Borra todo y reconstruye
    $(".row-container").empty();
    contentArray.forEach((rowObj) => {
      // rowObj = { type: "row", columns: [ [...], [...], ...] }
      const columnCount = rowObj.columns.length;
      let newRowHtml = '<div class="row">';

      rowObj.columns.forEach((columnArr) => {
        if (columnCount === 2) {
          newRowHtml += `<div class="column half">`;
        } else {
          newRowHtml += `<div class="column">`;
        }

        // columnArr => array de { type, content }
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
        newRowHtml += `</div>`; // fin .column
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
                  // Revisa si hay input[type=file]
                  const $fileInput = $element.find("input[type='file']");
                  let base64Image = "";
                  if ($fileInput.length > 0 && $fileInput[0].files[0]) {
                    base64Image = await convertFileToBase64($fileInput[0].files[0]);
                  } else {
                    // No hay input, o no se seleccionó => usamos lo que ya tenga
                    base64Image = $element.find("img").attr("src") || "";
                  }
                  colElements.push({
                    type: "image",
                    content: base64Image,
                  });
                }
              })
            );
            rowObj.columns.push(colElements);
          })
        );
        content.push(rowObj);
      })
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

function loadImage(event) {
  const input = event.target;
  const reader = new FileReader();
  reader.onload = function () {
    const img = $(input).siblings("img");
    img.attr("src", reader.result);
    img.show();
    $(input).hide();
  };
  reader.readAsDataURL(input.files[0]);
}

function editParagraph(paragraph) {
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
}
