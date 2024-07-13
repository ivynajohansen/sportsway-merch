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
        selected_mgh3 = get_all_mgh3_values()

    wholesale_query = db.session.query(
        DetailedSalesPlanWholesale.PERIOD.label('PERIOD'),
        DetailedSalesPlanWholesale.CHANNEL.label('channel_group'),
        func.sum(DetailedSalesPlanWholesale.MONTHLY_TARGET).label('total_monthly_target')
    ).filter(DetailedSalesPlanWholesale.MGH_3.in_(selected_mgh3)).group_by('PERIOD', 'channel_group')

    retail_query = db.session.query(
        DetailedSalesPlanRetail.PERIOD.label('PERIOD'),
        DetailedSalesPlanRetail.GROUP.label('channel_group'),
        func.sum(DetailedSalesPlanRetail.MONTHLY_TARGET).label('total_monthly_target')
    ).filter(DetailedSalesPlanRetail.MGH_3.in_(selected_mgh3)).group_by('PERIOD', 'channel_group')

    ecommerce_query = db.session.query(
        DetailedSalesPlanEcommerce.PERIOD.label('PERIOD'),
        DetailedSalesPlanEcommerce.CHANNEL.label('channel_group'),
        func.sum(DetailedSalesPlanEcommerce.MONTHLY_TARGET).label('total_monthly_target')
    ).filter(DetailedSalesPlanEcommerce.MGH_3.in_(selected_mgh3)).group_by('PERIOD', 'channel_group')

    combined_data_query = wholesale_query.union_all(retail_query).union_all(ecommerce_query).subquery('combined_data')

    # Use aliases for columns in the subquery
    final_query = db.session.query(
        combined_data_query.c.PERIOD,
        combined_data_query.c.channel_group,
        func.sum(combined_data_query.c.total_monthly_target).label('total_monthly_target')
    ).group_by('PERIOD', 'channel_group').order_by('PERIOD', 'channel_group')

    # Execute the query and fetch all results
    result = final_query.all()

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
