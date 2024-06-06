from flask import Flask
from flask import render_template   #Renderizar plantillas
from flask import request #peticiones
from flask import jsonify #convertir en formato json en Python
from flask import Response #poder devolver respuestas
from flask import url_for, redirect 
from flask_login import LoginManager, current_user, login_user, logout_user, login_required #manejo de sesiones de usuario (flask-login)
from flask import session #almacenar info de la sesión de un usuario
from models import users, get_user, User #importar objetos Users definido en models.py
from forms import SignupForm, LoginForm, EditProfileForm #importar de forms.py
from werkzeug.urls import url_parse

import json
import csv
from pathlib import Path
import os
import shutil
import tempfile

# Global variables for the CSV files
CSV_DELIMITER = ';'
USER_CSV_LOCATION = './static/data/users.csv'
PROJECTS_CSV_LOCATION = './static/data/projects.csv'
JSON_LOCATION = './static/data/json/botones.json'

USER_CSV_FIELDNAMES = ['user_id', 'username', 'password', 'id_projects_list_author', 'id_projects_list_reader', 'is_admin']
PROJECTS_CSV_FIELDNAMES = ['project_id', 'name', 'author', 'url']

PROJECTS_DIR = './projects/project_'
PROJECT_FILES_CSV = 'proj_files.csv'
PROJECT_FILES_FIELDNAMES = ['file_id', 'file_name']

app = Flask(__name__)

# Login instance
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

# Set salt for hash from secret key
if 'SECURITY_PASSWORD_SALT' not in app.config:
    app.config['SECURITY_PASSWORD_SALT'] = app.config['SECRET_KEY']

#app.run(debug=True) # Debug mode

# Allow multithreading in Flask
if __name__ == '__main__':
    app.run(threaded=True)

@app.route("/")
#@login_required
def open_project():
    #Declare variables
    projects = []
    projects_to_read = []
    author_projects = []
    readers_of_shown_projects = []
    authors_of_shown_projects = []
    print('OPEN PROJECT: Es el current-user anonymous?', current_user.is_anonymous, 'por tanto está authenticated?', current_user.is_authenticated, 'El nombre del current user.nme es:', current_user)
    # print('se puede acceder a lista de lector?', current_user.get_id_projects_list_reader())
    if current_user.is_authenticated:
        projects_to_read, author_projects, readers_of_shown_projects, authors_of_shown_projects = get_projects_authors_readers()

        projects_file = Path(PROJECTS_CSV_LOCATION)
        if projects_file.is_file(): # if projects_file exists and is a file
            with projects_file.open("r") as project_csv:
                project_data = csv.DictReader(decomment(project_csv), delimiter=CSV_DELIMITER)

                for row in project_data:
                    project_id = row['project_id'] #string id number
                    if project_id in projects_to_read: # If the project is one of those which the user can read ... load data to show it
                        projects.append({
                            "id": row['project_id'],
                            "nombre": row['name'],
                            "autor": row['author'],
                            "url": row['url']
                        })
                print(projects)
        else: # create projects csv with header row
            projects_file.parent.mkdir(parents=True, exist_ok=True)
            with projects_file.open("w", encoding="utf-8") as new_projects_file:
                new_projects_file_w = csv.DictWriter(new_projects_file, delimiter=CSV_DELIMITER, fieldnames=PROJECTS_CSV_FIELDNAMES)
                new_projects_file_w.writeheader()
    return render_template('open-create.html', obras=projects, reader_users=readers_of_shown_projects, authors=authors_of_shown_projects, author_projects=author_projects)

@app.route("/app")
#@login_required
def main_app():
    return render_template('main-app.html')

# Devolver objeto User a partir de string con su ID almacenado
@login_manager.user_loader
def load_user(user_id):
    for user in users:
        print('Tipos de user.id y user_id por parámetro: ', type(str(user.id)), type(user_id))
        if str(user.id) == user_id: # string #id
            return user
    return None

