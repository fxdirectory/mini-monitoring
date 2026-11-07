import subprocess

SYSTEMCTL = "/usr/bin/systemctl"

class ServiceManager:
    @staticmethod
    def get_services():
        command = [
            SYSTEMCTL,
            "list-unit-files",
            "--type=service",
            "--no-pager",
            "--no-legend",
            "--plain"
        ]

        result = subprocess.run(command, capture_output=True, text=True, check=False)

        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip())

        services = []
        for line in result.stdout.splitlines():
            parts = line.split()
            if len(parts) < 2:
                continue
            name = parts[0]
            enabled = parts[1]
            if not name.endswith(".service"):
                continue
            service_name = name[:-8]
            status = ServiceManager.get_status(name)
            services.append({
                "name": service_name,
                "unit": name,
                "status": status,
                "enabled": enabled
            })
        services.sort(key=lambda x: x["name"])
        return services

    @staticmethod
    def get_status(service):
        command = [SYSTEMCTL, "is-active", service]
        result = subprocess.run(command, capture_output=True, text=True, check=False)
        status = result.stdout.strip()
        match status:
            case "active":
                return "running"
            case "inactive":
                return "stopped"
            case "failed":
                return "failed"
            case "activating":
                return "starting"
            case "deactivating":
                return "stopping"
            case _:
                return status or "unknown"

    @staticmethod
    def start(service):
        return ServiceManager._execute("start", service)

    @staticmethod
    def stop(service):
        return ServiceManager._execute("stop", service)

    @staticmethod
    def restart(service):
        return ServiceManager._execute("restart", service)

    @staticmethod
    def _execute(action, service):
        allowed_actions = {
            "start",
            "stop",
            "restart"
        }
        if action not in allowed_actions:
            raise ValueError("Invalid service action")
        if not ServiceManager.is_valid_service(service):
            raise ValueError("Invalid service name")
        unit = service
        if not unit.endswith(".service"):
            unit += ".service"
        command = [SYSTEMCTL, action, unit]
        result = subprocess.run(command, capture_output=True, text=True, check=False)
        if result.returncode != 0:
            error = (result.stderr.strip() or f"Failed to {action} {service}")
            raise RuntimeError(error)
        return {
            "success": True,
            "action": action,
            "service": service
        }

    @staticmethod
    def is_valid_service(service):
        if not service:
            return False
        allowed = (
            "abcdefghijklmnopqrstuvwxyz"
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
            "0123456789"
            "._@:-"
        )
        return all(char in allowed for char in service)