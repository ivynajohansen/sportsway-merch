import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parents[1]))

from flask import Blueprint, render_template, request
from flask_wtf.csrf import generate_csrf

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/login', methods=['GET'])
def login():
    csrf_field = generate_csrf()
    return render_template('login.html', csrf_field=csrf_field)

@auth_blueprint.route('/login', methods=['POST'])
def loginAuth():
    from controllers.UsersController import authenticate_user
    json_data = request.get_json()
    return authenticate_user(json_data)