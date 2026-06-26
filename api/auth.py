from flask import Blueprint
from flask import request
from flask import jsonify
from services.auth_service import authenticate_user
from utils.jwt_helper import generate_token
from flask import current_app
from middleware.auth import login_required
import pwd
import grp

auth_bp = Blueprint(
    "auth",
    __name__,
    url_prefix="/api"
)


@auth_bp.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if not username or not password:

        return jsonify({
            "status": False,
            "message": "Username dan password wajib diisi"
        }), 400

    if not authenticate_user(
        username,
        password
    ):

        return jsonify({
            "status": False,
            "message": "Login gagal"
        }), 401

    token = generate_token(
        username,
        current_app.config["SECRET_KEY"]
    )

    return jsonify({
        "status": True,
        "username": username,
        "token": token
    })

@auth_bp.route("/me")
@login_required
def me():
    username = request.user["username"]
    user = pwd.getpwnam(username)
    groups = []
    for g in grp.getgrall():
        if username in g.gr_mem:
            groups.append(g.gr_name)

    return jsonify({
        "username": username,
        "uid": user.pw_uid,
        "home": user.pw_dir,
        "shell": user.pw_shell,
        "groups": groups
    })

@auth_bp.route("/logout", methods=["POST"])
def logout():

    return jsonify({
        "status": True
    })