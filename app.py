import os
import platform

from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from dotenv import load_dotenv

from db import app

load_dotenv()

app.config['SECRET_KEY'] = os.getenv('CSRF_KEY')

#STILL ERROR
#csrf = CSRFProtect(app) 

CORS(app)

from routes.mfp import mfp_blueprint
from routes.auth import auth_blueprint

app.register_blueprint(mfp_blueprint, url_prefix='/mfp')
app.register_blueprint(auth_blueprint, url_prefix='/auth')

if __name__ == '__main__':
    app.run(debug=True, port=8000, use_reloader=False, host='0.0.0.0')
