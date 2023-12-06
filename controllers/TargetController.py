import sys
from pathlib import Path

from sqlalchemy.exc import IntegrityError

from flask import jsonify

sys.path.append(str(Path(__file__).resolve().parents[1]))

def getData():
    from models.companyTarget import CompanyTarget
    try:
        data = CompanyTarget.query.all()
        serialized_data = []
        for item in data:
            serialized_data.append({
                'id': item.id,
                'channel': item.channel,
                'total_sales': item.total_sales,
                'proportion': item.proportion,
            })
        return jsonify(serialized_data)

    except IntegrityError as e:
        return jsonify({'error': 'IntegrityError', 'message': str(e)})

    except Exception as e:
        return jsonify({'error': 'Error', 'message': str(e)})