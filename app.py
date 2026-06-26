import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS

from api.auth import auth_bp
from api.health import health_bp
from api.metrics import metrics_bp
from api.hardware import hardware_bp
from api.users import users_bp
from api.terminal import terminal_bp

from flask_socketio import SocketIO
from flask import render_template

from terminal.socket_handler import register_terminal_events

def create_app():

    app = Flask(__name__)

    app.config.from_object("config.Config")

    CORS(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(metrics_bp)
    app.register_blueprint(hardware_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(terminal_bp)
    app.register_blueprint(health_bp)

    return app

app = create_app()

socketio = SocketIO(
    app,
    cors_allowed_origins="*"
)

from terminal.socket_handler import (
    register_terminal_events
)

register_terminal_events(
    socketio,
    app
)

@app.route("/")
def login_page():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/hardware")
def hardware_page():
    return render_template("hardware.html")

@app.route("/users")
def users_page():
    return render_template("users.html")

@app.route("/terminal")
def terminal_page():
    return render_template("terminal.html")

if __name__ == "__main__":
    socketio.run(
        app,
        host="0.0.0.0",
        port=5000,
        debug=True
    )