from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routers import cases, export


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="AETHER API",
    description="Backend for Project AETHER (SIH 2026, PS 26151). All case data in "
                "this deployment is simulated demonstration data.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to the deployed frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)
app.include_router(export.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "aether-api"}
