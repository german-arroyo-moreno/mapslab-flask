from flask import Flask
from flask import render_template   #Renderizar plantillas
from flask import request #peticiones
from flask import jsonify #convertir en formato json en Python
from flask import Response #poder devolver respuestas
from flask_login import LoginManager #manejo de sesiones de usuario
from flask import session #almacenar info de la sesión de un usuario
from models import users

import json

app = Flask(__name__)
login_manager = LoginManager()
login_manager.init_app(app)

# Set the secret key to some random bytes. Keep this really secret!
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'

#app.app_context().push()
#app.run(debug=True)
print(f'__name__ es: ', __name__)
print(app)

# if __name__ == "__main__": # No es __main__, es app!!
#     with app.app_context():
#         app.run(debug=True)

# Permitir multithreading en Flask
if __name__ == '__main__':
    app.run(threaded=True)

@app.route("/")
@login_manager.user_loader
def open_project(logged=False):
    logged = False if logged else True
    myusername = 'Manolito'

    obras = [
        {
            "nombre": "La transfiguración",
            "autor": "Rafael Sanzio", 
            "url": "images/transfiguracion.png"
        },
        {
            "nombre": "Niños comiendo uvas y melón",
            "autor": "Bartolomé Esteban Murillo",
            "url": "images/uvasmelon.jpg"
        },
        {
            "nombre": "La escuela de Atenas",
            "autor": "Rafael Sanzio",
            "url": "images/escuelaatenas.webp"
        }
    ]
    return render_template('open-create.html', logged=logged, myusername=myusername, obras=obras)

@app.route("/app")
def main_app():
    return render_template('main-app.html')

'''
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('open_project'))
    return <form method="post">
            <p><input type=text name=username>
            <p><input type=submit value=Login>
        </form>
'''

@app.route('/logout')
def logout():
    # remove the username from the session if it's there
    session.pop('username', None)
    return redirect(url_for('open_project'))

@login_manager.user_loader
def load_user(user_id):
    for user in users:
        if user.id == int(user_id):
            return user
    return None


from werkzeug.urls import url_parse

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = LoginForm()
    if form.validate_on_submit():
        user = get_user(form.email.data)
        if user is not None and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            next_page = request.args.get('next')
            if not next_page or url_parse(next_page).netloc != '':
                next_page = url_for('index')
            return redirect(next_page)
    return render_template('login_form.html', form=form)

@app.route("/signup/", methods=["GET", "POST"])
def show_signup_form():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    form = SignupForm()
    if form.validate_on_submit():
        name = form.name.data
        email = form.email.data
        password = form.password.data
        # Creamos el usuario y lo guardamos
        user = User(len(users) + 1, name, email, password)
        users.append(user)
        # Dejamos al usuario logueado
        login_user(user, remember=True)
        next_page = request.args.get('next', None)
        if not next_page or url_parse(next_page).netloc != '':
            next_page = url_for('index')
        return redirect(next_page)
    return render_template("signup_form.html", form=form)

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

# @app.route("/")
# @login_required
# def logged():
#     myname = 'Germán'
#     return render_template('open-create.html', myname)

