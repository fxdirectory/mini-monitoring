from flask import Blueprint
from flask import jsonify

health_bp = Blueprint(
    "health",
    __name__,
    url_prefix="/api"
)


@health_bp.route("/health")
def health():

    return jsonify({
        "status": "healthy"
    })