import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash

from flask import jsonify, request, redirect, url_for

sys.path.append(str(Path(__file__).resolve().parents[1]))

# def authenticate_user(json_data):
#     from models.User import User
#     try:
#         USERNAME = json_data['USERNAME']
#         PASSWORD = json_data['PASSWORD']

#         user = User.query.filter_by(USERNAME=USERNAME).first()

#         if user:
#             if check_password_hash(user.PASSWORD, PASSWORD):
#                 return jsonify({"message": "Authentication successful"}), 200
#             else:
#                 return jsonify({"message": "Incorrect USERNAME or PASSWORD"}), 401
#         else:
#             return jsonify({"message": "User not found"}), 401
#     except Exception as e:
#         return jsonify({"message": f"Error: {str(e)}"}), 500
    
def authenticate_user():
    from models.User import User
    try:
        USERNAME = request.form['username']
        PASSWORD = request.form['password']

        user = User.query.filter_by(USERNAME=USERNAME).first()

        if user:
            if check_password_hash(user.PASSWORD, PASSWORD):
                return redirect(url_for('mfp.company_target'))
            else:
                error_message = 'Incorrect username or password'
                return redirect(url_for('auth.login', error_message=error_message))
        else:
            error_message = 'User not found'
            return redirect(url_for('auth.login', error_message=error_message))
    except Exception as e:
        error_message = f"Error: {str(e)}"
        return redirect(url_for('auth.login', error_message=error_message))