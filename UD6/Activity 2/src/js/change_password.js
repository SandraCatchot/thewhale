$(document).ready(function () {
    $("form#changePasswordForm").submit(function (e) {
        e.preventDefault();

        const feedback = $("#feedback");
        const newPassword = $("input[name='new_password']").val().trim();
        const confirmPassword = $("input[name='confirm_password']").val().trim();
        const currentEmail = localStorage.getItem("current_email");

        // Validar que ambas contraseñas coincidan
        if (newPassword !== confirmPassword) {
            feedback.text("Les contrasenyes no coincideixen.").css("color", "red");
            return;
        }

        // Validar que la contraseña sea segura
        if (!isValidPassword(newPassword)) {
            feedback.text("La contrasenya ha de tenir com a mínim 12 caràcters, incloure majúscules, minúscules, números i caràcters especials.")
                .css("color", "red");
            return;
        }

        // Actualizar la contraseña en localStorage
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex((u) => u.email === currentEmail);

        if (userIndex === -1) {
            feedback.text("Error: Usuari no trobat.").css("color", "red");
            return;
        }

        const user = users[userIndex];
        const saltedPassword = newPassword + user.salt;
        const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();

        // Guardar la nueva contraseña y marcar el inicio como completado
        user.password_hash = hashedPassword;
        user.is_first_login = 0;
        users[userIndex] = user;
        localStorage.setItem("users", JSON.stringify(users));

        feedback.text("Contrasenya canviada correctament!").css("color", "green");

        // Redirigir al usuario a edit_users.html
        setTimeout(() => {
            window.location.href = "edit_users.html";
        }, 2000);
    });

    // Función para validar contraseñas seguras
    function isValidPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;
        return passwordRegex.test(password);
    }
});