# Store the whole content of users csv in a string
def load_users():
    users_local = []
    users_file = Path(USER_CSV_LOCATION)
    if users_file.is_file():
        with open(USER_CSV_LOCATION) as users_csv:
            # Load users csv content ignoring the comments as string
            users_data = csv.DictReader(decomment(users_csv), delimiter=CSV_DELIMITER)

            # Convert is_admin to boolean type
            for row in users_data:
                if row['is_admin'] == 'True':
                    row_is_admin = True
                if row['is_admin'] == 'False':
                    row_is_admin = False

                users_local.append({
                    "user_id": row['user_id'],
                    "username": row['username'],
                    "password": row['password'],
                    "id_projects_list_author": row['id_projects_list_author'],
                    "id_projects_list_reader": row['id_projects_list_reader'],
                    "is_admin": row_is_admin
                })
        
    return users_local

def load_Users_array():
    users_local = load_users() #string
    print('load_users_array obtiene de users local:')
    for user in users_local:
        print(user)
        users.append(User(
            user["user_id"],
            user["username"],
            user["password"],
            user["id_projects_list_author"],
            user["id_projects_list_reader"],
            user["is_admin"] # Even though it's a string, it will be recognised as a Boolean
        ))
        print(users)


def get_projects_authors_readers():
    projects_to_read = []
    author_projects = []
    readers_of_shown_projects = []
    authors_of_shown_projects = []
    users_local = load_users()

    # Obtain the projects which the current user reads and is author of
    for user in users_local:
        if user["username"] == current_user.name:
            if len(user["id_projects_list_reader"]) > 0:
                projects_to_read = user["id_projects_list_reader"].split(",") #Se almacenan los projectos que puede leer el usuario autenticado en una LISTA
            else:
                projects_to_read = list(user["id_projects_list_reader"])

            if len(user["id_projects_list_author"]) > 0:
                author_projects = user["id_projects_list_author"].split(",")
            else:
                author_projects = list(user["id_projects_list_author"])

    # Search other users who can co-read and co-modify the projects with the current user
    for user in users_local:
        for reader_permission in user["id_projects_list_reader"].split(","): 
            if reader_permission in author_projects or reader_permission in projects_to_read: 
                #Mostrar lectores de los proyectos de los que YO soy autor
                #Mostrar lectores de los proyectos en los que YO soy sólo lector
                readers_of_shown_projects.append({
                    "username": user["username"],
                    "reader_permission": reader_permission
                })
        for author_permission in user["id_projects_list_author"].split(","): 
            if author_permission in author_projects or author_permission in projects_to_read: 
                #Mostrar autores de los proyectos de los que YO soy sólo author
                #Mostrar autores de los proyectos de los que YO soy sólo lector
                authors_of_shown_projects.append({
                    "username": user["username"],
                    "author_project": author_permission
                })
    return projects_to_read, author_projects, readers_of_shown_projects, authors_of_shown_projects

@app.route("/receive", methods = ['POST', 'GET'])
def receiver():
    data = request.get_json(force=True)
    data["Al servidor ha llegado"] = "este JSON"
    print(data)

    if not request.is_json:
        print('No reconoce que sea application/json archivo ')
    else:
        print('Reconoce que es application/json')

    return jsonify(data)

# Function to overwrite json file
# def save_json(data):
#     with open(JSON_LOCATION, mode='w') as json_file:
#         # If data is still a dictionary, jsonify
#         data = jsonify(data)
#         # data = json.dumps(data, indent = 4)

#         # Overwrite json file with new data
#         json_file.write(data)


