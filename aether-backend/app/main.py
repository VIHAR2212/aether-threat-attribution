from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db import Base, engine, get_db
from app.routers import analysis, cases, export
from app.routers.cases import verify_custody_chain
from app.schemas import VerifyResult


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
app.include_router(analysis.router)


@app.get("/")
def root() -> dict:
    return {
        "service": "AETHER Threat Attribution API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "service": "aether-api"}


@app.get("/api/custody/verify", response_model=VerifyResult, tags=["custody"])
def custody_verify_alias(evidence_id: str = "AT-2026-0047", db: Session = Depends(get_db)) -> VerifyResult:
    return verify_custody_chain(evidence_id, db)


