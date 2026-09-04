from fastapi import FastAPI

from app.core.config import settings

app = FastAPI(title=settings.app_name)


@app.get("/")
def root():
    return {
        "application": settings.app_name,
        "debug": settings.debug,
    }