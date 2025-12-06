#!/usr/bin/env python3
"""
Docker Services Status Monitor
Monitors all Docker containers and services for HingeCraft
"""

import os
import json
import subprocess
import logging
import requests
from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("docker-monitor")

# Service definitions from docker-compose.yml
SERVICES = {
    "postgres": {
        "name": "hingecraft_postgres",
        "port": 5432,
        "health_check": "http://localhost:5432",
        "type": "database"
    },
    "redis": {
        "name": "hingecraft_redis",
        "port": 6379,
        "health_check": "http://localhost:6379",
        "type": "cache"
    },
    "minio": {
        "name": "hingecraft_minio",
        "port": 9000,
        "console_port": 9001,
        "health_check": "http://localhost:9000/minio/health/live",
        "type": "storage"
    },
    "fastapi": {
        "name": "hingecraft_fastapi",
        "port": 8000,
        "health_check": "http://localhost:8000/health",
        "type": "api"
    },
    "worker": {
        "name": "hingecraft_worker",
        "port": None,
        "health_check": None,
        "type": "worker"
    },
    "scheduler": {
        "name": "hingecraft_scheduler",
        "port": None,
        "health_check": None,
        "type": "scheduler"
    },
    "ngrok": {
        "name": "hingecraft_ngrok",
        "port": 4040,
        "health_check": "http://localhost:4040/api/tunnels",
        "type": "tunnel"
    },
    "pgadmin": {
        "name": "hingecraft_pgadmin",
        "port": 5050,
        "health_check": "http://localhost:5050",
        "type": "admin"
    },
    "nginx": {
        "name": "hingecraft_nginx",
        "port": 80,
        "ssl_port": 443,
        "health_check": "http://localhost:80",
        "type": "proxy"
    }
}

def check_docker_running() -> bool:
    """Check if Docker daemon is running"""
    try:
        result = subprocess.run(
            ["docker", "info"],
            capture_output=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False

def get_container_status(container_name: str) -> Dict:
    """Get status of a specific container"""
    try:
        result = subprocess.run(
            ["docker", "ps", "-a", "--filter", f"name={container_name}", "--format", "{{.Status}}"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0 and result.stdout.strip():
            status_line = result.stdout.strip()
            if "Up" in status_line:
                return {"status": "running", "details": status_line}
            else:
                return {"status": "stopped", "details": status_line}
        return {"status": "not_found", "details": "Container not found"}
    except Exception as e:
        return {"status": "error", "details": str(e)}

def check_port_health(port: int, service_name: str) -> Dict:
    """Check if a port is responding"""
    try:
        if port:
            result = subprocess.run(
                ["nc", "-z", "localhost", str(port)],
                capture_output=True,
                timeout=2
            )
            return {"port_open": result.returncode == 0, "port": port}
    except Exception:
        pass
    
    # Try HTTP health check if available
    service_config = SERVICES.get(service_name, {})
    health_url = service_config.get("health_check")
    if health_url and health_url.startswith("http"):
        try:
            response = requests.get(health_url, timeout=5)
            return {
                "port_open": True,
                "http_status": response.status_code,
                "healthy": response.status_code == 200
            }
        except Exception as e:
            return {"port_open": False, "error": str(e)}
    
    return {"port_open": False}

def get_all_services_status() -> Dict:
    """Get status of all Docker services"""
    if not check_docker_running():
        return {
            "docker_running": False,
            "services": {},
            "timestamp": datetime.now().isoformat(),
            "error": "Docker daemon is not running"
        }
    
    services_status = {}
    
    for service_name, service_config in SERVICES.items():
        container_name = service_config["name"]
        container_status = get_container_status(container_name)
        port_status = check_port_health(service_config.get("port"), service_name)
        
        services_status[service_name] = {
            "container_name": container_name,
            "container_status": container_status["status"],
            "container_details": container_status.get("details", ""),
            "port": service_config.get("port"),
            "port_status": port_status,
            "type": service_config.get("type"),
            "healthy": container_status["status"] == "running" and port_status.get("port_open", False),
            "last_checked": datetime.now().isoformat()
        }
        
        # Add console port for MinIO
        if service_name == "minio" and service_config.get("console_port"):
            console_port_status = check_port_health(service_config["console_port"], service_name)
            services_status[service_name]["console_port"] = service_config["console_port"]
            services_status[service_name]["console_port_status"] = console_port_status
    
    return {
        "docker_running": True,
        "services": services_status,
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total": len(services_status),
            "running": sum(1 for s in services_status.values() if s["container_status"] == "running"),
            "stopped": sum(1 for s in services_status.values() if s["container_status"] == "stopped"),
            "healthy": sum(1 for s in services_status.values() if s.get("healthy", False))
        }
    }

def get_docker_compose_status() -> Dict:
    """Get status from docker-compose"""
    try:
        docker_compose_path = Path("../docker-compose.yml")
        if not docker_compose_path.exists():
            return {"error": "docker-compose.yml not found"}
        
        result = subprocess.run(
            ["docker-compose", "ps", "--format", "json"],
            cwd=docker_compose_path.parent,
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            containers = []
            for line in result.stdout.strip().split('\n'):
                if line:
                    try:
                        containers.append(json.loads(line))
                    except:
                        pass
            return {"containers": containers, "count": len(containers)}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    status = get_all_services_status()
    print(json.dumps(status, indent=2))

