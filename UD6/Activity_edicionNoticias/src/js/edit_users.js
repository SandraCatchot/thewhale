$(document).ready(function () {
  let users = JSON.parse(localStorage.getItem("users")) || [];

  let nextId;
  if (users.length === 0) {
    nextId = 1;
  } else {
    let ids = [];
    for (let i = 0; i < users.length; i++) {
      ids.push(users[i].id);
    }
    let maxId = Math.max.apply(null, ids);
    nextId = maxId + 1;
  }

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
    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      let $tr = $("<tr>");

      $tr.append($("<td>").text(user.id));
      $tr.append($("<td>").text(user.name));
      $tr.append($("<td>").text(user.email));
      $tr.append($("<td>").text(user.edit_users ? "Sí" : "No"));
      $tr.append($("<td>").text(user.edit_news ? "Sí" : "No"));
      $tr.append($("<td>").text(user.edit_bone_files ? "Sí" : "No"));

      let $actionTd = $("<td>");
      let $editIcon = $("<ion-icon>")
        .attr("name", "pencil-outline")
        .addClass("iconos-editUsers")
        .css("color", "#124559");
      let $editBtn = $("<button>")
        .addClass("edit-user")
        .attr("data-id", user.docId)
        .text("Editar");
      let $deleteIcon = $("<ion-icon>")
        .attr("name", "trash-outline")
        .addClass("iconos-editUsers")
        .css("color", "red");
      let $deleteBtn = $("<button>")
        .addClass("delete-user")
        .attr("data-id", user.docId)
        .text("Esborrar");
      let $changePassIcon = $("<ion-icon>")
        .attr("name", "key-outline")
        .addClass("iconos-editUsers")
        .css("color", "#124559");
      let $changePassBtn = $("<button>")
        .addClass("change-password")
        .attr("data-id", user.docId)
        .text("Canviar contrasenya");

        if (user.email === "desenvolupador@iesjoanramis.org") {
          if (loggedInUser.email !== "desenvolupador@iesjoanramis.org") {
            $editBtn.hide();
            $deleteBtn.hide();
            $changePassBtn.hide();
            $editIcon.hide();
            $deleteIcon.hide();
            $changePassIcon.hide();
          }
        }

        $actionTd
        .append($editIcon)
        .append($editBtn)
        .append(" ")
        .append($deleteIcon)
        .append($deleteBtn)
        .append(" ")
        .append($changePassIcon)
        .append($changePassBtn);
      $tr.append($actionTd);
      $tbody.append($tr);
    }

    $table.append($tbody);

    $(".edit-users-container").append($headerDiv).append($table);
  }

  // Esta función muestra el formulario de crear o editar un usuario.
  // Si pasamos un objeto usuario, estamos editando; si no, creando uno nuevo.
  function renderUserForm(user) {
    let isEditing = false;
    if (user && user.id) {
      isEditing = true;
    } else {
      user = {};
    }

    $(".edit-users-container").empty();

    let $formDiv = $("<div>").addClass("user-form");
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
            value: user.name || "",
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
            value: user.email || "",
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
            checked: user.edit_users ? true : false,
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
            checked: user.edit_news ? true : false,
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
            checked: user.edit_bone_files ? true : false,
          })
        )
    );

    let $submitBtn = $("<button>")
      .attr("type", "submit")
      .text(isEditing ? "Guardar Cambios" : "Crear Usuario");
    let $cancelBtn = $("<button>")
      .attr("type", "button")
      .attr("id", "cancelForm")
      .text("Cancelar");

    $form.append($submitBtn).append($cancelBtn);

    $formDiv.append($title).append($form);
    $(".edit-users-container").append($formDiv);

    $("#userForm").submit(function (e) {
      e.preventDefault();
      let formData = new FormData(e.target);
      let newUser = {
        id: isEditing ? user.id : nextId++,
        name: formData.get("name"),
        email: formData.get("email"),
        edit_users: formData.has("edit_users"),
        edit_news: formData.has("edit_news"),
        edit_bone_files: formData.has("edit_bone_files"),
      };

      if (isEditing) {
        for (let i = 0; i < users.length; i++) {
          if (users[i].id === user.id) {
            users[i] = newUser;
            break;
          }
        }
      } else {
        // Si estamos creando, lo añadimos al array
        users.push(newUser);
      }

      localStorage.setItem("users", JSON.stringify(users));
      renderUserTable();
    });

    // Si el usuario cancela el formulario, volvemos a la tabla
    $("#cancelForm").click(function () {
      renderUserTable();
    });
  }

  $(document).on("click", ".change-password", function () {
    let userId = $(this).data("id");
    localStorage.setItem("userToChangePassword", userId);
    window.location.href = "change_password.html";
  });

  $(document).on("click", ".edit-user", function () {
    let userId = Number($(this).data("id"));
    let userToEdit = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === userId) {
        userToEdit = users[i];
        break;
      }
    }
    renderUserForm(userToEdit);
  });

  $(document).on("click", ".delete-user", function () {
    let userId = Number($(this).data("id"));

    let confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar este usuario?"
    );

    if (confirmDelete) {
      let newUsers = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i].id !== userId) {
          newUsers.push(users[i]);
        }
      }
      users = newUsers;
      localStorage.setItem("users", JSON.stringify(users));
      renderUserTable();
    } else {
      console.log("Eliminación cancelada por el usuario.");
    }
  });

  $(document).on("click", "#createUser", function () {
    renderUserForm();
  });

  renderUserTable();

  function renderMobileView() {
    $(".edit-users-container").empty();

    let $titulo = $("<h1>").addClass("tituloForm");
    $titulo.text("Gestión de usuarios")
    $(".edit-users-container").append($titulo);

    let $searchBar = $("<div>").addClass("mobile-search-bar");
    let $searchIcon = $("<span>").addClass("search-icon").html("🔍");
    let $searchInput = $("<input>")
      .attr({
        type: "text",
        id: "searchUser",
        placeholder: "Buscar usuario...",
      })
      .addClass("search-input");
    $searchBar.append($searchIcon).append($searchInput);
    $(".edit-users-container").append($searchBar);
    

    let $cardContainer = $("<div>").addClass("user-card-container");
    users.forEach((user, index) => {
      let bgColor = index % 2 === 0 ? "#E3F2FD" : "#BBDEFB"; // Alternar colores
      let $card = $("<div>")
        .addClass("user-card")        
        .attr("data-id", user.id)
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
      let userId = $(this).data("id");
      let user = users.find((u) => u.id === userId);
      renderUserFormPopup(user);
    });
  }

  function renderUserFormPopup(user) {
    let isEditing = !!user;

    // Crear el popup
    let $popupOverlay = $("<div>").addClass("popup-overlay");
    let $popupContent = $("<div>").addClass("popup-content");

    let $title = $("<h2>").text(isEditing ? "Editar Usuario" : "Crear Usuario");
    let $form = $("<form>").attr("id", "userForm");

    // Campos del formulario
    $form.append(
      $("<label>").text("Nombre:").append(
        $("<input>").attr({
          type: "text",
          name: "name",
          required: true,
          value: user ? user.name : "",
        })
      )
    );
    $form.append(
      $("<label>").text("Email:").append(
        $("<input>").attr({
          type: "email",
          name: "email",
          required: true,
          value: user ? user.email : "",
        })
      )
    );

    // Checkboxes
    $form.append(
      $("<label>").text("Edit Users:").append(
        $("<input>").attr({
          type: "checkbox",
          name: "edit_users",
          checked: user ? user.edit_users : false,
        })
      )
    );
    $form.append(
      $("<label>").text("Edit News:").append(
        $("<input>").attr({
          type: "checkbox",
          name: "edit_news",
          checked: user ? user.edit_news : false,
        })
      )
    );
    $form.append(
      $("<label>").text("Edit Bone Files:").append(
        $("<input>").attr({
          type: "checkbox",
          name: "edit_bone_files",
          checked: user ? user.edit_bone_files : false,
        })
      )
    );

    // Botones del formulario
    let $submitBtn = $("<button>")
      .attr("type", "submit")
      .text("Guardar Cambios");
    let $cancelBtn = $("<button>")
      .attr("type", "button")
      .addClass("close-popup")
      .text("Cancelar");

    $form.append($submitBtn).append($cancelBtn);
    $popupContent.append($title).append($form);
    $popupOverlay.append($popupContent);

    // Agregar popup al <main>
    $("main").append($popupOverlay);

    // Evento de envío del formulario
    $form.submit(function (e) {
      e.preventDefault();
      let formData = new FormData(e.target);
      let updatedUser = {
        id: user ? user.id : Date.now(),
        name: formData.get("name"),
        email: formData.get("email"),
        edit_users: formData.has("edit_users"),
        edit_news: formData.has("edit_news"),
        edit_bone_files: formData.has("edit_bone_files"),
      };

      if (isEditing) {
        // Editar usuario existente
        users = users.map((u) => (u.id === user.id ? updatedUser : u));
      } else {
        // Crear nuevo usuario
        users.push(updatedUser);
      }

      localStorage.setItem("users", JSON.stringify(users));
      $(".popup-overlay").remove();
      renderMobileView();
    });

    // Botón para cerrar el popup
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
      renderUserTable(); // Reutilizar función de escritorio existente
    }
  }

  $(window).on("resize", renderView);

  renderView();
});