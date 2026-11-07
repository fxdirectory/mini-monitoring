from flask import Blueprint
from flask import request
from flask import jsonify
from services.auth_service import authenticate_user
from utils.jwt_helper import generate_token
from flask import current_app
from middleware.auth import login_required
import ipaddress
import os
from urllib.parse import urlsplit

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

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
    remote_addr = request.remote_addr
    try:
        is_local_request = ipaddress.ip_address(remote_addr).is_loopback
    except (TypeError, ValueError):
        is_local_request = False

    origin = request.headers.get("Origin")
    try:
        is_same_origin = (
            not origin
            or urlsplit(origin).netloc.casefold() == request.host.casefold()
        )
    except ValueError:
        is_same_origin = False

    windows_dev_login = (
        current_app.config.get("WINDOWS_DEV_LOGIN", False)
        and os.name == "nt"
        and is_local_request
        and is_same_origin
        and username == "test"
        and password == "1234"
    )
    if not windows_dev_login and not authenticate_user(username, password):
        return jsonify({
            "status": False,
            "message": "Aren't you"
        }), 401
    token = generate_token(username, current_app.config["SECRET_KEY"])
    return jsonify({
        "status": True,
        "username": username,
        "token": token
    })

@auth_bp.route("/me")
@login_required
def me():
    username = request.user["username"]
    if os.name == "nt":
        return jsonify({"username": username})

    import grp
    import pwd

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