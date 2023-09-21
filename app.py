from flask import Flask
#from markupsafe import escape   #Evitar ataques por inyección manualmente
from flask import render_template   #Renderizar plantillas

app = Flask(__name__)

@app.route("/")
def index():
    return render_template('mapslab-estructura.html')

@app.route("/<name>")
def hello(name):
    return f'Hello {escape(name)}'