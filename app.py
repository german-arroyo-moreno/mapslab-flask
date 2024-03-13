from flask import Flask
from flask import render_template   #Renderizar plantillas
from flask import request #peticiones
from flask import jsonify #convertir en formato json en Python
from flask import Response #poder devolver respuestas
from flask import url_for, redirect 
from flask_login import LoginManager, current_user, login_user, logout_user #manejo de sesiones de usuario (flask-login)
from flask import session #almacenar info de la sesión de un usuario
from models import users, get_user, User #importar objetos Users definido en models.py
from forms import SignupForm, LoginForm #importar de forms.py
from werkzeug.urls import url_parse

import json
import csv
from pathlib import Path

# Global variables for the CSV files
CSV_DELIMITER = ';'
USER_CSV_LOCATION = './static/data/users.csv'
PROJECTS_CSV_LOCATION = './static/data/projects.csv'

USER_CSV_FIELDNAMES = ['user_id', 'username', 'password', 'id_projects_list_author', 'id_projects_list_reader', 'is_admin']
PROJECTS_CSV_FIELDNAMES = ['project_id', 'name', 'author', 'url']

app = Flask(__name__)

# Login instance
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "login"

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

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

    # print('se puede acceder a lista de lector?', current_user.get_id_projects_list_reader())
    if current_user.is_authenticated:
        projects_to_read, author_projects, readers_of_shown_projects, authors_of_shown_projects = get_projects_authors_readers()

        projects_file = Path(PROJECTS_CSV_LOCATION)
        if projects_file.is_file(): # if projects_file exists and is a file
            with projects_file.open("r") as project_csv:
                project_data = csv.DictReader(project_csv, delimiter=CSV_DELIMITER)

                for row in project_data:
                    if row['project_id'] in projects_to_read: # If the project is one of those which the user can read ... load data to show it
                        projects.append({
                            "id": row['project_id'],
                            "nombre": row['name'],
                            "autor": row['author'],
                            "url": row['url']
                        })
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
        if int(user.id) == int(user_id):
            return user
    return None

def load_users():
    users_local = []
    users_file = Path(USER_CSV_LOCATION)
    if users_file.is_file():
        with open(USER_CSV_LOCATION) as users_csv:
            users_data = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)

            for row in users_data:
                print('qué users está encontrando leches?', row['username'])
                users_local.append({
                    "user_id": row['user_id'],
                    "username": row['username'],
                    "password": row['password'],
                    "id_projects_list_author": row['id_projects_list_author'],
                    "id_projects_list_reader": row['id_projects_list_reader'],
                    "is_admin": row['is_admin']
                })
        
    return users_local

def load_Users_array():
    users_local = load_users() #string
    print('load_users_array obtiene de users local:')
    for user in users_local:
        print(user)
        users.append(User(
            int(user["user_id"]),
            user["username"],
            user["password"],
            user["id_projects_list_author"],
            user["id_projects_list_reader"],
            bool(user["is_admin"])
        ))


