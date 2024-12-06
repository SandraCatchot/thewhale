$(document).ready(function () {
    // Obtener usuarios desde localStorage o inicializar vacío
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    // Función para renderizar la tabla de usuarios
    function renderUserTable() {
        const table = `
        <table class="users-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Edit Users</th>
                    <th>Edit News</th>
                    <th>Edit Bone Files</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${users
                    .map(
                        (user) => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.edit_users ? "Sí" : "No"}</td>
                    <td>${user.edit_news ? "Sí" : "No"}</td>
                    <td>${user.edit_bone_files ? "Sí" : "No"}</td>
                    <td>
                        <button class="edit-user" data-id="${user.id}">Editar</button>
                        <button class="delete-user" data-id="${user.id}">Eliminar</button>
                    </td>
                </tr>
                `
                    )
                    .join("")}
            </tbody>
        </table>`;
        $(".edit-users-container").html(table);
    }

    // Renderizar formulario de creación/edición
    function renderUserForm(user = {}) {
        const isEditing = !!user.id;
        const formHtml = `
        <div class="user-form">
            <h2>${isEditing ? "Editar Usuario" : "Crear Usuario"}</h2>
            <form id="userForm">
                <label>
                    Nombre:
                    <input type="text" name="name" value="${user.name || ""}" required />
                </label>
                <label>
                    Email:
                    <input type="email" name="email" value="${user.email || ""}" required />
                </label>
                <label>
                    Edit Users:
                    <input type="checkbox" name="edit_users" ${user.edit_users ? "checked" : ""} />
                </label>
                <label>
                    Edit News:
                    <input type="checkbox" name="edit_news" ${user.edit_news ? "checked" : ""} />
                </label>
                <label>
                    Edit Bone Files:
                    <input type="checkbox" name="edit_bone_files" ${user.edit_bone_files ? "checked" : ""} />
                </label>
                <button type="submit">${isEditing ? "Guardar Cambios" : "Crear Usuario"}</button>
                <button type="button" id="cancelForm">Cancelar</button>
            </form>
        </div>`;
        $(".edit-users-container").html(formHtml);

        // Guardar cambios
        $("#userForm").submit(function (e) {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                id: isEditing ? user.id : nextId++,
                name: formData.get("name"),
                email: formData.get("email"),
                edit_users: formData.has("edit_users"),
                edit_news: formData.has("edit_news"),
                edit_bone_files: formData.has("edit_bone_files"),
            };
            if (isEditing) {
                users = users.map((u) => (u.id === user.id ? userData : u));
            } else {
                users.push(userData);
            }
            localStorage.setItem("users", JSON.stringify(users));
            renderUserTable();
        });

        // Cancelar formulario
        $("#cancelForm").click(renderUserTable);
    }

    // Renderizar la tabla inicialmente
    renderUserTable();

    // Manejar edición de usuario
    $(document).on("click", ".edit-user", function () {
        const userId = Number($(this).data("id"));
        const user = users.find((u) => u.id === userId);
        renderUserForm(user);
    });

    // Manejar eliminación de usuario
    $(document).on("click", ".delete-user", function () {
        const userId = Number($(this).data("id"));
        users = users.filter((u) => u.id !== userId);
        localStorage.setItem("users", JSON.stringify(users));
        renderUserTable();
    });

    // Manejar creación de usuario
    $(document).on("click", "#createUser", function () {
        renderUserForm();
    });
});
