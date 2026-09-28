<div align="center">

# SentinelX

### Malware Analysis & Threat Intelligence Platform

A security-focused web platform for analyzing uploaded files, detecting malware with YARA, enriching results with VirusTotal, and maintaining an auditable scan history.

![Python](https://img.shields.io/badge/Python-3.13-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116+-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-336791?style=for-the-badge&logo=postgresql)
![YARA](https://img.shields.io/badge/YARA-Malware%20Detection-8A2BE2?style=for-the-badge)

</div>

---

## Overview

SentinelX is a production-oriented malware analysis platform built to demonstrate secure backend engineering, malware detection workflows, threat intelligence enrichment, authentication, authorization, auditability, and a modern security-focused frontend.

Users can upload files for analysis and receive a consolidated result containing:

- SHA-256 file identification
- YARA rule detection
- Malware classification
- VirusTotal hash intelligence
- Scan status and timestamps
- Persistent scan history
- Detailed scan results

The platform also provides role-based administrative access and security audit logging.

---

## Core Capabilities

### Malware Analysis

- Secure file upload
- Configurable maximum upload size
- Empty-file rejection
- Filename sanitization
- SHA-256 hashing
- Persistent scan records
- YARA-based malware detection
- Detection rule reporting
- Scan status tracking
- Duplicate file detection

### VirusTotal Intelligence

- SHA-256 based VirusTotal lookup
- Persisted VirusTotal results
- Detection statistics
- Reputation information
- Last analysis timestamp
- Cached results to reduce unnecessary external lookups
- Graceful handling of VirusTotal failures

### Authentication & Authorization

- JWT-based authentication
- Secure password hashing
- User registration
- Login/logout flow
- Protected application routes
- Current-user endpoint
- Role-based access control
- Superuser-only security audit access
- Cross-user scan isolation

### Security Audit Logging

Security-sensitive events are recorded for administrative review, including:

- Successful authentication
- Failed authentication
- Scan uploads
- Duplicate detections
- VirusTotal lookups
- VirusTotal cache usage
- Unauthorized administrative access
- Rejected uploads

### Dashboard

The dashboard provides:

- Total scan count
- Malicious scan count
- Clean scan count
- Recent scan activity
- Scan status indicators
- Manual refresh with non-blocking UI state

### Scan History & Details

Users can:

- View their scan history
- Open individual scan details
- Review SHA-256 hashes
- Review YARA detections
- Review VirusTotal intelligence
- Navigate between history and scan details

### Frontend Security & UX

- Protected routes
- Authentication state management
- Responsive navigation
- Keyboard-accessible interactive elements
- Accessible form controls
- Accessible status/error messages
- Responsive dashboard layout
- Dedicated 404 page
- Clear loading and error states

---

## Security Controls

SentinelX includes several defensive controls designed for a malware-analysis workflow.

### Upload Security

- 10 MB default upload limit
- Configurable upload size
- Empty-file rejection
- Filename sanitization
- SHA-256 integrity identification
- Controlled upload storage
- Cleanup on failed processing
- Duplicate detection

### Authentication Security

- JWT access tokens
- UUID-based JWT subject identifiers
- Generic authentication failure messages
- Invalid/expired token handling
- Inactive-user protection
- Failed-login auditing

### Authorization

Protected resources enforce ownership and role boundaries.

A user can access only their own scan records, while security audit data is restricted to authorized administrators.

Cross-user access attempts are rejected rather than exposing another user's scan data.

### HTTP Security

The backend includes security-oriented HTTP response headers and configured CORS behavior.

---

## Architecture

```text
┌──────────────────────┐
│      React UI        │
│   React + TypeScript │
└──────────┬───────────┘
           │
           │ HTTP / JWT
           ▼
┌──────────────────────┐
│       FastAPI        │
│      REST API        │
└──────────┬───────────┘
           │
     ┌─────┼───────────────┐
     │     │               │
     ▼     ▼               ▼
 PostgreSQL YARA      VirusTotal API
     │     │               │
     └─────┴───────────────┘
           │
           ▼
      Scan Results
      & Audit Logs
Tech Stack
Backend
Python 3.13
FastAPI
SQLAlchemy 2
PostgreSQL
Alembic
Pydantic
JWT authentication
Passlib
YARA
VirusTotal API
Pytest
Frontend
React 19
TypeScript
Vite
Tailwind CSS
React Router
Axios
Lucide React
React Hook Form
Zod
ESLint
Project Structure
SentinelX/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tests/
│   │   └── main.py
│   ├── alembic/
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
│
└── README.md
Local Development
Prerequisites
Python 3.13
Node.js
PostgreSQL
YARA-compatible Python environment
VirusTotal API key for VirusTotal enrichment
Backend
cd backend

Create and activate the virtual environment:

python -m venv venv
.\venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Configure environment variables using:

backend/.env.example

Run database migrations:

alembic upgrade head

Start the API:

uvicorn app.main:app --reload

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs
Frontend

Open a second terminal:

cd frontend

Install dependencies:

npm install

Configure:

frontend/.env.example

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
Testing
Backend

Run the complete backend test suite:

cd backend
pytest -q

Current verification:

44 passed
Frontend

Run linting:

cd frontend
npm run lint

Run the production build:

npm run build

Both checks currently pass.

API Areas

The backend exposes endpoints covering:

Authentication
POST /auth/register
POST /auth/login
GET  /auth/me
Malware Scanning
POST /scan/upload
GET  /scan/history
GET  /scan/stats
GET  /scan/{scan_id}
Security Administration
GET /audit

Administrative endpoints require appropriate authorization.

Security Design Principles

SentinelX was developed with the following principles:

Least-privilege access
Explicit authentication and authorization
User-level resource isolation
Secure input handling
Defensive upload processing
Hash-based file identification
Auditable security events
Generic authentication errors
Configurable security limits
Fail-safe authorization behavior
Automated backend testing
Clean separation between frontend and backend responsibilities
Current Status

Status: Functional portfolio-ready build

Implemented and verified:

Authentication
Registration
JWT authorization
Role-based access control
Secure file upload
SHA-256 hashing
YARA detection
VirusTotal enrichment
Duplicate detection
Scan history
Scan details
Dashboard statistics
Security audit logging
Responsive frontend
Protected routes
Administrative security view
Error handling
Accessibility improvements
Backend automated tests
Frontend linting
Production frontend build
Future Enhancements

Potential future development areas include:

Background scan processing for larger workloads
Additional static-analysis engines
Sandbox execution
Advanced IOC extraction
Threat intelligence provider integrations
Detection rule management
Analyst investigation workflows
Advanced reporting
Metrics and observability
Containerized deployment
CI/CD security checks

These are future enhancements and are not represented as currently implemented functionality.

License

MIT License