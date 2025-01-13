$(document).ready(function () {
    // Obtener las noticias del localStorage
    const newsList = JSON.parse(localStorage.getItem('newsList')) || [];

    // Seleccionar el contenedor donde se mostrarán las noticias
    const newsContainer = $('#container-news');

    // Renderizar cada noticia
    newsList.forEach(news => {
        const newsHtml = `<div class="card-component">
          <img src="../images/muntatge20.png" alt="Imatge notícia" class="card-image">
          <div class="p-4">
            <h2 class="text-xl font-bold text-oscuroS mb-2">${news.title}</h2>
            <p class="mb-4">10/11/2024</p>
            <p class="mb-4">
               
            </p>
            <a href="new.html" class="text-azulS font-semibold hover:underline">Llegeix més</a>
          </div>
        </div>`
        ;
        newsContainer.append(newsHtml);
    });

    if (newsList.length === 0) {
        newsContainer.append('<p>No hay noticias disponibles.</p>');
    }
});