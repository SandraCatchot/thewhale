$(document).ready(function () {
  const currentEmail = localStorage.getItem("current_email");

  $("#changePasswordForm").submit(function (e) {
    e.preventDefault();

    const feedback = $("#feedback");
    const newPassword = $("#new_password").val().trim();
    const confirmPassword = $("#confirm_password").val().trim();

    //Comprobamos si las contraseñas coinciden, y si no coinciden - muestra mensaje
    if (newPassword !== confirmPassword) {
      feedback.text("Las contraseñas no coinciden.").css("color", "red");
      return;
    }

    //Comprobar que la contraseña tiene mínimo 12 carácteres, incluye mayúsculas, minúsculas, números y caracteres especiales
    let passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).{12,}$/;

    if (!passwordRegex.test(newPassword)) {
      feedback
        .text(
          "La contraseña debe tener al menos 12 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales."
        )
        .css("color", "red");
      return;
    }

    //Comprobamos si el email usado está en users
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.email === currentEmail);

    if (userIndex === -1) {
      feedback.text("Usuario no encontrado.").css("color", "red");
      return;
    }

    const user = users[userIndex];
    const saltedPassword = newPassword + user.salt;
    const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

    user.password_hash = hashedPassword;
    user.is_first_login = 0; //Cambiamos para que cuando vuelva a entrar, no le vuelva a pedir cambiar contraseña
    users[userIndex] = user;

    localStorage.setItem("users", JSON.stringify(users));
    localStorage.removeItem("current_email");

    feedback.text("Contraseña cambiada correctamente.").css("color", "green");

    //Al terminar, redirigimos a edit_users
    setTimeout(() => {
      window.location.href = "edit_users.html";
    }, 2000);

  });

  function isValidPassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
});
