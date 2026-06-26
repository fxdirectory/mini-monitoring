import pwd
import grp

def get_users():

    users = []

    for user in pwd.getpwall():

        users.append({
            "username": user.pw_name,
            "uid": user.pw_uid,
            "gid": user.pw_gid,
            "home": user.pw_dir,
            "shell": user.pw_shell
        })

    return users

def get_user(username):

    try:

        user = pwd.getpwnam(username)

        return {
            "username": user.pw_name,
            "uid": user.pw_uid,
            "gid": user.pw_gid,
            "home": user.pw_dir,
            "shell": user.pw_shell
        }

    except KeyError:
        return None
    
def get_groups():

    groups = []

    for group in grp.getgrall():

        groups.append({
            "name": group.gr_name,
            "gid": group.gr_gid,
            "members": group.gr_mem
        })

    return groups