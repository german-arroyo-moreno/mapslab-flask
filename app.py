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

CSV_DELIMITER = ';'

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
                projects_to_show = user["id_projects_list_reader"] #Se almacenan los projectos que puede leer el usuario autenticado

    with open('./static/data/artwork.csv') as artwork_csv:
        artwork_data = csv.DictReader(artwork_csv, delimiter=CSV_DELIMITER)
        artwork = []

        for row in artwork_data:
            if row['project_id'] in projects_to_show: #Si el proyecto es uno que puede leer el usuario... que sea visible
                artwork.append({
                    "nombre": row['name'],
                    "autor": row['author'],
                    "url": row['url']
                })
        print("Artwork", artwork)
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
    with open('./static/data/users.csv') as users_csv:
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

        with open("./static/data/users.csv", mode='r+') as users_csv:
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
                users_data_w.writerow([rownumbers, name, password, 0, 0]) # Grabamos datos de nuevo usuario en csv
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
            with open('./static/data/artwork.csv', mode='r+') as csv_file:
                data = csv.writer(csv_file, delimiter=CSV_DELIMITER, quotechar='"', quoting=csv.QUOTE_MINIMAL)

                data_r = csv.reader(csv_file, delimiter=CSV_DELIMITER)
                id_new_artwork = len(list(data_r)) #Último id + 1 (incluyendo el header)

                data.writerow([id_new_artwork, name, author, url])
                username_with_projectadded = add_project_to_user(id_new_artwork) # Añadir obra a usuario (autor y lector)
    return f"{name} saved in artwork.csv! Author and reader permissions given to user {username_with_projectadded}",{"Refresh": "2; url=/"} 

@app.route('/delete_artwork', methods={"GET", "POST"})
def delete_artwork():
    lines = list()
    with open('./static/data/artwork.csv', 'r') as readFile:
        reader = csv.reader(readFile)
        for row in reader:
            lines.append(row)
        lines.pop()

    with open('./static/data/artwork.csv', 'w') as writeFile:
        writer = csv.writer(writeFile)
        writer.writerows(lines)
        
    return f"¡Se ha eliminado la última obra del archivo artwork.csv!",{"Refresh": "3; url=/"} 


def add_project_to_user(id_new_artwork):
    with open("./static/data/users.csv", mode='r+') as users_csv:
        users_data_r = csv.DictReader(users_csv, delimiter=CSV_DELIMITER)
        users_dict = [] #dict(users_data_r)

        for row in users_data_r:
            print('Antes de la edición', row['id_projects_list_author'])

            temp_author_row = row['id_projects_list_author']
            row['id_projects_list_author'] = temp_author_row.split(",") #Convertir elemento concreto en lista dentro de obj diccionario

            temp_reader_row = row['id_projects_list_reader']
            row['id_projects_list_reader'] = temp_reader_row.split(",")

            if row['username'] == 'mk':  #current_user.name
                row['id_projects_list_author'].append(f'{id_new_artwork}')
                row['id_projects_list_reader'].append(f'{id_new_artwork}')

            print('DesPUÉS de la edición', row['id_projects_list_author'])

            users_dict.append(dict(row))
            #users_dict.append(row)
        print('Dictionario', users_dict)  

        users_data_w = csv.DictWriter(users_csv, delimiter=CSV_DELIMITER, fieldnames=['user_id', 'username', 'password', 'id_projects_list_author', 'id_projects_list_reader']) 
        users_data_w.writerows(users_dict)
        
        #users_data_w = csv.writer(users_csv, delimiter=CSV_DELIMITER)
        #users_data_w.writerows(users_dict)

        # for row in users_data_r:
        #     if row_number_w == row_number:
        #         users_data_w[row][3].append(id_new_artwork) #Se añade el id del proyecto al usuario autenticado como autor
        #         users_data_w[row][4].append(id_new_artwork) #Se añade el id del proyecto al usuario autenticado como lector
        #     row_number_w += 1
        
        #Algo habrá que hacer para jugar con el row iterando en el writer, el cual no permite iterar (mirar función delete_artwork)
        return 'mk' #current_user.name

add_project_to_user(4)