$(function () {
  $(".tool").draggable({
    helper: "clone",
    revert: "invalid",
  });

  function initializeDroppable() {
    $(".column").droppable({
      accept: ".tool",
      over: function (event, ui) {
        $(this).addClass("drag-over");
      },
      out: function (event, ui) {
        $(this).removeClass("drag-over");
      },
      drop: function (event, ui) {
        $(this).removeClass("drag-over");

        const type = ui.draggable.data("type");

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
          newElement = $(
            `<div class="element">
                <p class="editable" onclick="editParagraph(this)">Escribe aquí tu texto...</p>
              </div>`
          );
        } else if (type === "image") {
          newElement = $(
            `<div class="element">
                <input type="file" accept="image/*" onchange="loadImage(event)" />
                <img src="" alt="Imagen" style="display: none;">
              </div>`
          );
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

    newRow += `
        <button class="delete-row-btn">Eliminar fila</button>
        </div>`;
    $("#builder .row-container").append(newRow);

    initializeDroppable();
    initializeDeleteButtons();
  });

  function initializeDeleteButtons() {
    $(".delete-row-btn")
      .off("click")
      .on("click", function () {
        $(this).closest(".row").remove();
      });
  }

  // Guardar configuración
  $("#save-config").on("click", function () {
    const rows = [];
    $(".row").each(function () {
      const row = [];
      $(this)
        .find(".column")
        .each(function () {
          const column = [];
          $(this)
            .children(".element")
            .each(function () {
              if ($(this).find("p").length) {
                column.push({
                  type: "paragraph",
                  content: $(this).find("p").text(),
                });
              } else if ($(this).find("img").length) {
                column.push({
                  type: "image",
                  src: $(this).find("img").attr("src"),
                });
              }
            });
          row.push(column);
        });
      rows.push(row);
    });

    const config = JSON.stringify(rows);
    localStorage.setItem("postBuilderConfig", config);
    alert("Configuración guardada en el navegador.");
  });

  // Cargar configuración
  $("#load-config").on("click", function () {
    const config = localStorage.getItem("postBuilderConfig");
    if (!config) {
      alert("No hay configuración guardada.");
      return;
    }

    const rows = JSON.parse(config);
    $(".row-container").empty(); // Limpiar todo antes de cargar
    rows.forEach((row) => {
      let newRow = '<div class="row">';
      row.forEach((column) => {
        newRow +=
          column.length > 1
            ? `<div class="column half">`
            : `<div class="column">`;
        column.forEach((element) => {
          if (element.type === "paragraph") {
            newRow += `
                <div class="element">
                  <p class="editable" onclick="editParagraph(this)">${element.content}</p>
                </div>`;
          } else if (element.type === "image") {
            newRow += `
                <div class="element">
                  <img src="${element.src}" alt="Imagen">
                </div>`;
          }
        });
        newRow += `</div>`;
      });
      newRow += `<button class="delete-row-btn">Eliminar fila</button></div>`;
      $(".row-container").append(newRow);
    });

    initializeDroppable();
    initializeDeleteButtons();
  });

  initializeDroppable();
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
  const textarea = $(
    `<textarea class="editable-input">${currentText}</textarea>`
  );

  textarea.on("input", function () {
    // Esto asegura que el texto escrito sea visible
    const text = $(this).val();
    if (!text.trim()) {
      $(this).css("color", "#a0a0a0");
    } else {
      $(this).css("color", "#01161e");
    }
  });

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
