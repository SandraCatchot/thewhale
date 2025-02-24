$(document).ready(function () {
  if (!localStorage.getItem("users")) {
    const salt = generateSalt();
    const defaultUser = {
      id: 1,
      name: "admin",
      email: "desenvolupador@iesjoanramis.org",
      password_hash: CryptoJS.SHA256("Ramis.20" + salt).toString(),
      edit_users: 1,
      edit_news: 1,
      edit_bone_files: 1,
      active: 1,
      is_first_login: 1,
      salt: salt,
    };
    localStorage.setItem("users", JSON.stringify([defaultUser]));
  }

  $("form").submit(function (e) {
    e.preventDefault();
    const email = $("input[type='email']").val().trim();
    const password = $("input[type='password']").val().trim();
    const feedback = $("#feedback");

    if (!isValidEmail(email)) {
      feedback.text("El format de l'email no és correcte.").css("color", "red");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.email === email);

    if (!user) {
      feedback.text("No existeix aquest usuari.").css("color", "red");
      return;
    }

    const saltedPassword = password + user.salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

    if (hashedPassword === user.password_hash) {
      if (user.is_first_login) {
        localStorage.setItem("current_email", email);
        feedback
          .text("Primer inici de sessió. Per favor, canvii la contrasenya.")
          .css("color", "orange");
        setTimeout(() => (window.location.href = "change_password.html"), 2000);
        localStorage.setItem("logged_in_user", JSON.stringify(user));
      } else {
        feedback.text("Inici de sessió validat!").css("color", "green");
        localStorage.setItem("logged_in_user", JSON.stringify(user));
        setTimeout(() => (window.location.href = "edit_users.html"), 2000);
      }
    } else {
      feedback.text("Contrasenya incorrecta.").css("color", "red");
    }
  });

  //USUARIO LOGUEADO O NO - CERRAR SESION

  const usuarioLogueado = localStorage.getItem("logged_in_user");

  const $loginContainer = $("#loginContainer");

  if (usuarioLogueado) {
    const user = JSON.parse(usuarioLogueado);

    if (user.active == 1) {
      let userSessionHtml = `
          <div class="user-session">
            <ion-icon class="logged-in-icon" name="person-circle"></ion-icon>
            <span id="userSessionName" style="cursor: pointer;">Sessió de: ${user.name}</span>
            <div class="user-menu" style="display: none; border: 1px solid #ccc; padding: 8px; position: absolute;">
            <a href="#" id="changePassword" style="display: block; margin-bottom: 5px;">Canviar contrasenya</a>
              <a href="#" id="logoutLink" style="display: block; margin-bottom: 5px;">Tancar sessió</a>
        `;

      if (user.edit_news == 1) {
        userSessionHtml += `<a href="../pages/edit_news.html" style="display: block; margin-bottom: 5px;">Editar notícies</a>`;
      }

      if (user.edit_users == 1) {
        userSessionHtml += `<a href="../pages/edit_users.html" style="display: block;">Editar usuaris</a>`;
      }

      userSessionHtml += `
            </div>
          </div>
        `;

      $loginContainer.html(userSessionHtml);

      $("#userSessionName").on("click", function () {
        $(".user-menu").toggle();
      });

      $("#changePassword").on("click", function (e) {
        e.preventDefault();

        window.location.href = "../pages/change_password.html";
      });

      $("#logoutLink").on("click", function (e) {
        e.preventDefault();
        let confirmLogOut = confirm("Segur que vols tancar la sessió?");

        if (confirmLogOut) {
          localStorage.removeItem("logged_in_user");

          window.location.href = "../pages/news.html";
        }
      });
    } else {
      mostrarIconoLogin();
    }
  }

  function mostrarIconoLogin() {
    $loginContainer.html(`
        <a href="../pages/login.html">
          <ion-icon class="iconoLogin" name="person-circle"></ion-icon>
        </a>
      `);
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
