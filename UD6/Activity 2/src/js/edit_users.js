$(document).ready(function () {
    // Obtener los usuarios almacenados en localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Crear la estructura de la página
    const mainContainer = $("<main>").addClass("edit-users-container");

    // Título
    mainContainer.append(
        $("<h1>").text("Gestió d'Usuaris").addClass("page-title")
    );

    // Tabla de usuarios
    if (users.length === 0) {
        mainContainer.append(
            $("<p>").text("No hi ha usuaris disponibles.").addClass("no-users-message")
        );
    } else {
        const table = $("<table>").addClass("users-table");
        const thead = $("<thead>").append(`
            <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Email</th>
                <th>Actiu</th>
            </tr>
        `);

        const tbody = $("<tbody>");
        users.forEach((user) => {
            const row = $("<tr>").append(`
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.active ? "Sí" : "No"}</td>
            `);
            tbody.append(row);
        });

        table.append(thead).append(tbody);
        mainContainer.append(table);
    }

    // Insertar el contenido generado en el body
    $("body").append(mainContainer);
});
