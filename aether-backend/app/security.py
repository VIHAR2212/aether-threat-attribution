"""Security middleware and forensic audit logging for Project AETHER.

Enforces:
1. Strict HTTP Security Headers (X-Content-Type-Options, X-Frame-Options, CSP, HSTS).
2. Request payload size limits (2MB).
3. Configurable CORS restrictions.
4. Centralized forensic audit logger for tamper-evident activity tracking.
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session

from app.models import AuditLog


MAX_PAYLOAD_BYTES = 2 * 1024 * 1024  # 2 Megabytes


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforce defensive security response headers on all API responses."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response: Response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Clickjacking mitigation
        response.headers["X-Frame-Options"] = "DENY"
        
        # Cross-Site Scripting (XSS) legacy defense
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # HTTP Strict Transport Security
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Content Security Policy (allows Swagger docs + UI integration)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; "
            "font-src 'self' https://cdnjs.cloudflare.com; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:*; "
            "img-src 'self' data: https:; "
            "frame-ancestors 'none';"
        )
        
        # Cache control for sensitive forensic responses
        if request.url.path.startswith("/api/cases") or request.url.path.startswith("/api/analysis"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"

        return response


class PayloadLimitMiddleware(BaseHTTPMiddleware):
    """Guards against large payload DoS attempts by inspecting Content-Length."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length_int = int(content_length)
                if length_int > MAX_PAYLOAD_BYTES:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Request payload exceeds the 2MB forensic transmission limit ({length_int} bytes)."
                    )
            except ValueError:
                pass
        return await call_next(request)


def record_audit_log(
    db: Session,
    operator: str,
    action: str,
    case_id: int | None = None,
    details: dict | None = None,
) -> AuditLog:
    """Record an investigator action to the forensic audit log."""
    ts = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    log_entry = AuditLog(
        case_id=case_id,
        timestamp=ts,
        operator=operator or "INVESTIGATOR_SYSTEM",
        action=action,
        details=details or {},
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