@app.route("/longpolling", methods = ['POST', 'GET'])
def longpolling():
    if not request.is_json:
        print('LP: No reconoce que sea application/json archivo ')
    else:
        print('LP: Reconoce que es application/json')

    return jsonify({"me lo": "estoy pensando"})


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    
    form = LoginForm()
    users_local = load_users() #  Show user names in login page
    print('LOGIN: Entré en login')
    if form.validate_on_submit(): # if login submit button is clicked
        name = form.name.data
        
        usernames = []
        for row in users_local:
            usernames.append(row['username'])
        
        # The next check is also in forms.py (only for console)
        if str(name) not in usernames:
            print("Sorry, that username doesn't exist")
        else:
            user = get_user(str(name))
            print('LOGIN: he cogido el user: ', user, 'cuyo nombre es: ', user.name, ' y password es: ', user.password, ' que es admin?', user.is_admin)
            print('LOGIN: procedo a checkear la password con check_password usando como "original" la del formulario: ', form.password.data)
            if user is not None and user.check_password(form.password.data):
                login_user(user, remember=form.remember_me.data)
                print('LOGIN: Se ha procedido a loggear. Es el current-user anonymous?', current_user.is_anonymous, 'por tanto está authenticated?', current_user.is_authenticated, 'El nombre del current user.nme es:', current_user)
                session['username'] = user.name
                next_page = request.args.get('next')
                print('LOGIN: Se ha procedido a loggear. Es el current-user anonymous?', current_user.is_anonymous, 'por tanto está authenticated?', current_user.is_authenticated, 'El nombre del current user.nme es:', current_user)
                if not next_page or url_parse(next_page).netloc != '':
                    next_page = url_for('open_project')
                return redirect(next_page)
            else:
                print("Password is not correct or user not registered. Try again")           
    return render_template('login_form.html', form=form, users=users_local)


@app.route('/logout')
#@login_required
def logout():
    logout_user()
    session.pop('username', default=None)
    return redirect(url_for('open_project'))

#Filter to ignore comments of the CSV file
def decomment(csvfile):
    for row in csvfile:
        raw = row.split('#')[0].strip()
        if raw: yield raw # Returns a generator

def signup_user_from_form(name, password, is_admin):
    with open(USER_CSV_LOCATION, mode='r+') as users_csv:
        users_data_r = csv.DictReader(decomment(users_csv), delimiter=CSV_DELIMITER)

        all_users = list(users_data_r)
        print('SIGNUP_USER_FROM FORM: qué users lee el signup DEL CSV', all_users)
        if len(all_users) > 0:
            new_user_id =  int(all_users[-1]['user_id']) + 1 # last user's id + 1 
        else:
            new_user_id = 1 

        user = User(str(new_user_id), name, '', '', '', is_admin) # Password will NOT be hashed this way. Id MUST be a string
        user.set_password(password) # Hashes password
        print('SIGNUP USER FROM FORM da de alta al usuario en array users: ', user.id, user.name, password, 'genera en user', user.password, user.is_admin, 'a partir de datos: ', new_user_id, name, password, is_admin)
        users.append(user) 
        print('SIGNUP USER FROM FORM: users en signup', users)

        users_data_w = csv.writer(users_csv, delimiter=CSV_DELIMITER)
        users_data_w.writerow([new_user_id, name, user.password, '', '', is_admin]) # Write new user's data in csv with hashed password

'''
        if is_admin:
            print('ha detectado que es admin en signup y se logea supuestamente')
            login_user(user, remember=True, force=True)
            print('Quién es el current user ahora', current_user)
            print('y cuál es su estatus como admin?', current_user.is_admin)
            session['username'] = name
'''


