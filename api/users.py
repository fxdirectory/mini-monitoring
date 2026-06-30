from flask import Blueprint, jsonify
from middleware.auth import login_required
from services.user_service import UserService

users_bp = Blueprint(
    "users",
    __name__,
    url_prefix="/api"
)

@users_bp.route("/users")
@login_required
def users():
    return jsonify(UserService.get_users())

@users_bp.route("/users/<username>")
@login_required
def user_detail(username):
    user = UserService.get_user(username)
    if user is None:
        return jsonify({
            "message": "User Not Found"
        })
    return jsonify(user)

@users_bp.route("/groups")
@login_required
def groups():
    return jsonify(
        UserService.get_groups()
    )

@users_bp.route("/groups/<name>")
@login_required
def group_detail(name):
    group = UserService.get_group(name)
    if group is None:
        return jsonify({
            "message": "Group Not Found"
        })
    return jsonify(group)