// ESCRIBIR USERNAME DEL BOTÓN EN CAMPO INPUT DEL FORMULARIO AL CLICARLO
document.querySelectorAll('.login-username').forEach(function (element) {
    element.addEventListener("click", function() {
        var username = this.innerText;

        // Select form input field and display clicked username
        document.querySelector('.form-login #username-input').value = username;
    });
});