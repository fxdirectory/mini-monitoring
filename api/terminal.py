from flask import Blueprint, jsonify, request
from middleware.auth import login_required
from services.terminal_service import execute_command

terminal_bp = Blueprint(
    "terminal",
    __name__,
    url_prefix="/api"
)

@terminal_bp.route("/terminal", methods=["POST"])
@login_required
def terminal():
    data = request.get_json()
    command = data.get(
        "command",
        ""
    )
    return jsonify(
        execute_command(command)
    )