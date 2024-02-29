from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin):
    def __init__(self, id, name, password, id_projects_list_author, id_projects_list_reader, is_admin=False):
        self.id = id
        self.name = name
        self.password = generate_password_hash(password) # Se cargará desde un csv. Y la contraseña se guardará cifrada directamente. Y cargarla igual.
        self.id_projects_list_author = id_projects_list_author
        self.id_projects_list_reader = id_projects_list_reader
        self.is_admin = is_admin

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def __repr__(self):
        return '<User {}>'.format(self.name)


users = [] #Supuesta lista de objetos tipo User que contiene todos los usuarios creados "en la base de datos"

#@login_manager.user_loader #login_manager is only in app.py!
def get_user(name):
    for user in users:
        if str(user.name) == name:
            print('Buscando user.name de ', user.name, 'en get_user')
            return user
    return None
