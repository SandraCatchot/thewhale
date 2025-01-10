$(document).ready(function () {
  // Obtenemos los usuarios del localStorage o creamos un array vacío si no hay nada guardado
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Calculamos el próximo ID a asignar (si no hay usuarios, empezamos en 1)
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

  // Esta función se encarga de mostrar la tabla de usuarios VERSIÓN ESCRITORIO
  function renderUserTable() {
    // Limpiamos el contenedor
    $(".edit-users-container").empty();

    // Creamos el contenedor del header de la tabla
    let $headerDiv = $("<div>").addClass("table-header");
    let $createButton = $("<button>")
      .attr("id", "createUser")
      .addClass("create-user-btn")
      .text("Crear Nuevo Usuario");

    $headerDiv.append($createButton);

    // Creamos la tabla con jQuery
    let $table = $("<table>").addClass("users-table");

    // Creamos el thead
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

    // Creamos el tbody
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
      let $editBtn = $("<button>")
        .addClass("edit-user")
        .attr("data-id", user.id)
        .text("Editar");
      let $deleteBtn = $("<button>")
        .addClass("delete-user")
        .attr("data-id", user.id)
        .text("Eliminar");
      let $changePassBtn = $("<button>")
        .addClass("change-password")
        .attr("data-id", user.id)
        .text("Cambiar Contraseña");

      $actionTd
        .append($editBtn)
        .append(" ")
        .append($deleteBtn)
        .append(" ")
        .append($changePassBtn);
      $tr.append($actionTd);

      $tbody.append($tr);
    }

    $table.append($tbody);

    // Añadimos todo al contenedor principal
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

    // Campos del formulario
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

    // Checkboxes
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

    // Botones del formulario
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

    // Manejamos el envío del formulario
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
        // Si estamos editando, reemplazamos el usuario existente
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

      // Guardamos cambios en localStorage
      localStorage.setItem("users", JSON.stringify(users));
      // Volvemos a mostrar la tabla
      renderUserTable();
    });

    // Si el usuario cancela el formulario, volvemos a la tabla
    $("#cancelForm").click(function () {
      renderUserTable();
    });
  }

  // Cuando se hace clic en cambiar contraseña
  $(document).on("click", ".change-password", function () {
    let userId = $(this).data("id");
    localStorage.setItem("userToChangePassword", userId);
    window.location.href = "change_password.html";
  });

  // Cuando se hace clic en editar un usuario
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

  // Cuando se hace clic en eliminar un usuario
  $(document).on("click", ".delete-user", function () {
    let userId = Number($(this).data("id"));

    // Mostrar un cuadro de confirmación al usuario
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
      // Cancelar la acción de eliminar
      console.log("Eliminación cancelada por el usuario.");
    }
  });

  // Cuando se hace clic en "Crear Nuevo Usuario"
  $(document).on("click", "#createUser", function () {
    renderUserForm();
  });

  // Iniciamos mostrando la tabla de usuarios
  renderUserTable();

  function renderMobileView() {
    $(".edit-users-container").empty();

    //Título
    let $titulo = $("<h1>").addClass("tituloForm");
    $titulo.text("Gestión de usuarios")
    $(".edit-users-container").append($titulo);

    // Barra de búsqueda
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
    

    // Contenedor de cards
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

    // Evento de búsqueda
    $("#searchUser").on("input", function () {
      let searchText = $(this).val().toLowerCase();
      $(".user-card").each(function () {
        let userText = $(this).text().toLowerCase();
        $(this).toggle(userText.includes(searchText));
      });
    });

    // Evento de clic en una card
    $(".user-card").on("click", function () {
      let userId = $(this).data("id");
      let user = users.find((u) => u.id === userId);
      renderUserFormPopup(user);
    });
  }

  // Mostrar el formulario en un popup
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