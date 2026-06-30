import pwd
import grp

class UserService:
    def get_users():
        users = []
        for user in pwd.getpwall():
            # Skip system users (<1000) kecuali root
            if user.pw_uid < 1000 and user.pw_name != "root":
                continue
            
            groups = []
            for group in grp.getgrall():
                if user.pw_name in group.gr_mem:
                    groups.append(group.gr_name)
                elif group.gr_gid == user.pw_gid:
                    if group.gr_name not in groups:
                        groups.append(group.gr_name)
            users.append({
                "uid": user.pw_uid,
                "gid": user.pw_gid,
                "username": user.pw_name,
                "home": user.pw_dir,
                "shell": user.pw_shell,
                "groups": groups
            })
        users.sort(key=lambda x: x["uid"])
        return users

    def get_user(username):
        try:
            user = pwd.getpwnam(username)
            groups = []
            for group in grp.getgrall():
                if user.pw_name in group.gr_mem:
                    groups.append(group.gr_name)
                elif group.gr_gid == user.pw_gid:
                    if group.gr_name not in groups:
                        groups.append(group.gr_name)
            return {
                "uid": user.pw_uid,
                "gid": user.pw_gid,
                "username": user.pw_name,
                "home": user.pw_dir,
                "shell": user.pw_shell,
                "groups": groups
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
        groups.sort(key=lambda x: x["gid"])
        return groups

    def get_group(name):
        try:
            group = grp.getgrnam(name)
            return {
                "gid": group.gr_gid,
                "name": group.gr_name,
                "members": group.gr_mem}
        except KeyError:
            return None