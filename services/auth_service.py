import os

MONITOR_GROUP = "monitor-admin"

def authenticate_user(username, password):
    if os.name == "nt":
        return False

    import grp
    import pam
    import pwd

    p = pam.pam()
    if not p.authenticate(username, password):
        return False
    try:
        user = pwd.getpwnam(username)
        groups = []
        for g in grp.getgrall():
            if username in g.gr_mem:
                groups.append(g.gr_name)
        primary_group = grp.getgrgid(user.pw_gid).gr_name
        groups.append(primary_group)
        if MONITOR_GROUP not in groups:
            return False
        return True
    except Exception:
        return False