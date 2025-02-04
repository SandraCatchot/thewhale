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
        console.log("Obtenido currentEmail de logged_in_user:", currentEmail);
      } catch (e) {
        console.error("Error al parsear logged_in_user:", e);
      }
    }
  }
  if (!currentEmail) {
    $("#feedback").text("No s'ha trobat l'usuari.").css("color", "red");
    console.error("No se encontró 'current_email' ni 'logged_in_user.email' en localStorage.");
    return;
  }
  console.log("Change Password: current email =", currentEmail);

  $("#changePasswordForm").submit(async function (e) {
    e.preventDefault();

    const newPassword = $("#newPassword").val().trim();
    const confirmPassword = $("#confirmPassword").val().trim();

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{12,}$/;
    if (!passwordRegex.test(newPassword)) {
      $("#feedback")
        .text("La contraseña ha de tenir mínim 12 caràcters, incloure majúscules, minúscules, numeros i caràcters especials.")
        .css("color", "red");
      console.error("La contraseña no cumple los requisitos:", newPassword);
      return;
    }
    if (newPassword !== confirmPassword) {
      $("#feedback").text("Les contrasenyes no coincideixen.").css("color", "red");
      console.error("Las contraseñas no coinciden.");
      return;
    }

    const usersColRef = collection(db, "users");
    const q = query(usersColRef, where("email", "==", currentEmail));
    let querySnapshot;
    try {
      querySnapshot = await getDocs(q);
    } catch (err) {
      $("#feedback").text("Error al consultar FIrestore.").css("color", "red");
      console.error("Error en getDocs:", err);
      return;
    }

    if (querySnapshot.empty) {
      $("#feedback").text("Usuario no trobat a Firestore.").css("color", "red");
      console.error("No se encontró documento para el email:", currentEmail);
      return;
    }

    let userDoc;
    querySnapshot.forEach((docSnap) => {
      userDoc = docSnap;
    });
    if (!userDoc) {
      $("#feedback").text("No s'ha trobat l'usuari.").css("color", "red");
      console.error("El documento del usuario es indefinido.");
      return;
    }
    console.log("Documento de usuario encontrado:", userDoc.id, userDoc.data());

    const newSalt = generateSalt();
    const newPasswordHash = CryptoJS.SHA256(newPassword + newSalt).toString();
    console.log("Nueva salt:", newSalt, "Nuevo hash:", newPasswordHash);

    const userRef = doc(db, "users", userDoc.id);
    try {
      await updateDoc(userRef, {
        password_hash: newPasswordHash,
        salt: newSalt,
        is_first_login: 0
      });
      console.log("Contraseña actualizada en Firestore para", currentEmail);
    } catch (error) {
      $("#feedback").text("Error al actualitzar la contrasenya.").css("color", "red");
      console.error("Error al actualizar Firestore:", error);
      return;
    }

    let loggedUser = JSON.parse(localStorage.getItem("logged_in_user"));
    if (loggedUser) {
      loggedUser.password_hash = newPasswordHash;
      loggedUser.salt = newSalt;
      loggedUser.is_first_login = 0;
      localStorage.setItem("logged_in_user", JSON.stringify(loggedUser));
      console.log("logged_in_user actualizado en localStorage:", loggedUser);
    } else {
      console.warn("No se encontró 'logged_in_user' en localStorage.");
    }

    localStorage.removeItem("current_email");
    console.log("Se eliminó 'current_email' de localStorage.");

    $("#feedback")
      .text("Contrasenya modificada correctament. Redirigint...")
      .css("color", "green");

    setTimeout(() => {
      if (loggedUser && (loggedUser.edit_users || loggedUser.edit_news)) {
        console.log("Redirigiendo a edit_users.html");
        window.location.href = "edit_users.html";
      } else {
        console.log("Redirigiendo a news.html");
        window.location.href = "news.html";
      }
    }, 2000);
  });

  function generateSalt() {
    return Math.random().toString(36).substring(2, 15);
  }
});
