from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from fastapi.staticfiles import StaticFiles

# ✅ IMPORT ROUTERS DIRECTLY (NO __init__.py IMPORTS)
from app.routers.auth import router as auth_router
from app.routers.complaints import router as complaints_router
from app.routers.admin import router as admin_router
from app.routers.worker import router as worker_router
from app.routers.schemes import router as schemes_router
from app.routers.tax import router as tax_router
from app.routers.certificates import router as certificates_router
from app.routers.notifications import router as notifications_router


# ✅ INITIALIZE DB WITH TABLES AND DEFAULT ORGANIZATIONS
init_db()

# ✅ FASTAPI APP
app = FastAPI(title="Gramnagar Live API")

# ✅ CORS FIX (REQUIRED FOR FRONTEND)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",     # Vite
        "http://127.0.0.1:5173",
        "http://localhost:3000",     # Vite (fallback)
        "http://127.0.0.1:3000",    # Vite (fallback)
        "https://gramnagar.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ STATIC FILES (THIS FIXES IMAGE LOADING)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# ✅ REGISTER ROUTERS
app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(admin_router)
app.include_router(worker_router)
app.include_router(schemes_router)
app.include_router(tax_router)
app.include_router(certificates_router)
app.include_router(notifications_router)


@app.get("/")
def root():
    return {"message": "Gramnagar Live Backend Running"}


# Debug: list registered routes (helps verify router mounting)
@app.get("/debug/routes")
def debug_routes():
    routes = []
    for r in app.routes:
        try:
            routes.append({"path": r.path, "methods": sorted(list(r.methods)) if hasattr(r, 'methods') else []})
        except Exception:
            # some routes may not expose path/methods in same way
            continue
    return routes
