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

# Global variables for the CSV files
CSV_DELIMITER = ';'
USER_CSV_LOCATION = './static/data/users.csv'
PROJECTS_CSV_LOCATION = './static/data/artwork.csv'

app = Flask(__name__)

# Login instance
login_manager = LoginManager(app)
login_manager.login_view = "login"

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

#app.run(debug=True) # Debug mode

# Permitir multithreading en Flask
if __name__ == '__main__':
    app.run(threaded=True)

@app.route("/")
@login_manager.user_loader
def open_project():
    projects_to_show = [0]
    if current_user.is_authenticated:
        users_local = load_users()

        for user in users_local:
            if user["username"] == current_user.name:
                if len(user["id_projects_list_reader"]) > 0:
                    projects_to_show = user["id_projects_list_reader"].split(",") #Se almacenan los projectos que puede leer el usuario autenticado en una LISTA
                else:
                    projects_to_show = list(user["id_projects_list_reader"])

    with open(PROJECTS_CSV_LOCATION) as artwork_csv:
        artwork_data = csv.DictReader(artwork_csv, delimiter=CSV_DELIMITER)
        artwork = []

        for row in artwork_data:
            if row['project_id'] in projects_to_show: #Si el proyecto es uno que puede leer el usuario... que sea visible
                artwork.append({
                    "id": row['project_id'],
                    "nombre": row['name'],
                    "autor": row['author'],
                    "url": row['url']
                })
    return render_template('open-create.html', obras=artwork)

@app.route("/app")
def main_app():
    return render_template('main-app.html')


# Devolver objeto User a partir de string con su ID almacenado
@login_manager.user_loader
def load_user(user_id):
    for user in users:
        if user.id == int(user_id):
            return user
    return None

def load_users():
    with open(USER_CSV_LOCATION) as users_csv:
        users_data = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
        users_local = []

        for row in users_data:
            users_local.append({
                "user_id": row['user_id'],
                "username": row['username'],
                "password": row['password'],
                "id_projects_list_author": row['id_projects_list_author'],
                "id_projects_list_reader": row['id_projects_list_reader']
            })
        
    return users_local


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

'''
#Login si se usan los modelos (ORM) (alternativa)
@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    form = LoginForm()
    if form.validate_on_submit():
        user = get_user(form.name.data)
        print(user)
        if user is not None and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('open_project')
            return redirect(next_page)
        else:
            print("Password is not correct or user not registered. Try again")
    return render_template('login_form.html', form=form)
'''
'''
#Registro de usuarios si se usan los modelos (ORM) para base de datos (1º alternativa)
@app.route("/signup/", methods=["GET", "POST"])
def show_signup_form():
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data
        # Creamos el usuario y lo guardamos
        user = User(len(users) + 1, name, password)
        users.append(user)
        
        # Dejamos al usuario logueado
        login_user(user, remember=True)
        next_page = request.args.get('next', None)

        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('open_project')
        return redirect(next_page)
    return render_template("signup_form.html", form=form)
'''

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    
    form = LoginForm()
    users_local = load_users() # Mostrar usuarios en página de login

    if form.validate_on_submit(): # si se aprieta el botón de login
        name = form.name.data
        
        usernames = []
        for row in users_local:
            usernames.append(row['username'])
        
        if name not in usernames:
            print("Sorry, that username doesn't exist")
        else:
            user = get_user(name)
            if user is not None and user.check_password(form.password.data):
                login_user(user, remember=form.remember_me.data)
                next_page = request.args.get('next')
                if not next_page or url_parse(next_page).netloc != '':
                    next_page = url_for('open_project')
                return redirect(next_page)
            else:
                print("Password is not correct. Try again")           
    return render_template('login_form.html', form=form, users=users_local)

#Registro de usuarios si se usa el archivo users.csv (2º alternativa)
@app.route("/signup/", methods=["GET", "POST"])
def show_signup_form():
    if current_user.is_authenticated:
        return redirect(url_for('open_project'))
    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        password = form.password.data

        with open(USER_CSV_LOCATION, mode='r+') as users_csv:
            users_data_r = csv.reader(users_csv, delimiter=CSV_DELIMITER)
            usernames = []
            rownumbers = 0
            for row in users_data_r:
                usernames.append(row[1])
                rownumbers += 1

            if name in usernames:
                print("Sorry, that username is already in use. Choose another one")
            else:
                users_data_w = csv.writer(users_csv, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)
                users_data_w.writerow([rownumbers, name, password, '', '']) # Grabamos datos de nuevo usuario en csv
                user = User(len(users) + 1, name, password)
                #user.set_password(password)
                users.append(user)
                login_user(user, remember=True)
                next_page = request.args.get('next', None)
                if not next_page or url_parse(next_page).netloc != '':
                    next_page = url_for('open_project')
                return redirect(next_page)
    return render_template("signup_form.html", form=form)


