import  subprocess

def run_command(command):

    try:

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )

        return result.stdout.strip()

    except Exception:
        return None
    
def read_file(path):

    try:

        with open(path, "r") as f:
            return f.read().strip()

    except Exception:
        return ""

def bytes_to_gb(value):

    return round(
        value / (1024 ** 3),
        2
    )