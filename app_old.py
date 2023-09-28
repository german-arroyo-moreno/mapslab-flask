from flask import Flask
from flask import render_template   #Renderizar plantillas

app = Flask(__name__)
#app.app_context().push()
#app.run(debug=True)
print(f'__name__ es: ', __name__)
print(app)

# if __name__ == "__main__": # No es __main__, es app!!
#     with app.app_context():
#         app.run(debug=True)

@app.route("/")
def open_project(logged=False):
    logged = False if logged else True
    myusername = 'Germán'
    obras = [
        {
            "nombre": "La transfiguración",
            "autor": "Rafael" 
        },
        {
            "nombre": "Niños comiendo uvas y melón",
            "autor": "Murillo"
        }
    ]
    return render_template('open-create.html', myusername, logged, obras)

@app.route("/app")
def app():
    return render_template('main-app.html')

# @app.route("/")
# @login_required
# def logged():
#     myname = 'Germán'
#     return render_template('open-create.html', myname)
