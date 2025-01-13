$(document).ready(function () {
  $("·save-news").click(function () {
    const title = $("#news-title").val();
    const author = $("#news-author").val();

    //crear variable para contenido párrafo
    //crear variable para contenido imagen

    const timestamp = new Date().toLocaleString();

    // Validar los campos
    if (!title.trim() || !author.trim()) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const newNew = {
      title: title.trim(),
      author: author.trim(),
      timestamp: timestamp,
    };

    // Guardar en localStorage
    const newsList = JSON.parse(localStorage.getItem("newsList")) || [];
    newsList.push(newNew);
    localStorage.setItem("newsList", JSON.stringify(newsList));

    // Limpiar el formulario
    $("#title").val("");
    $("#author").val("");

    alert(
      "Noticia creada exitosamente. Ve a la página de noticias para verla."
    );
  });
});
