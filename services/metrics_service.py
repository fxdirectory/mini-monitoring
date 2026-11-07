import psutil
import time
import os
from utils.helpers import (bytes_to_gb)

_last_net = None
_last_time = None

def get_network_speed():
    global _last_net
    global _last_time
    current = psutil.net_io_counters()
    current_time = time.time()
    if _last_net is None:
        _last_net = current
        _last_time = current_time
        return {
            "rx_kbps": 0,
            "tx_kbps": 0
        }
    seconds = current_time - _last_time
    rx = (current.bytes_recv - _last_net.bytes_recv) / seconds
    tx = (current.bytes_sent - _last_net.bytes_sent) / seconds

    _last_net = current
    _last_time = current_time

    return {
        "rx_kbps": round(rx / 1024, 2),
        "tx_kbps": round(tx / 1024, 2)
    }

def get_metrics():
    vm = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()
    boot_time = psutil.boot_time()
    load1, load5, load15 = os.getloadavg()
    uptime_seconds = int(time.time() - boot_time)

    return {
        "cpu": {
            "usage_percent": psutil.cpu_percent(interval=1),
            "cores_physical": psutil.cpu_count(logical=False),
            "cores_logical": psutil.cpu_count()
        },

        "memory": {
            "total": bytes_to_gb(vm.total),
            "used": bytes_to_gb(vm.used),
            "available": bytes_to_gb(vm.available),
            "percent": vm.percent
        },

        "disk": {
            "total": bytes_to_gb(disk.total),
            "used": bytes_to_gb(disk.used),
            "free": bytes_to_gb(disk.free),
            "percent": disk.percent
        },

        "network": get_network_speed(),

        "load": {
            "1m": load1,
            "5m": load5,
            "15m": load15
        },
        
        "uptime": {
            "seconds": uptime_seconds
        }
    }