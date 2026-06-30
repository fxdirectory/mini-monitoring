import os
import socket
import platform
import psutil
import json

from utils.helpers import (
    run_command,
    read_file
)

def get_system_info():
    return {
        "hostname": socket.gethostname(),
        "os": platform.platform(),
        "kernel": platform.release(),
        "architecture": platform.machine()
    }

def get_cpu_info():
    output = run_command(["lscpu"])
    cpu = {
        "model": "",
        "cores": psutil.cpu_count(logical=False),
        "threads": psutil.cpu_count(logical=True)
    }
    if output:
        for line in output.splitlines():
            if "Model name:" in line:
                cpu["model"] = (line.split(":")[1].strip())
    return cpu

def get_memory_info():
    vm = psutil.virtual_memory()
    return {
        "total_gb": round(vm.total / (1024**3),2)
    }

def get_board_info():
    return {
        "manufacturer": read_file("/sys/class/dmi/id/board_vendor"),
        "product": read_file("/sys/class/dmi/id/board_name"),
        "bios_vendor": read_file("/sys/class/dmi/id/bios_vendor"),
        "bios_version": read_file("/sys/class/dmi/id/bios_version")
    }

def get_storage_info():
    output = run_command([
        "lsblk",
        "-J",
        "-o",
        "NAME,SIZE,TYPE,MODEL"
    ])

    if not output:
        return []

    data = json.loads(output)
    disks = []
    for device in data["blockdevices"]:
        if device["type"] == "disk":
            disks.append({
                "name": device["name"],
                "size": device["size"],
                "model": device.get("model","")
            })
    return disks

def get_network_info():
    interfaces = []
    stats = psutil.net_if_addrs()
    for name, addrs in stats.items():
        ipv4 = None
        for addr in addrs:
            if addr.family == 2:
                ipv4 = addr.address
        interfaces.append({
            "name": name,
            "ipv4": ipv4
        })
    return interfaces

def get_hardware_info():
    return {
        "system"    : get_system_info(),
        "cpu"       : get_cpu_info(),
        "memory"    : get_memory_info(),
        "board"     : get_board_info(),
        "storage"   : get_storage_info(),
        "network"   : get_network_info()
    }