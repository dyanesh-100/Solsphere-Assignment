import platform
import psutil
import os
import datetime
import socket
import subprocess
import json
import time
import requests
import comtypes.client

API_URL = "https://solsphere-assignment-backend.vercel.app/api/system-info"   
CHECK_INTERVAL = 30  

def get_machine_id():
    """Generate a unique machine id (hostname + processor)."""
    return f"{socket.gethostname()}_{platform.processor()}"

def get_os_info():
    return {
        "os": platform.system(),
        "os_version": platform.version(),
        "os_release": platform.release()
    }

def check_disk_encryption():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output("manage-bde -status", shell=True).decode()
            return "Percentage Encrypted" in output

        elif system == "Darwin":  
            output = subprocess.check_output("fdesetup status", shell=True).decode().lower()
            return "on" in output

        elif system == "Linux":
            output = subprocess.check_output("lsblk -o NAME,TYPE,MOUNTPOINT | grep crypt", shell=True).decode()
            return bool(output.strip())
    except:
        return False
    return False

def check_antivirus():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output(
                'powershell "Get-MpComputerStatus | Select-Object -Property AMServiceEnabled"',
                shell=True
            ).decode().lower()
            return "true" in output

        elif system == "Darwin":
            return True  

        elif system == "Linux":
            subprocess.check_output("which clamscan", shell=True)
            return True
    except:
        return False
    return False



def check_os_updates():
    os_type = platform.system()

    if os_type == "Linux":
        try:
            result = subprocess.run(
                ["apt", "list", "--upgradeable"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
            return result.stdout if result.stdout else "System is up-to-date"
        except Exception as e:
            return f"Error checking Linux updates: {e}"

    elif os_type == "Darwin":  
        try:
            result = subprocess.run(
                ["softwareupdate", "-l"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                check=True
            )
            return result.stdout if result.stdout else "System is up-to-date"
        except Exception as e:
            return f"Error checking macOS updates: {e}"

    elif os_type == "Windows":
        try:
            update_session = comtypes.client.CreateObject("Microsoft.Update.Session")
            update_searcher = update_session.CreateUpdateSearcher()
            search_result = update_searcher.Search("IsInstalled=0 and Type='Software'")

            if search_result.Updates.Count == 0:
                return "No pending Windows updates."
            
            updates = []
            for i in range(min(5, search_result.Updates.Count)):
                update = search_result.Updates.Item(i)
                updates.append(update.Title)

            return "\n".join(updates)

        except Exception as e:
            return f"Error checking Windows updates: {e}"

    else:
        return "OS not supported for update check"


def check_sleep_settings():
    system = platform.system()
    try:
        if system == "Windows":
            output = subprocess.check_output(
                'powercfg /QUERY SCHEME_CURRENT SUB_SLEEP STANDBYIDLE',
                shell=True
            ).decode().lower()
            return "0x00000000" not in output

        elif system == "Darwin":
            output = subprocess.check_output("pmset -g | grep sleep", shell=True).decode()
            return "sleep 0" not in output

        elif system == "Linux":
            output = subprocess.check_output("systemctl is-enabled sleep.target", shell=True).decode().strip()
            return output == "enabled"
    except:
        return False
    return False

def get_system_stats():
    return {
        "cpu_percent": psutil.cpu_percent(interval=1),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }

def collect_system_info():
    return {
        "machine_id": get_machine_id(),
        **get_os_info(),
        "disk_encryption": check_disk_encryption(),
        "os_update": check_os_updates(),
        "antivirus": check_antivirus(),
        "sleep_setting_ok": check_sleep_settings(),
        "system_stats": get_system_stats(),
        "last_check": datetime.datetime.utcnow().isoformat()
    }

def send_report(report):
    try:
        response = requests.post(API_URL, json=report, timeout=5)
        if response.status_code == 200:
            print(f"[OK] Report sent at {report['last_check']}")
        else:
            print(f"[ERROR] Server responded {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to send report: {e}")

def main():
    print("🚀 System Utility started. Checking every", CHECK_INTERVAL, "seconds...")
    last_report = None

    while True:
        report = collect_system_info()

        if report != last_report:  
            print(json.dumps(report, indent=2))
            send_report(report)
            last_report = report
        else:
            print(f"[INFO] No changes detected at {report['last_check']}")

        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
