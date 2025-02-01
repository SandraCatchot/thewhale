// edit_users.js
import { app, db } from "./firebase_config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  // 1. Comprobamos si el usuario logueado tiene permisos para editar usuarios
  const loggedInUser = JSON.parse(localStorage.getItem("logged_in_user"));
  if (!loggedInUser || !loggedInUser.edit_users) {
    alert("No tienes permisos para editar usuarios.");
    window.location.href = "login.html"; // O redirige a otra página adecuada
    return;
  }

  // 2. Definición de variables y referencia a la colección "users" en Firestore
  const usersColRef = collection(db, "users");
  let users = [];
  let nextId = 1;

  // Función para cargar todos los usuarios desde Firestore
  async function loadUsers() {
    const querySnapshot = await getDocs(usersColRef);
    users = [];
    querySnapshot.forEach((docSnap) => {
      let data = docSnap.data();
      data.docId = docSnap.id; // Guardamos el ID del documento para futuras actualizaciones
      users.push(data);
    });
    if (users.length > 0) {
      nextId = Math.max(...users.map((u) => u.id)) + 1;
    } else {
      nextId = 1;
    }
  }

  await loadUsers();

  // Función para renderizar la tabla de usuarios (vista escritorio)
  function renderUserTable() {
    $(".edit-users-container").empty();

    let $headerDiv = $("<div>").addClass("table-header");
    let $createButton = $("<button>")
      .attr("id", "createUser")
      .addClass("create-user-btn")
      .text("Crear Nuevo Usuario");

    $headerDiv.append($createButton);

    let $table = $("<table>").addClass("users-table");

    let $thead = $("<thead>");
    let $headRow = $("<tr>");
    $headRow.append($("<th>").text("ID"));
    $headRow.append($("<th>").text("Nombre"));
    $headRow.append($("<th>").text("Email"));
    $headRow.append($("<th>").text("Edit Users"));
    $headRow.append($("<th>").text("Edit News"));
    $headRow.append($("<th>").text("Edit Bone Files"));
    $headRow.append($("<th>").text("Acciones"));
    $thead.append($headRow);
    $table.append($thead);

    let $tbody = $("<tbody>");
    users.forEach((user) => {
      let $tr = $("<tr>");
      $tr.append($("<td>").text(user.id));
      $tr.append($("<td>").text(user.name));
      $tr.append($("<td>").text(user.email));
      $tr.append($("<td>").text(user.edit_users ? "Sí" : "No"));
      $tr.append($("<td>").text(user.edit_news ? "Sí" : "No"));
      $tr.append($("<td>").text(user.edit_bone_files ? "Sí" : "No"));

      let $actionTd = $("<td>");
      let $editBtn = $("<button>")
        .addClass("edit-user")
        .attr("data-id", user.docId)
        .text("Editar");
      let $deleteBtn = $("<button>")
        .addClass("delete-user")
        .attr("data-id", user.docId)
        .text("Eliminar");
      let $changePassBtn = $("<button>")
        .addClass("change-password")
        .attr("data-id", user.docId)
        .text("Cambiar Contraseña");

      // Impedir eliminar al usuario administrador
      if (user.email === "desenvolupador@iesjoanramis.org") {
        $deleteBtn.prop("disabled", true);
      }

      $actionTd.append($editBtn).append(" ").append($deleteBtn).append(" ").append($changePassBtn);
      $tr.append($actionTd);
      $tbody.append($tr);
    });
    $table.append($tbody);

    $(".edit-users-container").append($headerDiv).append($table);
  }

  // Función para renderizar el formulario de creación/edición de usuario
  async function renderUserForm(user) {
    let isEditing = false;
    if (user && user.docId) {
      isEditing = true;
    } else {
      user = {};
    }

    $(".edit-users-container").empty();

    let $formDiv = $("<div>").addClass("user-form");
    let $title = $("<h2>").text(isEditing ? "Editar Usuario" : "Crear Usuario");
    let $form = $("<form>").attr("id", "userForm");

    // Campo: Nombre
    $form.append(
      $("<label>")
        .text("Nombre:")
        .append(
          $("<input>").attr({
            type: "text",
            name: "name",
            required: true,
            value: user.name || ""
          })
        )
    );
    // Campo: Email
    $form.append(
      $("<label>")
        .text("Email:")
        .append(
          $("<input>").attr({
            type: "email",
            name: "email",
            required: true,
            value: user.email || ""
          })
        )
    );
    // Checkbox: Edit Users
    $form.append(
      $("<label>")
        .text("Edit Users:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_users",
            checked: user.edit_users ? true : false
          })
        )
    );
    // Checkbox: Edit News
    $form.append(
      $("<label>")
        .text("Edit News:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_news",
            checked: user.edit_news ? true : false
          })
        )
    );
    // Checkbox: Edit Bone Files
    $form.append(
      $("<label>")
        .text("Edit Bone Files:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_bone_files",
            checked: user.edit_bone_files ? true : false
          })
        )
    );

    // Botones del formulario
    let $submitBtn = $("<button>").attr("type", "submit").text(isEditing ? "Guardar Cambios" : "Crear Usuario");
    let $cancelBtn = $("<button>").attr("type", "button").attr("id", "cancelForm").text("Cancelar");

    $form.append($submitBtn).append($cancelBtn);
    $formDiv.append($title).append($form);
    $(".edit-users-container").append($formDiv);

    // Manejo del envío del formulario
    $("#userForm").submit(async function (e) {
      e.preventDefault();
      let formData = new FormData(e.target);
      let newUser = {
        id: isEditing ? user.id : nextId,
        name: formData.get("name"),
        email: formData.get("email"),
        edit_users: formData.has("edit_users") ? 1 : 0,
        edit_news: formData.has("edit_news") ? 1 : 0,
        edit_bone_files: formData.has("edit_bone_files") ? 1 : 0
      };

      if (isEditing) {
        // Conservamos los datos sensibles existentes
        newUser.password_hash = user.password_hash;
        newUser.salt = user.salt;
        newUser.active = user.active;
        newUser.is_first_login = user.is_first_login;
        const docRef = doc(db, "users", user.docId);
        await updateDoc(docRef, newUser);
      } else {
        // Al crear un nuevo usuario, generamos una salt y establecemos la contraseña por defecto ("Ramis.20")
        let salt = generateSalt();
        newUser.password_hash = CryptoJS.SHA256("Ramis.20" + salt).toString();
        newUser.salt = salt;
        newUser.active = 1;
        newUser.is_first_login = 1;
        await addDoc(usersColRef, newUser);
        nextId++;
      }
      await loadUsers();
      renderUserTable();
    });

    $("#cancelForm").click(function () {
      renderUserTable();
    });
  }

  // Eventos para cambiar la contraseña
  $(document).on("click", ".change-password", function () {
    let docId = $(this).data("id");
    localStorage.setItem("userToChangePassword", docId);
    window.location.href = "change_password.html";
  });

  // Evento para editar un usuario
  $(document).on("click", ".edit-user", async function () {
    let docId = $(this).data("id");
    let userToEdit = users.find((u) => u.docId === docId);
    await renderUserForm(userToEdit);
  });

  // Evento para eliminar un usuario
  $(document).on("click", ".delete-user", async function () {
    let docId = $(this).data("id");
    let userToDelete = users.find((u) => u.docId === docId);
    if (userToDelete.email === "desenvolupador@iesjoanramis.org") {
      alert("El usuario administrador no se puede eliminar.");
      return;
    }
    let confirmDelete = confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (confirmDelete) {
      await deleteDoc(doc(db, "users", docId));
      await loadUsers();
      renderUserTable();
    }
  });

  // Evento para crear un nuevo usuario
  $(document).on("click", "#createUser", function () {
    renderUserForm();
  });

  /* ----- VISTAS PARA MÓVIL ----- */
  function renderMobileView() {
    $(".edit-users-container").empty();

    // Título
    let $titulo = $("<h1>").addClass("tituloForm").text("Gestión de usuarios");
    $(".edit-users-container").append($titulo);

    // Barra de búsqueda
    let $searchBar = $("<div>").addClass("mobile-search-bar");
    let $searchIcon = $("<span>").addClass("search-icon").html("🔍");
    let $searchInput = $("<input>")
      .attr({
        type: "text",
        id: "searchUser",
        placeholder: "Buscar usuario..."
      })
      .addClass("search-input");
    $searchBar.append($searchIcon).append($searchInput);
    $(".edit-users-container").append($searchBar);

    // Botón para crear usuario
    let $createButton = $("<button>")
      .attr("id", "createUser")
      .addClass("create-user-btn")
      .text("Crear Nuevo Usuario");
    $(".edit-users-container").append($createButton);

    // Contenedor de cards
    let $cardContainer = $("<div>").addClass("user-card-container");
    users.forEach((user, index) => {
      let bgColor = index % 2 === 0 ? "#E3F2FD" : "#BBDEFB";
      let $card = $("<div>")
        .addClass("user-card")
        .attr("data-id", user.docId)
        .css("background-color", bgColor)
        .html(`<strong>${user.name}</strong> - ${user.email}`);
      $cardContainer.append($card);
    });
    $(".edit-users-container").append($cardContainer);

    // Evento de búsqueda
    $("#searchUser").on("input", function () {
      let searchText = $(this).val().toLowerCase();
      $(".user-card").each(function () {
        let userText = $(this).text().toLowerCase();
        $(this).toggle(userText.includes(searchText));
      });
    });

    // Evento de clic en una card para editar
    $(".user-card").on("click", function () {
      let docId = $(this).data("id");
      let user = users.find((u) => u.docId === docId);
      renderUserFormPopup(user);
    });
  }

  // Renderiza el formulario en un popup (vista móvil)
  function renderUserFormPopup(user) {
    let isEditing = !!user;
    let $popupOverlay = $("<div>").addClass("popup-overlay");
    let $popupContent = $("<div>").addClass("popup-content");
    let $title = $("<h2>").text(isEditing ? "Editar Usuario" : "Crear Usuario");
    let $form = $("<form>").attr("id", "userForm");

    $form.append(
      $("<label>")
        .text("Nombre:")
        .append(
          $("<input>").attr({
            type: "text",
            name: "name",
            required: true,
            value: user ? user.name : ""
          })
        )
    );
    $form.append(
      $("<label>")
        .text("Email:")
        .append(
          $("<input>").attr({
            type: "email",
            name: "email",
            required: true,
            value: user ? user.email : ""
          })
        )
    );
    $form.append(
      $("<label>")
        .text("Edit Users:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_users",
            checked: user ? user.edit_users : false
          })
        )
    );
    $form.append(
      $("<label>")
        .text("Edit News:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_news",
            checked: user ? user.edit_news : false
          })
        )
    );
    $form.append(
      $("<label>")
        .text("Edit Bone Files:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_bone_files",
            checked: user ? user.edit_bone_files : false
          })
        )
    );

    let $submitBtn = $("<button>").attr("type", "submit").text("Guardar Cambios");
    let $cancelBtn = $("<button>").attr("type", "button").addClass("close-popup").text("Cancelar");

    $form.append($submitBtn).append($cancelBtn);
    $popupContent.append($title).append($form);
    $popupOverlay.append($popupContent);

    $("main").append($popupOverlay);

    $form.submit(async function (e) {
      e.preventDefault();
      let formData = new FormData(e.target);
      let updatedUser = {
        id: user ? user.id : nextId,
        name: formData.get("name"),
        email: formData.get("email"),
        edit_users: formData.has("edit_users") ? 1 : 0,
        edit_news: formData.has("edit_news") ? 1 : 0,
        edit_bone_files: formData.has("edit_bone_files") ? 1 : 0
      };

      if (isEditing) {
        updatedUser.password_hash = user.password_hash;
        updatedUser.salt = user.salt;
        updatedUser.active = user.active;
        updatedUser.is_first_login = user.is_first_login;
        await updateDoc(doc(db, "users", user.docId), updatedUser);
      } else {
        let salt = generateSalt();
        updatedUser.password_hash = CryptoJS.SHA256("Ramis.20" + salt).toString();
        updatedUser.salt = salt;
        updatedUser.active = 1;
        updatedUser.is_first_login = 1;
        await addDoc(usersColRef, updatedUser);
        nextId++;
      }
      await loadUsers();
      $(".popup-overlay").remove();
      renderMobileView();
    });

    $(".close-popup").on("click", function () {
      $(".popup-overlay").remove();
    });
  }

  function isMobile() {
    return window.innerWidth <= 768;
  }

  function renderView() {
    if (isMobile()) {
      renderMobileView();
    } else {
      renderUserTable();
    }
  }

  $(window).on("resize", renderView);
  renderView();

  // Función para generar una salt aleatoria
  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
