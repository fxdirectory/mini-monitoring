from flask import Blueprint, jsonify
from middleware.auth import login_required
from services.hardware_service import get_hardware_info

hardware_bp = Blueprint("hardware", __name__, url_prefix="/api")

@hardware_bp.route("/hardware")
@login_required
def hardware():
    return jsonify(get_hardware_info())