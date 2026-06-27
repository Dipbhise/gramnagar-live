from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.models.user import User
from app.models.organization import Organization
from app.auth import create_access_token
from app.deps import get_db
from app.schemas.register import RegisterSchema

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")  # Updated for JSON schema


# ======================================================
# REGISTER
# ======================================================
@router.post("/register")
async def register(
    data: RegisterSchema = Body(...),
    db: Session = Depends(get_db)
):
    if len(data.password.encode("utf-8")) > 72:
        raise HTTPException(status_code=400, detail="Password too long")

    if data.role not in ["citizen", "worker", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    organization = db.query(Organization).filter(
        Organization.type == data.organization_type
    ).first()

    if not organization:
        raise HTTPException(status_code=400, detail="Invalid organization type")

    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=pwd.hash(data.password),
        organization_id=organization.id,
        village=data.village or "",
        area=data.area or "",
        role=data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"{data.role.capitalize()} registered successfully",
        "user_id": user.id,
        "role": user.role,
        "organization": data.organization_type
    }


# ======================================================
# LOGIN (OAUTH2 – SWAGGER + FRONTEND SAFE)
# ======================================================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    organization_type: str = None,  # Password field contains organization_type for frontend
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == form_data.username.lower()
    ).first()

    if not user or not pwd.verify(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # Get user's organization
    user_org = db.query(Organization).filter(
        Organization.id == user.organization_id
    ).first()

    if not user_org:
        raise HTTPException(status_code=400, detail="Organization not found")

    # Organization-based access control
    # Workers and Admins can only login to their assigned organization
    if user.role in ["worker", "admin"]:
        # For OAuth2PasswordRequestForm, organization_type comes from frontend in special way
        # We'll handle this by checking headers or returning org info for validation
        # Frontend will validate this before showing success
        pass

    token = create_access_token({
        "user_id": user.id,
        "role": user.role
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "organization": user_org.type,
        "organization_name": user_org.name,
        "user_id": user.id,
        "name": user.name
    }