@app.route('/logout')
#@login_required
def logout():
    logout_user()
    return redirect(url_for('open_project'))

@app.route('/upload_artwork', methods={"GET", "POST"})
def upload_artwork():
    if not current_user.is_authenticated:
        return f"You have to login to add a new project",{"Refresh": "3; url=/login"}
    else:
        if request.method == "GET":
            return render_template("upload_artwork.html")
        elif request.method == "POST":
            userdata = dict(request.form)
            name = userdata["name"]
            author = userdata["author"]
            url = userdata["url"]
            with open(PROJECTS_CSV_LOCATION, mode='r+') as csv_file:
                project_data = csv.writer(csv_file, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)

                data_r = csv.reader(csv_file, delimiter=CSV_DELIMITER)
                id_new_artwork = len(list(data_r)) #Último id + 1 (incluyendo el header)

                project_data.writerow([id_new_artwork, name, author, url])
                username_with_projectadded = add_project_to_user(id_new_artwork) # Añadir obra a usuario (autor y lector)
    return f"{name} saved in artwork.csv! Author and reader permissions given to user {username_with_projectadded}",{"Refresh": "4; url=/"} 

@app.route('/delete_artwork/<id>', methods={"GET", "POST"})
def delete_artwork(id):
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
            writer = csv.DictWriter(writeFile, delimiter=CSV_DELIMITER, fieldnames=['project_id', 'name', 'author', 'url'])
            writer.writeheader()
            writer.writerows(lines)
        
        username_with_projectdeleted = delete_project_from_user(id)
            
        return f"¡Se ha eliminado la obra con id {id} del usuario {username_with_projectdeleted} en el archivo artwork.csv!",{"Refresh": "3; url=/"} 


def add_project_to_user(id_new_artwork):
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

                row['id_projects_list_author'].append(f'{id_new_artwork}') #Añadir id_proyecto a lista
                row['id_projects_list_reader'].append(f'{id_new_artwork}')

                row['id_projects_list_author'] = ','.join(row['id_projects_list_author']) #Convertir lista en string
                row['id_projects_list_reader'] = ','.join(row['id_projects_list_reader'])

            users_dict.append(dict(row))
            #users_dict.append(row)  

    with open(USER_CSV_LOCATION, mode='w') as users_csv: #Abrimos de nuevo para sobreescribir el archivo
        users_data_w = csv.DictWriter(users_csv, delimiter=CSV_DELIMITER, fieldnames=['user_id', 'username', 'password', 'id_projects_list_author', 'id_projects_list_reader']) 
        users_data_w.writeheader()
        users_data_w.writerows(users_dict)
        
    return current_user.name

def delete_project_from_user(id_artwork):
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

                if (str(id_artwork) in row['id_projects_list_author']):
                    row['id_projects_list_author'].remove(str(id_artwork)) #Delete string project_id from list
                else:
                    print(f'There is no project_id number {id_artwork} associated as author permissions to user qw')

                if (str(id_artwork) in row['id_projects_list_reader']):
                    row['id_projects_list_reader'].remove(str(id_artwork))
                else:
                    print(f'There is no project_id number {id_artwork} associated as reader permissions to user qw')

                row['id_projects_list_author'] = ','.join(row['id_projects_list_author']) #Convertir lista en string
                row['id_projects_list_reader'] = ','.join(row['id_projects_list_reader'])

            users_dict.append(dict(row))

    with open(USER_CSV_LOCATION, mode='w') as users_csv: #Abrimos de nuevo para sobreescribir el archivo
        users_data_w = csv.DictWriter(users_csv, delimiter=CSV_DELIMITER, fieldnames=['user_id', 'username', 'password', 'id_projects_list_author', 'id_projects_list_reader']) 
        users_data_w.writeheader()
        users_data_w.writerows(users_dict)
        
    return current_user.name