$(document).ready(function () {
  $("#save-news").on("click", async function () {
    const title = $("#news-title").val();
    const author = $("#news-author").val();

    const creationDate = new Date().toISOString().split("T")[0];
    const modificationDate = creationDate;

    if (!title.trim() || !author.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const content = [];

    //HE USADO ESTO COMO ULTIMO RECURSO PORQUE NO HABIA MANERA DE QUE SE SUBIERAN LAS FOTOS BIEN Y SIEMPRE COGIA LA PROGRAMADA POR DEFECTO
    // Procesar cada fila
    await Promise.all(
      $(".row").map(async function () {
        const row = { type: "row", columns: [] };

        const columns = $(this).find(".column");
        await Promise.all(
          columns.map(async function () {
            const column = $(this);
            const element = column.find(".element");

            if (element.length === 0) return;

            const type = element.find("p").length ? "paragraph" : "image";
            let contentValue = null;

            if (type === "paragraph") {
              contentValue = element.find("p").text().trim() || null;
            } else if (type === "image") {
              const input = element.find("input[type='file']")[0];
              if (input && input.files[0]) {
                contentValue = await convertFileToBase64(input.files[0]);
              }
            }

            row.columns.push({ type, content: contentValue });
          })
        );

        content.push(row);
      })
    );

    const newNews = {
      id: Date.now().toString(),
      title: title.trim(),
      author: author.trim(),
      creationDate,
      modificationDate,
      content,
      status: 0,
    };

    const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
    newsList.push(newNews);
    localStorage.setItem("newsList", JSON.stringify(newsList));

    $("#news-title").val("");
    $("#news-author").val("");
    $(".row-container").empty();

    alert("Noticia creada exitosamente.");
  });

  // Helper para convertir un archivo a Base64
  function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
});
