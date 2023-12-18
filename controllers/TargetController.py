import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))
from models.CompanyTarget import CompanyTarget

# display all data of Company Target
def get_data():

    try:
        data = CompanyTarget.query.all()
        serialized_data = []
        for item in data:
            serialized_data.append({
                'ID': item.ID,
                'CHANNEL': item.CHANNEL,
                'TOTAL_SALES': item.TOTAL_SALES,
                'PROPORTION': item.PROPORTION,
            })
        return jsonify(serialized_data)

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})
    
def update_data(json_data):
    from db import get_db
    db = get_db()
    try:
        for entry in json_data:
            id = entry.get('ID')
            channel = entry.get('CHANNEL')
            proportion = entry.get('PROPORTION')
            total_sales = entry.get('TOTAL_SALES')

            # Use the update method with the returning clause
            db.session.query(CompanyTarget).filter_by(ID=id).\
                update({'CHANNEL': channel, 'PROPORTION': proportion, 'TOTAL_SALES': total_sales})

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'Data updated successfully'})

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})