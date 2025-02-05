import { app, db } from "./firebase_config.js";
import { collection, getDocs, addDoc, query, where } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(async function () {
  const usersColRef = collection(db, "users");

  const usersSnapshot = await getDocs(usersColRef);
  if (usersSnapshot.empty) {
    const salt = generateSalt();
    const defaultUser = {
      id: 1,
      name: "admin",
      email: "desenvolupador@iesjoanramis.org",
      password_hash: CryptoJS.SHA256("Ramis.20" + salt).toString(),
      //QUITAR ESTA CONTRASEÑA DE AQUI, PONERLA EN UN JSON A PARTE
      salt: salt,
      edit_users: 1,
      edit_news: 1,
      edit_bone_files: 1,
      active: 1,
      is_first_login: 1
    };
    await addDoc(usersColRef, defaultUser);
  }

  $("form").submit(async function (e) {
    e.preventDefault();
    const email = $("input[type='email']").val().trim();
    const password = $("input[type='password']").val().trim();
    const feedback = $("#feedback");

    if (!isValidEmail(email)) {
      feedback.text("El format de l'email no és correcte.").css("color", "red");
      return;
    }

    const q = query(usersColRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      feedback.text("No existeix aquest usuari.").css("color", "red");
      return;
    }

    let user;
    querySnapshot.forEach((docSnap) => {
      user = docSnap.data();
      user.docId = docSnap.id;
    });

    const saltedPassword = password + user.salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

    if (hashedPassword === user.password_hash) {
      localStorage.setItem("logged_in_user", JSON.stringify(user));

      if (user.is_first_login) {
        feedback
          .text("Primer inici de sessió. Per favor, canvii la contrasenya.")
          .css("color", "orange");
        setTimeout(() => (window.location.href = "change_password.html"), 2000);
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
});
