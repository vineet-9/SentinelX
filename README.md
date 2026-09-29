# SentinelX

> A web-based malware analysis platform built as a robust cybersecurity portfolio project.

SentinelX provides automated file scanning utilizing YARA rules, SHA-256 hash generation, VirusTotal enrichment, user authentication, scan history tracking, and comprehensive security auditing.

---

## 🚀 Features

* **Malware File Scanning:** Securely upload and analyze suspicious files.
* **YARA Detection:** Match uploaded samples against custom and standard YARA rulesets.
* **SHA-256 Hashing:** Instantly compute unique file hashes for quick lookups.
* **VirusTotal Integration:** Cross-reference file hashes with VirusTotal for threat intelligence.
* **Authentication & Authorization:** Secure user login with role-based access control (RBAC).
* **Scan History & Details:** Review past scan logs, audit events, and detailed analysis reports.
* **Dashboard Statistics:** High-level metrics and system usage overview.
* **Security Audit Logging:** Track administrative actions and system events.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend** | Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic |
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Security & Intel** | JSON Web Tokens (JWT), YARA, VirusTotal API |

---

## 📁 Project Structure

```text
SentinelX/
├── backend/            # FastAPI application & business logic
├── frontend/           # React, TypeScript, & Vite client
├── database/           # Database scripts & migrations
├── LICENSE             # Project license
└── README.md           # Project documentation
```

---

## ⚙️ Getting Started & Installation

Follow these steps to set up and run SentinelX locally for development and testing.

### 1. Clone the Repository

```bash
git clone https://github.com/vineet-9/SentinelX.git
cd SentinelX
```

### 2. Configure the Environment

Install and start PostgreSQL, then create a dedicated database for SentinelX. 

Next, copy the environment template:
```bash
cp backend/.env.example backend/.env
```
> [!NOTE]
> Open `backend/.env` and configure your database connection string, JWT secret key, and VirusTotal API key. **Do not commit your `.env` file to version control.**

---

### 3. Set Up the Backend

Open a terminal from the project root and run:

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
# source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start the FastAPI development server
uvicorn app.main:app --reload
```

* **API Base URL:** `http://127.0.0.1:8000`
* **Interactive Documentation:** `http://127.0.0.1:8000/docs`

---

### 4. Set Up the Frontend

Open a **second terminal** from the project root:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Create a frontend environment file
echo "VITE_API_BASE_URL=http://127.0.0.1:8000" > .env

# Start the Vite development server
npm run dev
```

Open the local development URL provided by Vite (typically `http://localhost:5173`).

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest -q
```

### Frontend Checks & Build
```bash
cd frontend
npm run lint
npm run build
```

---

## 🛡️ Security Implementation

SentinelX incorporates multiple layers of security best practices:
* **Authentication & RBAC:** Secure token-based access with protected admin endpoints.
* **Validation & Hashing:** Strict upload validation coupled with SHA-256 fingerprinting.
* **Audit Controls:** Comprehensive security audit logging for system tracking.
* **Network & Headers:** Configured CORS controls and security response headers.
* **Performance:** Intelligent caching layer for VirusTotal lookup results.

---

## 📄 License

Distributed under the terms specified in the [LICENSE](LICENSE) file.