#Registro de usuarios si se usa el archivo users.csv
@app.route("/signup/", methods=["GET", "POST"])
def show_signup_form():
    users_file = Path(USER_CSV_LOCATION)
    # If it's not the first time to load the signup page
    if users_file.is_file(): # if users_file exists and is a file
        if (current_user.is_anonymous or not current_user.is_admin or 
            current_user.is_anonymous == 'True' or current_user.is_admin == 'False'): # if current user is not logged or is not admin
            print('You have to be an ADMIN to have access to the sign up page')
            return f"Log in as an ADMIN to add a new user",{"Refresh": "3; url=/login"}

    # It's the first time loading sign up page (no previous users)
    else: # users_file doesn't exist or it's not a file

        # Create directory /static/data and users.csv
        users_file.parent.mkdir(parents=True, exist_ok=True)
        with users_file.open("w", encoding="utf-8") as new_file:
            new_file_w = csv.DictWriter(new_file, delimiter=CSV_DELIMITER, fieldnames=USER_CSV_FIELDNAMES)
            new_file_w.writeheader() # write header row
            
        # Register first user of application as admin
        newuser_is_admin = True
        signup_user_from_form("admin", "admin", newuser_is_admin)
        user = get_user(str("admin"))
        print('SHOW SIGNUP FORM: el models almacenó esta contraseña: ', user.password, 'de ', user.name)
        # user.password = "admin"
        print('SHOW SIGNUP FORM: check-password-hash con contraseña "admin"??', user.check_password("admin"))

        # Login admin after signing up user admin
        login_user(user, remember=True)
        session['username'] = user.name

        return redirect(url_for('admin_panel'))

    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data
        newuser_is_admin = False 
        print('SHOW SIGNUP FORM: El usuario quiere dar de alta a: ', name, password, newuser_is_admin)

        signup_user_from_form(name, password, newuser_is_admin)

        next_page = request.args.get('next', None)
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('open_project')
            return redirect(next_page)
    
    return render_template("signup_form.html", form=form)


@app.route('/admin_panel')
@login_required
def admin_panel():
    # If not a logged admin, forbidden access
    if (current_user.is_anonymous or not current_user.is_admin or 
        current_user.is_anonymous == 'True' or current_user.is_admin == 'False'):
        return redirect(url_for('open_project'))
    else:
        return render_template("create_admin.html", username='admin', password='admin')

    # return render_template("create_admin.html", username='admin', password='admin')




@app.route('/upload_project', methods={"GET", "POST"})
#@login_required
def upload_project():
    if not current_user.is_authenticated:
        return f"You have to login to add a new project",{"Refresh": "3; url=/login"}
    else:
        if request.method == "GET":
            return render_template("upload_project.html")
        elif request.method == "POST":
            # Record project data in project csv
            userdata = dict(request.form)
            name = userdata["name"]
            author = userdata["author"]
            url = userdata["url"]

            projects_file = Path(USER_CSV_LOCATION)
            if projects_file.is_file(): # add project info to projects.csv and assign permissions to current user
                with open(PROJECTS_CSV_LOCATION, mode='r+') as csv_file:
                    project_data = csv.writer(csv_file, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)
                    data_r = csv.DictReader(decomment(csv_file), delimiter=CSV_DELIMITER)
                    
                    all_projects = list(data_r) #Last project's id + 1
                    print(all_projects)
                    if len(all_projects) > 0:
                        id_new_project =  int(all_projects[-1]['project_id']) + 1
                    else:
                        id_new_project = 1

                    project_data.writerow([id_new_project, name, author, url])
                    username_with_projectadded = add_project_to_user(id_new_project) # Añadir obra a usuario (autor y lector)
            else: 
                # Create projects.csv if it doesn't exist. Add project info and assign permissions to current user
                projects_file.parent.mkdir(parents=True, exist_ok=True)
                with projects_file.open("w", encoding="utf-8") as new_file:
                    new_file_w = csv.DictWriter(new_file, delimiter=CSV_DELIMITER, fieldnames=PROJECTS_CSV_FIELDNAMES)
                    new_file_w.writeheader() # write header row
                    new_file_w.writerow([1, name, author, url]) # Id number 1 (first project to be created)
                    username_with_projectadded = add_project_to_user(1) # Add project to user (author and reader permissions)

            # Create folder and files of new project
            create_project_files(id_new_project)
    return f"{name} saved in projects.csv! Author and reader permissions given to user {username_with_projectadded}",{"Refresh": "4; url=/"} 

