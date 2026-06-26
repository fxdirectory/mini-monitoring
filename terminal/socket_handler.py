from flask import request
import threading
import grp
from terminal.terminal_manager import (
    get_session, remove_session
)
from utils.jwt_helper import (
    verify_token
)

connected_users = {}

def register_terminal_events(socketio, app):
    @socketio.on("connect")
    def connect(auth):
        try:
            token = auth.get("token")
            payload = verify_token(
                token,
                app.config["SECRET_KEY"]
            )

            if not payload:
                return False

            username = payload["username"]
            if not is_terminal_admin(username):
                print(
                    f"{username} "
                    f"is not monitor-admin"
                )
                return False
            
            connected_users[request.sid] = username

            print(f"Terminal connected: "f"{username}")
            return True

        except Exception as e:
            print(f"Connect error: {e}")
            return False
        
    @socketio.on("terminal_connect")
    def terminal_connect(data=None):
        username = connected_users.get(request.sid)
        if not username:
            return
        session = get_session(username)
        sid = request.sid

        def read_loop():
            while True:
                try:
                    output = (session.read())
                    socketio.emit(
                        "terminal_output",
                        output,
                        to=sid
                    )

                except Exception as e:
                    print("READ LOOP ERROR:", e)
                    break

        threading.Thread(
            target=read_loop,
            daemon=True
        ).start()

    @socketio.on("terminal_input")
    def terminal_input(data):
        username = connected_users.get(request.sid)
        print(f"Username : {username}")
        if not username:
            return
        
        session = get_session(username)
        print(f"Session : {session}")
        if session is None:
            print("Session is None")
            return

        session.write(data["input"])

    @socketio.on("disconnect")
    def disconnect():
        username = connected_users.pop(
            request.sid,
            None
        )
        if username:
            remove_session(username)
            print(f"Terminal disconnected: "f"{username}")
    
    @socketio.on("terminal_disconnect")
    def terminal_disconnect():
        username = connected_users.get(request.sid)
        if username:
            remove_session(username)

def is_terminal_admin(username):
    try:
        group = grp.getgrnam("monitor-admin")
        return (
            username
            in group.gr_mem
        )
    except Exception:
        return False