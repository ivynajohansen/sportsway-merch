import sys
from pathlib import Path

from flask_migrate import Migrate
from dotenv import load_dotenv

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

from db import app, db
migrate = Migrate(app, db)

# importing models to be migrated
from models.User import User
from models.CompanyTarget import CompanyTarget

# run this specific file to migrate all models imported above
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
