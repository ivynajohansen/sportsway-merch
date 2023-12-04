from flask import Flask, render_template, request
from flask_wtf.csrf import CSRFProtect
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = '7643627136296035'  # Replace with a strong secret key
csrf = CSRFProtect(app)

from routes.mfp import mfp_blueprint
app.register_blueprint(mfp_blueprint, url_prefix='/mfp')

class MyHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        print(f'Restarting due to change in: {event.src_path}')
        os.system('touch wsgi.py') 

if __name__ == '__main__':
    event_handler = MyHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    app.run(debug=True, port=8000, use_reloader=False, host='0.0.0.0')
