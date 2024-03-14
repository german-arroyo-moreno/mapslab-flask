
////////////////////////////////////////////////////////////////////////////////////
////////////////  8.FUNCIÓN DEL MENÚ PRINCIPAL DE LA APLICACIÓN  //////////////////
////////////////////////////////////////////////////////////////////////////////////

// ASOCIAR ID AL LINK DE ELIMINAR PROYECTO EN BOTÓN DE VENTANA MODAL
document.querySelectorAll('.container .table tbody #deleteConfirm').forEach(function (element) {
    element.addEventListener("click", function() {
        var id = this.dataset.id;

        // Select button on modal window and add project_id to its href reference
        document.querySelector('#deleteModal > .modal-dialog .modal-footer > #deleteButton').href = "/delete_project/" + id;
    });
});