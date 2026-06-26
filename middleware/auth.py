from functools import wraps

from flask import request
from flask import jsonify
from flask import current_app

from utils.jwt_helper import verify_token


def login_required(f):

    @wraps(f)
    def wrapper(*args, **kwargs):

        auth_header = request.headers.get(
            "Authorization"
        )

        if not auth_header:

            return jsonify({
                "message": "Unauthorized"
            }), 401

        try:

            token = auth_header.split(" ")[1]

        except Exception:

            return jsonify({
                "message": "Invalid Token"
            }), 401

        payload = verify_token(
            token,
            current_app.config["SECRET_KEY"]
        )

        if not payload:

            return jsonify({
                "message": "Invalid Token"
            }), 401

        request.user = payload

        return f(*args, **kwargs)

    return wrapper