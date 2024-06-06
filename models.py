from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin):
    def __init__(self, id, name, password, id_projects_list_author, id_projects_list_reader, is_admin=False):
        self.id = id
        self.name = name
        self.password = password # Password will NOT be hashed if defined initially. For hashing -> set_password method
        self.id_projects_list_author = id_projects_list_author
        self.id_projects_list_reader = id_projects_list_reader
        self.is_admin = is_admin

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        print('MODELS: aquí compruebo si estsa dos son la mism: ', self.password, password, 'de tipos', type(self.password), type(password), 'RESULTADO CHECK: ', check_password_hash(self.password, password))
        return check_password_hash(self.password, password) # (Hashed password, original password)

    def __repr__(self):
        return '<User {}>'.format(self.name)


users = [] # List of objects 'User' from the csv

#@login_manager.user_loader  # login_manager object is only in app.py!
def get_user(name):
    for user in users:
        if str(user.name) == name:
            return user
    return None
