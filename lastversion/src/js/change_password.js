import { app, db } from "./firebase_config.js";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

$(document).ready(function () {
  
  let currentEmail = localStorage.getItem("current_email");
  if (!currentEmail) {
    const loggedUserStr = localStorage.getItem("logged_in_user");
    if (loggedUserStr) {
      try {
        const loggedUser = JSON.parse(loggedUserStr);
        currentEmail = loggedUser.email;
      } catch (e) {
        console.error("Error al parsear logged_in_user:", e);
      }
    }
  }
  if (!currentEmail) {
    $("#feedback").text("No s'ha trobat l'usuari.").css("color", "red");
    return;
  }

  $("#changePasswordForm").submit(async function (e) {
    e.preventDefault();

    const newPassword = $("#newPassword").val().trim();
    const confirmPassword = $("#confirmPassword").val().trim();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      $("#feedback")
        .text("La contrasenya ha de tenir mínim 12 caràcters, incloure majúscules, minúscules, numeros i caràcters especials.")
        .css("color", "red");
      return;
    }
    if (newPassword !== confirmPassword) {
      $("#feedback").text("Les contrasenyes no coincideixen.").css("color", "red");
      return;
    }

    const usersColRef = collection(db, "users");
    const q = query(usersColRef, where("email", "==", currentEmail));
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (err) {
      $("#feedback").text("Error al consultar Firestore.").css("color", "red");
      return;
    }

    if (querySnapshot.empty) {
      $("#feedback").text("Usuario no trobat a Firestore.").css("color", "red");
      return;
    }

    let userDoc;
    querySnapshot.forEach((docSnap) => {
      userDoc = docSnap;
    });
    if (!userDoc) {
      $("#feedback").text("No s'ha trobat l'usuari.").css("color", "red");
      return;
    }

    const newSalt = generateSalt();
    const newPasswordHash = CryptoJS.SHA256(newPassword + newSalt).toString();

    const userRef = doc(db, "users", userDoc.id);
    try {
      await updateDoc(userRef, {
        password_hash: newPasswordHash,
        salt: newSalt,
        is_first_login: 0
      });
    } catch (error) {
      $("#feedback").text("Error al actualitzar la contrasenya.").css("color", "red");
      return;
    }

    let loggedUser = JSON.parse(localStorage.getItem("logged_in_user"));
    if (loggedUser) {
      loggedUser.password_hash = newPasswordHash;
      loggedUser.salt = newSalt;
      loggedUser.is_first_login = 0;
      localStorage.setItem("logged_in_user", JSON.stringify(loggedUser));
    } else {
      alert("No se encontró 'logged_in_user' en localStorage.");
    }

    localStorage.removeItem("current_email");

    $("#feedback")
      .text("Contrasenya modificada correctament. Redirigint...")
      .css("color", "green");

    setTimeout(() => {
      if (loggedUser && (loggedUser.edit_users || loggedUser.edit_news)) {
        window.location.href = "../pages/edit_users.html";
      } else {
        window.location.href = "../pages/news.html";
      }
    }, 2000);
  });

  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
