import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))

def authenticate_user(json_data):
    from models.user import User
    try:
        username = json_data['username']
        password = json_data['password']

        user = User.query.filter_by(username=username).first()

        if user:
            if check_password_hash(user.password, password):
                return jsonify({"message": "Authentication successful"}), 200
            else:
                return jsonify({"message": "Incorrect username or password"}), 401
        else:
            return jsonify({"message": "User not found"}), 401
    except Exception as e:
        return jsonify({"message": f"Error: {str(e)}"}), 500