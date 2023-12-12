import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))

# display all data of Company Target
def get_data():
    from models.Reconciliation import Reconciliation
    try:
        data = Reconciliation.query.all()
        serialized_data = []
        for item in data:
            serialized_data.append({
                'ID': item.ID,
                'CHANNEL': item.CHANNEL,
                'PERIOD': item.PERIOD,
                'PROPORTION': item.PROPORTION,
                'MONTHLY_TARGET': item.MONTHLY_TARGET,
            })
        return jsonify(serialized_data)

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})