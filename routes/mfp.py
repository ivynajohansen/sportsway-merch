from flask import Blueprint, render_template
from flask_wtf.csrf import generate_csrf

mfp_blueprint = Blueprint('mfp', __name__)

# MASIH PAKAI LAYOUT
csrf_field = generate_csrf()

@mfp_blueprint.route('/layout')
def layout():
    return render_template('layout.html', csrf_field=csrf_field)

@mfp_blueprint.route('/company-target')
def companyTarget():
    return render_template('layout.html', csrf_field=csrf_field)

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