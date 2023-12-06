from flask import Blueprint, render_template

mfp_blueprint = Blueprint('mfp', __name__)

# MASIH PAKAI LAYOUT


@mfp_blueprint.route('/layout', methods=['GET'])
def layout():
    return render_template('layout.html')

@mfp_blueprint.route('/company-target', methods=['GET'])
def companyTarget():
    return render_template('mfp/company-target.html')

@mfp_blueprint.route('/rs-monthly-breakdown')
def rsMonthly():
    return render_template('layout.html')

@mfp_blueprint.route('/detailed-retail-planning')
def drp():
    return render_template('layout.html')


@mfp_blueprint.route('/reconciliation')
def reconciliation():
    return render_template('layout.html')


@mfp_blueprint.route('/adjust-mc-3')
def adjustMc3():
    return render_template('layout.html')

@mfp_blueprint.route('/details-breakdown')
def dsp():
    return render_template('layout.html')

# BACKEND

@mfp_blueprint.route('/get-target', methods=['GET'])
def getTarget():
    from controllers.TargetController import getData
    return getData()