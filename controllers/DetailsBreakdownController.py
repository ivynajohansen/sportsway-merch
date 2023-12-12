import sys
from pathlib import Path
from sqlalchemy import func, case
from flask import request, jsonify, json

sys.path.append(str(Path(__file__).resolve().parents[1]))

from db import get_db

def get_data():
    db = get_db()
    db.metadata.clear()
    from models.DetailedSalesPlan import get_detailed_sales_plan_classes
    DetailedSalesPlanWholesale, DetailedSalesPlanRetail, DetailedSalesPlanEcommerce = get_detailed_sales_plan_classes()

    filter_array = request.args.get('filter', '[]')
    selected_mgh3 = json.loads(filter_array)

    if not selected_mgh3:
        all_mgh3_values = get_all_mgh3_values()
        selected_mgh3 = all_mgh3_values

    combined_data = (
        db.session.query(
            func.coalesce(
                DetailedSalesPlanWholesale.PERIOD,
                DetailedSalesPlanEcommerce.PERIOD,
                DetailedSalesPlanRetail.PERIOD
            ).label('PERIOD'),
            case(
                (DetailedSalesPlanWholesale.CHANNEL.isnot(None), DetailedSalesPlanWholesale.CHANNEL),
                (DetailedSalesPlanRetail.GROUP.isnot(None), DetailedSalesPlanRetail.GROUP),
                else_=None
            ).label('channel_group'),
            func.sum(DetailedSalesPlanWholesale.MONTHLY_TARGET).label('total_monthly_target'),
        )
        .filter(DetailedSalesPlanWholesale.MGH_3.in_(selected_mgh3))
        .group_by('PERIOD', 'channel_group')
        .union_all(
            db.session.query(
                DetailedSalesPlanEcommerce.PERIOD.label('PERIOD'),
                case(
                    (DetailedSalesPlanEcommerce.CHANNEL.isnot(None), DetailedSalesPlanEcommerce.CHANNEL),
                    (DetailedSalesPlanRetail.GROUP.isnot(None), DetailedSalesPlanRetail.GROUP),
                    else_=None
                ).label('channel_group'),
                func.sum(DetailedSalesPlanEcommerce.MONTHLY_TARGET).label('total_monthly_target'),
            )
            .filter(DetailedSalesPlanEcommerce.MGH_3.in_(selected_mgh3))
            .group_by('PERIOD', 'channel_group')
        )
        .union_all(
            db.session.query(
                DetailedSalesPlanRetail.PERIOD.label('PERIOD'),
                case(
                    (DetailedSalesPlanRetail.GROUP.isnot(None), DetailedSalesPlanRetail.GROUP),
                    else_=None
                ).label('channel_group'),
                func.sum(DetailedSalesPlanRetail.MONTHLY_TARGET).label('total_monthly_target'),
            )
            .filter(DetailedSalesPlanRetail.MGH_3.in_(selected_mgh3))
            .group_by('PERIOD', 'channel_group')
        )
    ).subquery('combined_data')

    # Use aliases for columns in the subquery
    combined_data_query = db.session.query(
        combined_data.c[0].label('PERIOD'),
        combined_data.c[1].label('channel_group'),
        func.sum(combined_data.c[2]).label('total_monthly_target')
    ).group_by('PERIOD', 'channel_group').order_by('PERIOD', 'channel_group')

    # Execute the query and fetch all results
    result = combined_data_query.all()

    # Convert the result to a list of dictionaries
    result_dict_list = [
        {
            'PERIOD': str(row.PERIOD),
            'channel_group': str(row.channel_group),
            'total_monthly_target': str(row.total_monthly_target)
        }
        for row in result
    ]

    return jsonify(result_dict_list)

def get_all_mgh3_values():
    return ['APPAREL', 'BAGS', 'FOOTWEAR', 'HEADWEAR']
