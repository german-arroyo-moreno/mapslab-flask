
////////////////////////////////////////////////////////////////////////////////////
/////////////  8.FUNCIÓN DE LA PÁGINA PRINCIPAL DE LA APLICACIÓN  ///////////////
////////////////////////////////////////////////////////////////////////////////////

document.querySelector('.container .table tbody #deleteConfirm').onclick = function () {
    var id = this.dataset.id;

    // Select button on modal window and add project_id to its href reference
    document.querySelector('#deleteModal > .modal-dialog .modal-footer > #deleteButton').href = "/delete_artwork/" + id;
}