@app.route('/delete_project/<id>', methods={"GET", "POST"})
#@login_required
def delete_project(id):
    if not current_user.is_authenticated:
        return f'You have to login to delete a project',{"Refresh": "3; url=/login"}
    else: # Delete project info from projects.csv
        lines = []
        with open(PROJECTS_CSV_LOCATION, 'r') as readFile:
            reader = csv.DictReader(readFile, delimiter=CSV_DELIMITER)
            for row in reader:
                if row['project_id'] != str(id): #Not to include the project to delete
                    lines.append(dict(row))

        with open(PROJECTS_CSV_LOCATION, 'w') as writeFile:
            writer = csv.DictWriter(writeFile, delimiter=CSV_DELIMITER, fieldnames=PROJECTS_CSV_FIELDNAMES)
            writer.writeheader()
            writer.writerows(lines)
        
        status_deleted = delete_project_from_users(id)
        delete_project_files(id)
        
        return f"¿Se ha eliminado la obra con id {id} de projects.csv y de los permisos de los usuarios en el archivo users.csv? : {status_deleted}",{"Refresh": "3; url=/"} 


def add_project_to_user(id_new_project):
    with open(USER_CSV_LOCATION, mode='r') as users_csv:
        users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
        users_dict = []

        for row in users_data_r:
            if row['username'] == current_user.name:
                if len(row['id_projects_list_author']) > 0:
                    row['id_projects_list_author'] = row['id_projects_list_author'].split(",") #Convertir elemento string dentro de obj diccionario en lista y separar con comas
                else:
                    row['id_projects_list_author'] = list(row['id_projects_list_author']) #Sólo convertir string a lista, sin separar con comas (no hay ningún elemento)

                if len(row['id_projects_list_reader']) > 0:
                    row['id_projects_list_reader'] = row['id_projects_list_reader'].split(",")
                else:
                    row['id_projects_list_reader'] = list(row['id_projects_list_reader'])

                row['id_projects_list_author'].append(f'{id_new_project}') #Añadir id_proyecto a lista
                row['id_projects_list_reader'].append(f'{id_new_project}')

                row['id_projects_list_author'] = ','.join(row['id_projects_list_author']) #Convertir lista en string
                row['id_projects_list_reader'] = ','.join(row['id_projects_list_reader'])

            users_dict.append(dict(row))
            #users_dict.append(row)  

    with open(USER_CSV_LOCATION, mode='w') as users_csv: #Abrimos de nuevo para sobreescribir el archivo
        users_data_w = csv.DictWriter(users_csv, delimiter=CSV_DELIMITER, fieldnames=USER_CSV_FIELDNAMES) 
        users_data_w.writeheader()
        users_data_w.writerows(users_dict)
        
    return current_user.name

def delete_project_from_users(id_project):
    with open(USER_CSV_LOCATION, mode='r') as users_csv:
        users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
        users_dict = []

        for row in users_data_r:
            if row['username'] == current_user.name:
                #Convert projects of the current user in a list
                if len(row['id_projects_list_author']) > 0:
                    own_projects = row['id_projects_list_author'].split(",") #Convertir elemento string dentro de obj diccionario en lista y separar con comas
                else:
                    own_projects = list(row['id_projects_list_author']) #Sólo convertir string a lista, sin separar con comas (no hay ningún elemento)

                if str(id_project) not in own_projects:
                    print('You have to be the author of the project you want to delete')
                    return False
                else:
                    break

    with open(USER_CSV_LOCATION, mode='r') as users_csv:
        users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
        #Current user is author of the project to delete
        for row_j in users_data_r:
            #Convert author and reader projects of all users to a list
            if len(row_j['id_projects_list_author']) > 0:
                row_j['id_projects_list_author'] = row_j['id_projects_list_author'].split(",") #Convertir elemento string dentro de obj diccionario en lista y separar con comas
            else:
                row_j['id_projects_list_author'] = list(row_j['id_projects_list_author']) #Sólo convertir string a lista, sin separar con comas (no hay ningún elemento)

            if len(row_j['id_projects_list_reader']) > 0:
                row_j['id_projects_list_reader'] = row_j['id_projects_list_reader'].split(",")
            else:
                row_j['id_projects_list_reader'] = list(row_j['id_projects_list_reader'])

            #Delete project if user is reader or author
            if (str(id_project) in row_j['id_projects_list_author']):
                row_j['id_projects_list_author'].remove(str(id_project)) #Delete string project_id from list
                print(f'Deleted project_id number {id_project} associated as author permissions to user {row_j["username"]}')
            else:
                print(f'There is no project_id number {id_project} associated as author permissions to user {row_j["username"]}')

            if (str(id_project) in row_j['id_projects_list_reader']):
                row_j['id_projects_list_reader'].remove(str(id_project))
                print(f'Deleted project_id number {id_project} associated as reader permissions to user {row_j["username"]}')
            else:
                print(f'There is no project_id number {id_project} associated as reader permissions to user {row_j["username"]}')

            #Convert lists to string
            row_j['id_projects_list_author'] = ','.join(row_j['id_projects_list_author'])
            row_j['id_projects_list_reader'] = ','.join(row_j['id_projects_list_reader'])

            users_dict.append(dict(row_j))

        with open(USER_CSV_LOCATION, mode='w') as users_csv: #Abrimos de nuevo para sobreescribir el archivo
            users_data_w = csv.DictWriter(users_csv, delimiter=CSV_DELIMITER, fieldnames=USER_CSV_FIELDNAMES) 
            users_data_w.writeheader()
            users_data_w.writerows(users_dict)
        
    return True

