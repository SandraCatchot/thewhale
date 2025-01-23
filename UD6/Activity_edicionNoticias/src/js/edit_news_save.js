$(document).ready(function () {
  // Función para convertir un archivo a Base64
  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  $("#save-news").on("click", async function () {
    const title = $("#news-title").val().trim();
    const author = $("#news-author").val().trim();
    const creationDate = new Date().toISOString().split("T")[0];
    const modificationDate = creationDate;

    if (!title || !author) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    /**
     * Estructura final: 
     *   content = [
     *     {
     *       type: "row",
     *       columns: [
     *         [ { type, content }, { type, content } ],   // col 1
     *         [ { type, content } ]                       // col 2
     *       ]
     *     },
     *     { ... }
     *   ]
     */
    const content = [];

    // Para manejar la conversión a Base64 de manera asíncrona, usamos Promise.all en cada nivel.
    await Promise.all(
      // Recorremos cada fila .row
      $(".row").map(async function () {
        const rowObj = { type: "row", columns: [] };

        const $columns = $(this).find(".column");
        // Para cada columna de la fila
        await Promise.all(
          $columns.map(async function () {
            const colElements = [];
            const $elements = $(this).find(".element");

            // Para cada "element" dentro de la columna
            await Promise.all(
              $elements.map(async function () {
                const $element = $(this);
                // Revisamos si es un párrafo o imagen
                if ($element.find("p").length > 0) {
                  // Es un párrafo
                  const text = $element.find("p").text().trim() || "";
                  colElements.push({
                    type: "paragraph",
                    content: text,
                  });
                } else if ($element.find("img").length > 0) {
                  // Es una imagen: primero vemos si hay <input type="file">
                  const $fileInput = $element.find("input[type='file']");
                  let base64Image = "";

                  // Si el usuario ha seleccionado un archivo, lo convertimos
                  if ($fileInput.length > 0 && $fileInput[0].files[0]) {
                    base64Image = await convertFileToBase64($fileInput[0].files[0]);
                  } else {
                    // Si no, tomamos directamente el src que ya tenga la <img>
                    base64Image = $element.find("img").attr("src") || "";
                  }

                  colElements.push({
                    type: "image",
                    content: base64Image,
                  });
                }
              })
            ); // fin Promise.all de $elements

            // Agregamos el array de elementos de esta columna al rowObj
            rowObj.columns.push(colElements);
          })
        ); // fin Promise.all de $columns

        // Agregamos la fila completa al array "content"
        content.push(rowObj);
      })
    ); // fin Promise.all de las filas .row

    // Creamos la noticia con toda la información
    const newNews = {
      id: Date.now().toString(),
      title,
      author,
      creationDate,
      modificationDate,
      content,
      status: 0,
    };

    // Guardamos en localStorage
    const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
    newsList.push(newNews);
    localStorage.setItem("newsList", JSON.stringify(newsList));

    // Reseteamos los campos y el builder
    $("#news-title").val("");
    $("#news-author").val("");
    $(".row-container").empty();

    alert("Noticia creada exitosamente.");
  });
});
