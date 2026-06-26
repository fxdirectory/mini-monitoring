import subprocess

ALLOWED_COMMANDS = {
    "uptime": ["uptime"],
    "df": ["df", "-h"],
    "free": ["free", "-m"],
    "ip": ["ip", "a"],
    "lsblk": ["lsblk"],
    "who": ["who"],
    "uname": ["uname", "-a"]
}

def execute_command(command):
    if command not in ALLOWED_COMMANDS:
        return {
            "success": False,
            "output": "Command not allowed"
        }
    try:
        result = subprocess.run(
            ALLOWED_COMMANDS[command],
            capture_output=True,
            text=True,
            timeout=10
        )
        return {
            "success": True,
            "output": result.stdout
        }
    except Exception as e:
        return {
            "success": False,
            "output": str(e)
        }