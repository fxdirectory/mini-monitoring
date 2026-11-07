from flask import Blueprint, jsonify, request
from services.task_manager import ServiceManager

services_bp = Blueprint("services", __name__, url_prefix="/api/services")

@services_bp.get("")
def get_services():
    try:
        services = ServiceManager.get_services()
        return jsonify({"success": True, "data": services})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@services_bp.post("/<service>/start")
def start_service(service):
    try:
        result = ServiceManager.start(service)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@services_bp.post("/<service>/stop")
def stop_service(service):
    try:
        result = ServiceManager.stop(service)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False,"message": str(e)}), 500

@services_bp.post("/<service>/restart")
def restart_service(service):
    try:
        result = ServiceManager.restart(service)
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500