def create_project_files(id_new_project):
    try:
        new_proj_folder = PROJECTS_DIR + str(id_new_project)
        os.mkdir(new_proj_folder)
        with open(new_proj_folder + '/' + PROJECT_FILES_CSV, "w") as proj_files_csv: # create new csv for project files of new added project
            writer = csv.DictWriter(proj_files_csv, delimiter=CSV_DELIMITER, fieldnames=PROJECT_FILES_FIELDNAMES)
            writer.writeheader()

    except FileExistsError as error:
        print(f"Error Type: {error}.\n Project with id number {id_new_project} already exists")
    except FileNotFoundError as error:
        print(f"Error Type: {error}.\n Project folder not found")

def delete_project_files(id_project):
    try:
        shutil.rmtree(PROJECTS_DIR + str(id_project))
    except OSError as error:
        print(f"Error Type: {error}.\n Project files not found")

# Profile page (form to modify password)
@app.route('/profile/<username>', methods = ['POST', 'GET'])
@login_required
def profile(username):
    # Get current user object
    user = get_user(str(username))
    # Load form
    form = EditProfileForm()
    # Show name of current user in form name field
    form.name.data = user.name
    
    # If submit button is clicked
    if form.validate_on_submit():
        oldpassword = form.oldpassword.data
        password = form.password.data
        password2 = form.password2.data
        
        # If object user exists and password is correct
        if user is not None and user.check_password(form.oldpassword.data):
            # If new passwords coincide, change old password and substitute it with new password
            if password == password2: # This is also checked in the form validation (EqualTo)
                # Substitute new password in flask-login
                user.set_password(password)
                # Substitute new password in csv
                with open(USER_CSV_LOCATION, mode='r') as users_csv:
                    users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER) # with comments
                    lines = []
                    for row in users_data_r:
                        lines.append(dict(row))

                for line in lines:
                    if line['user_id'] == user.id:
                        line['password'] = user.password # Modify only password field

                # Overwrite users file with new information
                with open(USER_CSV_LOCATION, mode='w') as writeFile:
                    users_data_w = csv.DictWriter(writeFile, delimiter=CSV_DELIMITER, fieldnames=USER_CSV_FIELDNAMES)
                    users_data_w.writeheader()
                    users_data_w.writerows(lines) 

            # Redirect to previous page. If not, to home page
            next_page = request.args.get('next', None)
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('open_project')
                return redirect(next_page)

    return render_template('profile.html', username=user.name, form=form)


# ----------------------------------------------------------------------
#                     SERVER EXECUTION
# ----------------------------------------------------------------------

