
////////////////////////////////////////////////////////////////////////////////////
/////////////  8.FUNCIÓN DE LA PÁGINA PRINCIPAL DE LA APLICACIÓN  ///////////////
////////////////////////////////////////////////////////////////////////////////////

document.querySelectorAll('.container .table tbody #deleteConfirm').forEach(function (element) {
    element.addEventListener("click", function() {
        var id = this.dataset.id;

        // Select button on modal window and add project_id to its href reference
        document.querySelector('#deleteModal > .modal-dialog .modal-footer > #deleteButton').href = "/delete_project/" + id;
    });
});