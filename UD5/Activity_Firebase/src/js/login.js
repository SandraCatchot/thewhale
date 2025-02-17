import { app, db } from "./firebase_config.js";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";


$(document).ready(async function () {

  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);

  let config = null;
  try {
    const response = await fetch('../password.json');
    if (response.ok) {
      config = await response.json();
    }
  } catch (error) {
    console.error('Error al cargar password.json:', error);
  }

  if (usersSnapshot.empty && config) {
    const salt = generateSalt();
    const usuarioAdmin = {
      id: 1,
      name: "admin",
      email: config.admin_email,
      password_hash: CryptoJS.SHA256(config.admin_password + salt).toString(),
      salt: salt,
      edit_users: 1,
      edit_news: 1,
      edit_bone_files: 1,
      active: 1,
      is_first_login: 1,
    };
    await addDoc(usersCollection, usuarioAdmin);
  }

  //ENVÍO DE FORMULARIO LOGIN
  $("form").submit(async function (e) {
    e.preventDefault();
    const email = $("input[type='email']").val().trim();
    const password = $("input[type='password']").val().trim();
    const feedback = $("#feedback");

    if (!isValidEmail(email)) {
      feedback.text("El format de l'email no és correcte.").css("color", "red");
      return;
    }

    const q = query(usersCollection, where("email", "==", email));
    const querySnapshotUser = await getDocs(q);

    if (querySnapshotUser.empty) {
      feedback.text("No existeix aquest usuari.").css("color", "red");
      return;
    }

    let user;
    querySnapshotUser.forEach((doc) => {
      user = doc.data();
      user.docId = doc.id;
    });

    const saltedPassword = password + user.salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

    if (hashedPassword === user.password_hash) {
      localStorage.setItem("logged_in_user", JSON.stringify(user));

      if (user.is_first_login) {
        feedback
          .text("Primer inici de sessió. Per favor, canvii la contrasenya.")
          .css("color", "orange");
        setTimeout(() => (window.location.href = "change_password.html"), 1000);
      } else {
        feedback.text("Inici de sessió validat!").css("color", "green");

        if (user.edit_users || user.edit_news) {
          setTimeout(() => (window.location.href = "edit_users.html"), 2000);
        } else {
          setTimeout(() => (window.location.href = "news.html"), 2000);
        }
      }
    } else {
      feedback.text("Contrasenya incorrecta.").css("color", "red");
    }
  });

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }

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
          userSessionHtml += `<a href="edit_news.html" style="display: block; margin-bottom: 5px;">Editar noticias</a>`;
        }

        if (user.edit_users == 1) {
          userSessionHtml += `<a href="edit_users.html" style="display: block;">Editar usuarios</a>`;
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
        
          localStorage.removeItem("logged_in_user");
         
          window.location.href = "../pages/news.html";
        });
      } else {
        
        mostrarIconoLogin();
      }
    } 

    function mostrarIconoLogin() {
      $loginContainer.html(`
        <a href="../pages/login.html">
          <ion-icon name="person-circle"></ion-icon>
        </a>
      `);
    }
});
