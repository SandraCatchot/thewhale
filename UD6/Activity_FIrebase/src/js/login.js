// login.js
import { app, db } from "./firebase_config.js";
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  // Referencia a la colección "users" en Firestore
  const usersColRef = collection(db, "users");

  // Comprobamos si existen usuarios en Firestore; si no, creamos el usuario administrador por defecto.
  const usersSnapshot = await getDocs(usersColRef);
  if (usersSnapshot.empty) {
    const salt = generateSalt();
    const defaultUser = {
      id: 1,
      name: "admin",
      email: "desenvolupador@iesjoanramis.org",
      password_hash: CryptoJS.SHA256("Ramis.20" + salt).toString(),
      salt: salt,
      edit_users: 1,
      edit_news: 1,
      edit_bone_files: 1,
      active: 1,
      is_first_login: 1
    };
    await addDoc(usersColRef, defaultUser);
  }

  // Gestión del envío del formulario de login
  $("form").submit(async function (e) {
    e.preventDefault();
    const email = $("input[type='email']").val().trim();
    const password = $("input[type='password']").val().trim();
    const feedback = $("#feedback");

    // Validación del formato del email
    if (!isValidEmail(email)) {
      feedback.text("El format de l'email no és correcte.").css("color", "red");
      return;
    }

    // Buscamos en Firestore el usuario con el email indicado
    const q = query(usersColRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      feedback.text("No existeix aquest usuari.").css("color", "red");
      return;
    }

    // Suponemos que solo hay un usuario con ese email
    let user;
    querySnapshot.forEach((docSnap) => {
      user = docSnap.data();
      user.docId = docSnap.id; // Guardamos el ID del documento para posibles actualizaciones
    });

    // Encriptamos la contraseña introducida usando la salt almacenada
    const saltedPassword = password + user.salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

    if (hashedPassword === user.password_hash) {
      // Guardamos el usuario en localStorage para futuras comprobaciones (por ejemplo, en edit_users.js)
      localStorage.setItem("logged_in_user", JSON.stringify(user));

      if (user.is_first_login) {
        // Si es el primer inicio de sesión, se solicita cambiar la contraseña.
        feedback
          .text("Primer inici de sessió. Per favor, canvii la contrasenya.")
          .css("color", "orange");
        setTimeout(() => (window.location.href = "change_password.html"), 2000);
      } else {
        // Si ya se ha iniciado sesión anteriormente...
        feedback.text("Inici de sessió validat!").css("color", "green");

        // Se comprueba si el usuario tiene permiso para editar usuarios o noticias.
        if (user.edit_users || user.edit_news) {
          // Si tiene alguno de los permisos, se le redirige a la página de edición.
          setTimeout(() => (window.location.href = "edit_users.html"), 2000);
        } else {
          // Si no tiene permisos de edición, se le redirige a la página de inicio.
          setTimeout(() => (window.location.href = "news.html"), 2000);
        }
      }
    } else {
      feedback.text("Contrasenya incorrecta.").css("color", "red");
    }
  });

  // Función para validar el formato del email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Función para generar una salt aleatoria
  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
