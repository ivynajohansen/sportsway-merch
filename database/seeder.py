import sys
from pathlib import Path
import random

from faker import Faker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

sys.path.append(str(Path(__file__).resolve().parents[1]))
load_dotenv(Path(__file__).resolve().parents[1] / '.env')

from db import get_db, app

from models.User import User
from models.CompanyTarget import CompanyTarget
from sqlalchemy.exc import IntegrityError

fake = Faker()
db = get_db()

# seed users with random USERNAME
# PASSWORD follows USERNAME
# role is random: admin, superadmin, or staff
def seed_users(num_users):
    ROLES = ['admin', 'superadmin', 'staff']
    for _ in range(num_users):
        name = fake.user_name()
        role = random.choice(ROLES)
        user = User(
            USERNAME=name,
            PASSWORD=generate_password_hash(name),
            ROLE=role,
        )
        db.session.add(user)
        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# seed company target with specified data
def seed_company_target():
    data = [
        {'CHANNEL': 'WHOLESALE', 'PROPORTION': 20.03, 'TOTAL_SALES': 16051268189.022001},
        {'CHANNEL': 'RETAIL', 'PROPORTION': 66.08, 'TOTAL_SALES': 52953959157.792},
        {'CHANNEL': 'E-COMMERCE', 'PROPORTION': 13.89, 'TOTAL_SALES': 11130909393.186}
    ]
    for entry in data:
        target = CompanyTarget(
            CHANNEL=entry['CHANNEL'],
            TOTAL_SALES=entry['TOTAL_SALES'],
            PROPORTION=entry['PROPORTION']
        )

        db.session.add(target)

        try:
            db.session.commit()
        except IntegrityError:
            db.session.rollback()

# run this specific file to seed all tables. Comment some lines if not needed.
if __name__ == '__main__':
    with app.app_context():
        seed_users(3)
        seed_company_target()
