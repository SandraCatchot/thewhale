$(document).ready(function () {
    // Obtenemos los usuarios del localStorage o creamos un array vacío si no hay nada guardado
    var users = JSON.parse(localStorage.getItem("users")) || [];
  
    // Calculamos el próximo ID a asignar (si no hay usuarios, empezamos en 1)
    var nextId;
    if (users.length === 0) {
      nextId = 1;
    } else {
      var ids = [];
      for (var i = 0; i < users.length; i++) {
        ids.push(users[i].id);
      }
      var maxId = Math.max.apply(null, ids);
      nextId = maxId + 1;
    }
  
    // Esta función se encarga de mostrar la tabla de usuarios
    function renderUserTable() {
      // Limpiamos el contenedor
      $(".edit-users-container").empty();
  
      // Creamos el contenedor del header de la tabla
      var $headerDiv = $("<div>").addClass("table-header");
      var $createButton = $("<button>")
        .attr("id", "createUser")
        .addClass("create-user-btn")
        .text("Crear Nuevo Usuario");
  
      $headerDiv.append($createButton);
  
      // Creamos la tabla con jQuery
      var $table = $("<table>").addClass("users-table");
  
      // Creamos el thead
      var $thead = $("<thead>");
      var $headRow = $("<tr>");
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
      var $tbody = $("<tbody>");
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        var $tr = $("<tr>");
  
        $tr.append($("<td>").text(user.id));
        $tr.append($("<td>").text(user.name));
        $tr.append($("<td>").text(user.email));
        $tr.append($("<td>").text(user.edit_users ? "Sí" : "No"));
        $tr.append($("<td>").text(user.edit_news ? "Sí" : "No"));
        $tr.append($("<td>").text(user.edit_bone_files ? "Sí" : "No"));
  
        var $actionTd = $("<td>");
        var $editBtn = $("<button>")
          .addClass("edit-user")
          .attr("data-id", user.id)
          .text("Editar");
        var $deleteBtn = $("<button>")
          .addClass("delete-user")
          .attr("data-id", user.id)
          .text("Eliminar");
        var $changePassBtn = $("<button>")
          .addClass("change-password")
          .attr("data-id", user.id)
          .text("Cambiar Contraseña");
  
        $actionTd.append($editBtn).append(" ").append($deleteBtn).append(" ").append($changePassBtn);
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
      var isEditing = false;
      if (user && user.id) {
        isEditing = true;
      } else {
        user = {};
      }
  
      $(".edit-users-container").empty();
  
      var $formDiv = $("<div>").addClass("user-form");
      var $title = $("<h2>").text(isEditing ? "Editar Usuario" : "Crear Usuario");
      var $form = $("<form>").attr("id", "userForm");
  
      // Campos del formulario
      $form.append($("<label>").text("Nombre:").append($("<input>").attr({ type: "text", name: "name", required: true, value: user.name || "" })));
      $form.append($("<label>").text("Email:").append($("<input>").attr({ type: "email", name: "email", required: true, value: user.email || "" })));
  
      // Checkboxes
      $form.append($("<label>").text("Edit Users:").append($("<input>").attr({ type: "checkbox", name: "edit_users", checked: user.edit_users ? true : false })));
      $form.append($("<label>").text("Edit News:").append($("<input>").attr({ type: "checkbox", name: "edit_news", checked: user.edit_news ? true : false })));
      $form.append($("<label>").text("Edit Bone Files:").append($("<input>").attr({ type: "checkbox", name: "edit_bone_files", checked: user.edit_bone_files ? true : false })));
  
      // Botones del formulario
      var $submitBtn = $("<button>").attr("type", "submit").text(isEditing ? "Guardar Cambios" : "Crear Usuario");
      var $cancelBtn = $("<button>").attr("type", "button").attr("id", "cancelForm").text("Cancelar");
  
      $form.append($submitBtn).append($cancelBtn);
  
      $formDiv.append($title).append($form);
      $(".edit-users-container").append($formDiv);
  
      // Manejamos el envío del formulario
      $("#userForm").submit(function (e) {
        e.preventDefault();
        var formData = new FormData(e.target);
        var newUser = {
          id: isEditing ? user.id : nextId++,
          name: formData.get("name"),
          email: formData.get("email"),
          edit_users: formData.has("edit_users"),
          edit_news: formData.has("edit_news"),
          edit_bone_files: formData.has("edit_bone_files")
        };
  
        if (isEditing) {
          // Si estamos editando, reemplazamos el usuario existente
          for (var i = 0; i < users.length; i++) {
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
      var userId = $(this).data("id");
      localStorage.setItem("userToChangePassword", userId);
      window.location.href = "change_password.html";
    });
  
    // Cuando se hace clic en editar un usuario
    $(document).on("click", ".edit-user", function () {
      var userId = Number($(this).data("id"));
      var userToEdit = null;
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
      var userId = Number($(this).data("id"));
      var newUsers = [];
      for (var i = 0; i < users.length; i++) {
        if (users[i].id !== userId) {
          newUsers.push(users[i]);
        }
      }
      users = newUsers;
      localStorage.setItem("users", JSON.stringify(users));
      renderUserTable();
    });
  
    // Cuando se hace clic en "Crear Nuevo Usuario"
    $(document).on("click", "#createUser", function () {
      renderUserForm();
    });
  
    // Iniciamos mostrando la tabla de usuarios
    renderUserTable();
  });
  