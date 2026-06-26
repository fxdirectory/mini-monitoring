import os
import pty
import pwd

class TerminalSession:
    
    def __init__(self, username):
        self.username = username
        self.fd = None
        self.create_shell()

    def create_shell(self):
        pid, fd = pty.fork()
        if pid == 0:
            try:
                user = pwd.getpwnam(self.username)
                os.setgid(user.pw_gid)
                os.setuid(user.pw_uid)
                os.chdir(user.pw_dir)
                os.environ["HOME"] = (user.pw_dir)
                os.environ["USER"] = (self.username)
                os.environ["SHELL"] = (user.pw_shell)
                os.environ["PATH"] = (
                    "/usr/local/sbin:"
                    "/usr/local/bin:"
                    "/usr/sbin:"
                    "/usr/bin:"
                    "/sbin:"
                    "/bin"
                )
                os.execv(
                    user.pw_shell,
                    [user.pw_shell, "-l"]
                )
            except Exception as e:
                print(f"Terminal error: {e}")
                os._exit(1)
        self.fd = fd
        self.pid = pid

    def write(self, data):
        os.write(
            self.fd,
            data.encode()
        )

    def read(self):
        return os.read(
            self.fd,
            1024
        ).decode(
            errors="ignore"
        )
    
    def close(self):
        try:
            os.close(self.fd)
        except Exception:
            pass
        try:
            os.kill(self.pid,9)
        except Exception:
            pass
    
sessions = {}
def get_session(username):
    if username not in sessions:
        sessions[username] = TerminalSession(username)
    return sessions[username]
    
def remove_session(username):
    if username in sessions:
        sessions[username].close()
        del sessions[username]