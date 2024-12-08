$(document).ready(function () {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;

    function renderUserTable() {
        const table = `
        <div class="table-header">
            <button id="createUser" class="create-user-btn">Crear Nuevo Usuario</button>
        </div>
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
                        <button class="change-password" data-id="${user.id}">Cambiar Contraseña</button>
                    </td>
                </tr>
                `
                    )
                    .join("")}
            </tbody>
        </table>`;
        $(".edit-users-container").html(table);
    }

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

        $("#cancelForm").click(renderUserTable);
    }

    $(document).on("click", ".change-password", function () {
        const userId = $(this).data("id");
        localStorage.setItem("userToChangePassword", userId);
        window.location.href = "change_password.html";
    });

    $(document).on("click", ".edit-user", function () {
        const userId = Number($(this).data("id"));
        const user = users.find((u) => u.id === userId);
        renderUserForm(user);
    });

    $(document).on("click", ".delete-user", function () {
        const userId = Number($(this).data("id"));
        users = users.filter((u) => u.id !== userId);
        localStorage.setItem("users", JSON.stringify(users));
        renderUserTable();
    });

    $(document).on("click", "#createUser", function () {
        renderUserForm();
    });

    renderUserTable();
});
