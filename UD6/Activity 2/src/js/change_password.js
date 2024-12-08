$(document).ready(function () {
    const currentEmail = localStorage.getItem("current_email");

    if (!currentEmail) {
        window.location.href = "login.html";
        return;
    }

    $("#changePasswordForm").submit(function (e) {
        e.preventDefault();

        const feedback = $("#feedback");
        const newPassword = $("#new_password").val().trim();
        const confirmPassword = $("#confirm_password").val().trim();

        if (newPassword !== confirmPassword) {
            feedback.text("Las contraseñas no coinciden.").css("color", "red");
            return;
        }

        if (newPassword.length < 8) {
            feedback.text("La contraseña debe tener al menos 8 caracteres.").css("color", "red");
            return;
        }

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
        user.is_first_login = 0; 
        users[userIndex] = user;

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.removeItem("current_email"); 

        feedback.text("Contraseña cambiada correctamente.").css("color", "green");

        setTimeout(() => {
            window.location.href = "edit_users.html";
        }, 2000);
    });

    function isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }
});
