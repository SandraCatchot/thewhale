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
  const loggedInUser = JSON.parse(localStorage.getItem("logged_in_user"));
  if (!loggedInUser || !loggedInUser.edit_users) {
    alert("No tens permisos per editar usuaris.");
    window.location.href = "login.html"; 
    return;
  }

  const usersColRef = collection(db, "users");
  let users = [];
  let nextId = 1;

  async function loadUsers() {
    const querySnapshot = await getDocs(usersColRef);
    users = [];
    querySnapshot.forEach((docSnap) => {
      let data = docSnap.data();
      data.docId = docSnap.id;
      users.push(data);
    });
    if (users.length > 0) {
      nextId = Math.max(...users.map((u) => u.id)) + 1;
    } else {
      nextId = 1;
    }
  }

  await loadUsers();

  function renderUserTable() {
    $(".edit-users-container").empty();

    let $headerDiv = $("<div>").addClass("table-header");
    let $createButton = $("<button>")
      .attr("id", "createUser")
      .addClass("create-user-btn")
      .text("Crear NOU USUARI");

    $headerDiv.append($createButton);

    let $table = $("<table>").addClass("users-table");

    let $thead = $("<thead>");
    let $headRow = $("<tr>");
    $headRow.append($("<th>").text("ID"));
    $headRow.append($("<th>").text("Nom"));
    $headRow.append($("<th>").text("Email"));
    $headRow.append($("<th>").text("Editar usuaris"));
    $headRow.append($("<th>").text("Editar notícies"));
    $headRow.append($("<th>").text("Editar fitxes óssos"));
    $headRow.append($("<th>").text("Accions"));
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
        .text("Esborrar");
      let $changePassBtn = $("<button>")
        .addClass("change-password")
        .attr("data-id", user.docId)
        .text("Canviar contraseña");

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

  async function renderUserForm(user) {
    let isEditing = false;
    if (user && user.docId) {
      isEditing = true;
    } else {
      user = {};
    }

    $(".edit-users-container").empty();

    let $formDiv = $("<div>").addClass("user-form");
    let $title = $("<h2>").text(isEditing ? "Editar usuari" : "Crear usuari");
    let $form = $("<form>").attr("id", "userForm");

    $form.append(
      $("<label>")
        .text("Nom:")
        .append(
          $("<input>").attr({
            type: "text",
            name: "name",
            required: true,
            value: user.name || ""
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
            value: user.email || ""
          })
        )
    );
    
    $form.append(
      $("<label>")
        .text("Editar usuaris:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_users",
            checked: user.edit_users ? true : false
          })
        )
    );
  
    $form.append(
      $("<label>")
        .text("Editar notícies:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_news",
            checked: user.edit_news ? true : false
          })
        )
    );
    
    $form.append(
      $("<label>")
        .text("Editar fitxes óssos:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_bone_files",
            checked: user.edit_bone_files ? true : false
          })
        )
    );

    let $submitBtn = $("<button>").attr("type", "submit").text(isEditing ? "Guardar" : "Crear usuari");
    let $cancelBtn = $("<button>").attr("type", "button").attr("id", "cancelForm").text("Cancelar");

    $form.append($submitBtn).append($cancelBtn);
    $formDiv.append($title).append($form);
    $(".edit-users-container").append($formDiv);

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
        newUser.password_hash = user.password_hash;
        newUser.salt = user.salt;
        newUser.active = user.active;
        newUser.is_first_login = user.is_first_login;
        const docRef = doc(db, "users", user.docId);
        await updateDoc(docRef, newUser);
      } else {
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

  $(document).on("click", ".change-password", function () {
    let docId = $(this).data("id");
    localStorage.setItem("userToChangePassword", docId);
    window.location.href = "change_password.html";
  });

  $(document).on("click", ".edit-user", async function () {
    let docId = $(this).data("id");
    let userToEdit = users.find((u) => u.docId === docId);
    await renderUserForm(userToEdit);
  });

  $(document).on("click", ".delete-user", async function () {
    let docId = $(this).data("id");
    let userToDelete = users.find((u) => u.docId === docId);
    if (userToDelete.email === "desenvolupador@iesjoanramis.org") {
      alert("L'usuari administrador no es pot esborrarr.");
      return;
    }
    let confirmDelete = confirm("Segur que vols esborrar aquest usuari?");
    if (confirmDelete) {
      await deleteDoc(doc(db, "users", docId));
      await loadUsers();
      renderUserTable();
    }
  });

  $(document).on("click", "#createUser", function () {
    renderUserForm();
  });

  function renderMobileView() {
    $(".edit-users-container").empty();

    let $titulo = $("<h1>").addClass("tituloForm").text("Gestió d'usuaris");
    $(".edit-users-container").append($titulo);

    let $searchBar = $("<div>").addClass("mobile-search-bar");
    let $searchIcon = $("<span>").addClass("search-icon").html("🔍");
    let $searchInput = $("<input>")
      .attr({
        type: "text",
        id: "searchUser",
        placeholder: "Cercar usuari..."
      })
      .addClass("search-input");
    $searchBar.append($searchIcon).append($searchInput);
    $(".edit-users-container").append($searchBar);

    let $createButton = $("<button>")
      .attr("id", "createUser")
      .addClass("create-user-btn")
      .text("Crear nou usuari");
    $(".edit-users-container").append($createButton);

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

    $("#searchUser").on("input", function () {
      let searchText = $(this).val().toLowerCase();
      $(".user-card").each(function () {
        let userText = $(this).text().toLowerCase();
        $(this).toggle(userText.includes(searchText));
      });
    });

    $(".user-card").on("click", function () {
      let docId = $(this).data("id");
      let user = users.find((u) => u.docId === docId);
      renderUserFormPopup(user);
    });
  }

  function renderUserFormPopup(user) {
    let isEditing = !!user;
    let $popupOverlay = $("<div>").addClass("popup-overlay");
    let $popupContent = $("<div>").addClass("popup-content");
    let $title = $("<h2>").text(isEditing ? "Modificar usuari" : "Crear usuari");
    let $form = $("<form>").attr("id", "userForm");

    $form.append(
      $("<label>")
        .text("Nom:")
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
        .text("Edició d'usuaris:")
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
        .text("Edició de notícies:")
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
        .text("Edició de fitxes óssos:")
        .append(
          $("<input>").attr({
            type: "checkbox",
            name: "edit_bone_files",
            checked: user ? user.edit_bone_files : false
          })
        )
    );

    let $submitBtn = $("<button>").attr("type", "submit").text("Guardar");
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

  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
