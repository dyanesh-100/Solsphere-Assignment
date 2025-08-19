# System Utility Monitoring Dashboard

## 📌 Overview

This project monitors system health metrics and provides a real-time dashboard for visualization.
It consists of three components:

* **System Utility (Python)** – Collects system information and sends it to the backend.
* **Backend (Node.js + Express + MongoDB)** – Stores and serves system reports via REST APIs.
* **Frontend (React.js)** – Displays reports on a dashboard.

Reports are sent from the Python utility every 30 seconds. They are reflected in the frontend within a minute.

---

## 📂 Project Structure

```
your-repo/
│── system-utility/    # Python script + requirements.txt
│── system-utility-backend/           # Express.js backend
│── system-utility-frontend/          # React.js frontend
│── README.md
```

---

## 🚀 Live URLs

* **Frontend:** [https://solsphere-assignment-frontend.vercel.app/]()
* **Backend API:** [https://solsphere-assignment-backend.vercel.app/]()


---

## ⚡ Running the System Utility (Python)

The backend and frontend are already hosted.
You only need to run the Python system utility locally.

### 1. Navigate to the directory

```bash
cd system-utility
```

### 2. Create & activate a virtual environment

```bash
# Create venv
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/macOS)
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the utility

```bash
python utility.py
```

The script will:

* Print a JSON report in the console every 30 seconds
* Send the report to the backend API
* Reports appear in the frontend dashboard within \~1 minute

---

## 🖥️ Frontend (React)

* Hosted separately (no need to run locally)
* Displays **latest report** and **last 24 hours history**

---

## ⚙️ Backend (Express + MongoDB)

* Hosted separately (no need to run locally)
* REST API Endpoints:

  * `GET /api/system-info/latest` → Latest system report
  * `GET /api/system-info/history` → Reports from the last 24 hours
  * `POST /api/system-info` → Accepts system reports from Python script

---

## 📡 Data Flow

```
Python Utility (system-utility/utility.py)
        |
        v
Backend API (Express + MongoDB)
        |
        v
Frontend Dashboard (React)
```

---

## 🛠️ Tech Stack

* **Python 3** (psutil, requests, subprocess, comtypes)
* **Node.js + Express**
* **MongoDB (Mongoose)**
* **React.js**

---