def get_projects_authors_readers():
    projects_to_read = []
    author_projects = []
    reader_users_of_shown_projects = []
    authors_of_shown_projects = []
    users_local = load_users()

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

    for user in users_local:
        for reader_permission in user["id_projects_list_reader"].split(","): 
            if reader_permission in author_projects or reader_permission in projects_to_read: 
                #Mostrar lectores de los proyectos de los que YO soy autor
                #Mostrar lectores de los proyectos en los que YO soy sólo lector
                reader_users_of_shown_projects.append({
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
    return projects_to_read, author_projects, reader_users_of_shown_projects, authors_of_shown_projects

@app.route("/receive", methods = ['POST', 'GET'])
def receiver():
    data = request.get_json(force=True)
    data["Al servidor ha llegado"] = "este JSON"
    print(data)
    result = {"adio": "adio"}
    print(result)

    if not request.is_json:
        print('No reconoce que sea application/json archivo ')
    else:
        print('Reconoce que es application/json')

    # for item in data:
    #    result += str(item) + '\n'

    return jsonify(data)


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

    if form.validate_on_submit(): # if login submit button is clicked
        name = form.name.data
        
        usernames = []
        for row in users_local:
            usernames.append(row['username'])
        
        if str(name) not in usernames:
            print("Sorry, that username doesn't exist")
        else:
            user = get_user(str(name))
            if user is not None and user.check_password(form.password.data):
                login_user(user, remember=form.remember_me.data)
                session['username'] = name
                next_page = request.args.get('next')
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

def signup_user_from_form(name, password, is_admin):
    with open(USER_CSV_LOCATION, mode='r+') as users_csv:
        users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)

        all_users = list(users_data_r)
        if len(all_users) > 0:
            new_user_id =  int(all_users[-1]['user_id']) + 1 # last user's id + 1
        else:
            new_user_id = 1            

        users_data_w = csv.writer(users_csv, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)
        users_data_w.writerow([int(new_user_id), name, password, '', '', is_admin]) # Write new user's data in csv
        user = User(int(new_user_id), name, '', '', '', is_admin) #Empty password for now
        user.set_password(password) #Hash password
        users.append(user)
        if is_admin:
            login_user(user, remember=True)
            session['username'] = name


#Registro de usuarios si se usa el archivo users.csv (2º alternativa)
@app.route("/signup/", methods=["GET", "POST"])
def show_signup_form():
    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data

        users_file = Path(USER_CSV_LOCATION)
        if users_file.is_file(): # if users_file exists and is a file
            if (current_user.is_anonymous or not current_user.is_admin or 
                current_user.is_anonymous == 'True' or current_user.is_admin == 'False'): # if current user is not logged or is not admin
                print('You have to be an ADMIN to have access to the sign up page')
                return f"Log in as an ADMIN to add a new user",{"Refresh": "3; url=/login"} #redirect(url_for('open_project'))

            users_local = load_users()
            newuser_is_admin = True
            for user in users_local:
                if user['is_admin'] == 'True': #if users file contains user information and at least one admin already exists
                    # current_user is already an admin and signs new user up, who is not admin
                    newuser_is_admin = False
            
        else: # users_file doesn't exist or it's not a file
            # Create directory /static/data and users.csv
            users_file.parent.mkdir(parents=True, exist_ok=True)
            with users_file.open("w", encoding="utf-8") as new_file:
                new_file_w = csv.DictWriter(new_file, delimiter=CSV_DELIMITER, fieldnames=USER_CSV_FIELDNAMES)
                new_file_w.writeheader() # write header row
                #new_file.write(';'.join(str(element) for element in USER_CSV_FIELDNAMES)) #write header row
                
            # Register first user of application as admin
            newuser_is_admin = True

        signup_user_from_form(name, password, newuser_is_admin)

        next_page = request.args.get('next', None)
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('open_project')
            return redirect(next_page)
    
    return render_template("signup_form.html", form=form)

'''
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data

        try:
            with open('./static/data63821/users365.csv', mode='r+') as users_csv:
                users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
                usernames = []
                last_user_id = 0
                for row in users_data_r:
                    usernames.append(row['username'])
                    last_user_id = row['user_id']

                if name in usernames:
                    print("Sorry, that username is already in use. Choose another one")
                else:
                    users_data_w = csv.writer(users_csv, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)
                    users_data_w.writerow([int(last_user_id) + 1, name, password, '', '']) # Grabamos datos de nuevo usuario en csv
                    user = User(int(last_user_id) + 1, name, '', '', '') #Empty password for now
                    user.set_password(password) #Hash password
                    users.append(user)

                    login_user(user, remember=True)
                    session['username'] = name
                    next_page = request.args.get('next', None)
                    if not next_page or url_parse(next_page).netloc != '':
                        next_page = url_for('open_project')
                    return redirect(next_page)
        except FileNotFoundError:
            print('No he encontrado el archivo!!')
    return render_template("signup_form.html", form=form)
'''    


@app.route('/upload_project', methods={"GET", "POST"})
#@login_required
def upload_project():
    if not current_user.is_authenticated:
        return f"You have to login to add a new project",{"Refresh": "3; url=/login"}
    else:
        if request.method == "GET":
            return render_template("upload_project.html")
        elif request.method == "POST":
            userdata = dict(request.form)
            name = userdata["name"]
            author = userdata["author"]
            url = userdata["url"]
            with open(PROJECTS_CSV_LOCATION, mode='r+') as csv_file:
                project_data = csv.writer(csv_file, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)
                data_r = csv.DictReader(csv_file, delimiter=CSV_DELIMITER)
                
                all_projects = list(data_r) #Last project's id + 1
                if len(all_projects) > 0:
                    id_new_project =  int(all_projects[-1]['project_id']) + 1
                else:
                    id_new_project = 1

                project_data.writerow([id_new_project, name, author, url])
                username_with_projectadded = add_project_to_user(id_new_project) # Añadir obra a usuario (autor y lector)
    return f"{name} saved in projects.csv! Author and reader permissions given to user {username_with_projectadded}",{"Refresh": "4; url=/"} 

@app.route('/delete_project/<id>', methods={"GET", "POST"})
#@login_required
def delete_project(id):
    if not current_user.is_authenticated:
        return f'You have to login to delete a project',{"Refresh": "3; url=/login"}
    else:
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

#Load only once in app
with app.app_context():
    load_Users_array()
