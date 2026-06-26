from flask import Blueprint, jsonify
from middleware.auth import login_required
from middleware.auth import login_required
from services.metrics_service import (
    get_metrics
)

metrics_bp = Blueprint(
    "metrics",
    __name__,
    url_prefix="/api"
)

@metrics_bp.route("/metrics")
@login_required
def metrics():
    return jsonify(get_metrics())