from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.endpoints.auth import router as auth_router
from app.core.config import settings

from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.scan import router as scan_router

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(scan_router)

@app.get("/")
def root():
    return {"message": "Welcome to SentinelX"}