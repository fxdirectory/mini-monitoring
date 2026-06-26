from flask import Blueprint, jsonify
from middleware.auth import login_required
from services.user_service import (
    get_users,
    get_groups
)

users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api"
)

@users_bp.route("/users")
@login_required
def users():
    return jsonify(get_users())

@users_bp.route("/groups")
@login_required
def groups():
    return jsonify(
        get_groups()
    )