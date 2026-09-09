from fastapi import FastAPI

from app.api.v1.endpoints.auth import router as auth_router
from app.core.config import settings

from app.api.v1.endpoints.users import router as users_router
from app.api.v1.endpoints.scan import router as scan_router

app = FastAPI(title=settings.app_name)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(scan_router)

@app.get("/")
def root():
    return {"message": "Welcome to SentinelX"}