# Get parameters of the new layer to be created
@app.route("/exec_server", methods = ['POST', 'GET'])
def exec_server():
    # Get the data
    data = request.get_json(force=True)

    # Transform data into server parameters' format
    data['normalization'] = str(data['normalization']).upper()
    if data['position_normalization'] == 'heterogeneous':
        data['position_normalization'] = 'HET'
    if data['position_normalization'] == 'homogeneous':
        data['position_normalization'] = 'HOM'
    
    # Execute server with received parameters
    exec_server_parameters(data)

    # Send back transformed data to user 
    return jsonify(data)

# Auxiliary function to add and convert new parameters to original string
def add_param(parameters, new_parameter):
    return parameters + " " + str(new_parameter)

# ----------------------------------------------------------------------

# Execution of server core with parameters
def exec_server_parameters(parameters):
    '''
    usage: maplab-core.bin  Input_data[name of CSV file (included in input_data folder)] 
                            Input_image[name of PNG file(included in input_data folder)] 
                            Output_name[saved in output_data folder] 
                            Element_name 
                            Save_data[Y|N]  
                            Save_image[Y|N] 
                            Output_data_file_type[TXT|BIN] 
                            color_model[RGB|HLS|HSV|LAB|LUB] 
                            color1[TRUE|FALSE] 
                            color2[TRUE|FALSE] 
                            color3[TRUE|FALSE] 
                            position1[TRUE|FALSE] 
                            position2[TRUE|FALSE] 
                            normalization[TRUE|FALSE] 
                            position_normalization[HOM|HET] 
                            probe[1|2|...|49] 
                            palette_number[0|1|2|...|15] 
                            Num_points(from 1 to 165) 
                            Seed(-1 for random) 
                            Random_distribution(UNIFORM|COLOR)
    # Example : maplab-core.bin data.csv vis_image.png prueba As Y Y TXT RGB TRUE TRUE TRUE TRUE TRUE TRUE HET 1 3 100 230 UNIFORM
    '''
    param = 'podman run -it -w /mnt/server/maplab-core -v ./salida:/mnt/server/maplab-core/output_data --rm imagen-de-domingo ./maplab-core.bin'
    param = add_param(param, "data.csv")    #param = add_param(param, parameters["Input_data"])
    param = add_param(param, "vis_image.png") # param = add_param(param, parameters["Input_image"])
    # param = add_param(param, parameters["Output_name"])
    
    # Assign temporary name to file
    with tempfile.NamedTemporaryFile(prefix="layer_", dir="./salida") as tf:
        parameters["Output_name"] = tp.name
        param = add_param(param, parameters["Output_name"]) # Add temporary output name

    param = add_param(param, parameters["Element_name"])
    param = add_param(param, "N") # param = add_param(param, parameters["save_data"])
    param = add_param(param, "Y") # param = add_param(param, parameters["save_image"])
    param = add_param(param, "TXT") # param = add_param(param, parameters["output_data_file_type"])
    param = add_param(param, "RGB") # param = add_param(param, parameters["color_model"])
    param = add_param(param, "TRUE") # param = add_param(param, parameters["color1"])
    param = add_param(param, "TRUE") # param = add_param(param, parameters["color2"])
    param = add_param(param, "TRUE") # param = add_param(param, parameters["color3"])
    param = add_param(param, "TRUE") # param = add_param(param, parameters["position1"])
    param = add_param(param, "TRUE") # param = add_param(param, parameters["position2"])
    param = add_param(param, parameters["normalization"])
    param = add_param(param, parameters["position_normalization"])
    param = add_param(param, "1") # param = add_param(param, parameters["probe"])
    param = add_param(param, parameters["palette_number"])
    param = add_param(param, "100") # param = add_param(param, parameters["num_points"])
    param = add_param(param, "230") # param = add_param(param, parameters["seed"])
    param = add_param(param, "UNIFORM") # param = add_param(param, parameters["random_distribution"])
    print('El servidor calcula que hay que enviar estos praámetros al núcleo:', param)

    os.system(param)

#Load only once in app
with app.app_context():
    #logout_user()  # Pop previous users sessions # Error if working outside of request context
    load_Users_array()
