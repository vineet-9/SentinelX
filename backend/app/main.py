from fastapi import FastAPI

from app.database.connection import engine
from app.database.base import Base

import app.models.user

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SentinelX API",
    version="0.1.0",
)


@app.get("/")
def root():
    return {
        "message": "SentinelX Backend Running"
    }