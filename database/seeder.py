import sys
from pathlib import Path

from faker import Faker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

from db import db, app

from models.user import User

fake = Faker()

def seed_users(num_users):
    for _ in range(num_users):
        name = fake.user_name()
        user = User(
            username=name,
            # password=generate_password_hash(fake.password(special_chars=False, digits=True, upper_case=True, lower_case=True)),
            password=generate_password_hash(name),
        )
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

if __name__ == '__main__':
    with app.app_context():
        seed_users(3)
