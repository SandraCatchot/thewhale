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
            salt: salt
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
                feedback.text("Primer inici de sessió. Per favor, canvii la contrasenya.")
                    .css("color", "orange");
                setTimeout(() => (window.location.href = "change_password.html"), 2000);
            } else {
                feedback.text("Inici de sessió validat!").css("color", "green");
                setTimeout(() => (window.location.href = "edit_users.html"), 2000);
            }
        } else {
            feedback.text("Contrasenya incorrecta.").css("color", "red");
        }
    });

    $("form#changePasswordForm").submit(function (e) {
        e.preventDefault();
        const email = localStorage.getItem("current_email");
        const newPassword = $("input[type='password']").val().trim();
        const feedback = $("#feedback");

        if (!newPassword || newPassword.length < 8) {
            feedback.text("La contrasenya ha de tenir almenys 8 caràcters.").css("color", "red");
            return;
        }

        const users = JSON.parse(localStorage.getItem("users")) || [];
        const userIndex = users.findIndex((u) => u.email === email);

        if (userIndex === -1) {
            feedback.text("Error: Usuari no trobat.").css("color", "red");
            return;
        }

        const user = users[userIndex];
        const saltedPassword = newPassword + user.salt;
        const hashedPassword = CryptoJS.SHA256(saltedPassword).toString();
        users[userIndex].password_hash = hashedPassword;
        users[userIndex].is_first_login = 0;
        localStorage.setItem("users", JSON.stringify(users));

        feedback.text("Contrasenya canviada correctament!").css("color", "green");
        setTimeout(() => {
            window.location.href = "portfoli.html";
        }, 2000);
    });

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function generateSalt() {
        return Math.random().toString(36).substring(2, 15);
    }
});
