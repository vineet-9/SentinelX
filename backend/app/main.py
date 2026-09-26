from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.api.v1.endpoints.audit import router as audit_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.scan import router as scan_router
from app.api.v1.endpoints.users import router as users_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def add_security_headers(
    request: Request,
    call_next,
) -> Response:
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = (
        "camera=(), microphone=(), geolocation=()"
    )

    return response


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scan_router)
app.include_router(audit_router)


@app.get("/")
def root():
    return {"message": "Welcome to SentinelX"}