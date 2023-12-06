import os
import platform

from flask_wtf.csrf import CSRFProtect
from watchdog.observers import Observer #updates if code changes
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv

from routes.mfp import mfp_blueprint
from routes.auth import auth_blueprint

from db import app

load_dotenv()

# app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('CSRF_KEY')
csrf = CSRFProtect(app)

app.register_blueprint(mfp_blueprint, url_prefix='/mfp')
app.register_blueprint(auth_blueprint, url_prefix='/auth')

class ChangesHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        print(f'Restarting due to change in: {event.src_path}')
        if platform.system() == 'Windows':
            os.system('copy wsgi.py +,,')
        else:
            os.system('touch wsgi.py')

if __name__ == '__main__':
    event_handler = ChangesHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    app.run(debug=True, port=8000, use_reloader=False, host='0.0.0.0')
