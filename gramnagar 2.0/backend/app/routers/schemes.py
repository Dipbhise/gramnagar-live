from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
from pathlib import Path
import shutil

from app.deps import get_db, require_role, get_current_user
from app.models.scheme import Scheme
from app.models.user import User
from app.models.organization import Organization
from app.schemas.scheme import SchemeCreate, SchemeUpdate, SchemeOut

router = APIRouter(
    prefix="/schemes",
    tags=["Schemes"]
)

# Upload directory for scheme PDFs
SCHEME_UPLOAD_DIR = "uploads/schemes"
Path(SCHEME_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)


# Helper function to enrich schemes with organization names
def enrich_schemes_with_org(schemes: list[Scheme], db: Session) -> list[dict]:
    """Attach organization names to schemes"""
    enriched = []
    for scheme in schemes:
        scheme_dict = {
            "id": scheme.id,
            "title": scheme.title,
            "description": scheme.description,
            "eligibility": scheme.eligibility,
            "benefits": scheme.benefits,
            "start_date": scheme.start_date,
            "end_date": scheme.end_date,
            "is_active": scheme.is_active,
            "gr_pdf_path": scheme.gr_pdf_path,
            "created_at": scheme.created_at,
            "organization_id": scheme.organization_id,
            "organization_name": None
        }
        
        # Get organization name
        org = db.query(Organization).filter(Organization.id == scheme.organization_id).first()
        if org:
            scheme_dict["organization_name"] = org.name
        
        enriched.append(scheme_dict)
    
    return enriched


# =========================
# ADMIN – UPLOAD GR PDF (MUST BE BEFORE /admin/{scheme_id})
# =========================
@router.post("/admin/{scheme_id}/upload-gr", response_model=SchemeOut)
async def upload_gr_pdf(
    scheme_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Upload GR (Government Resolution) PDF for a scheme"""
    
    # Verify scheme exists and admin owns it
    scheme = db.query(Scheme).filter(
        Scheme.id == scheme_id,
        Scheme.organization_id == admin.organization_id
    ).first()
    
    if not scheme:
        raise HTTPException(404, "Scheme not found")
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(400, "Only PDF files are allowed")
    
    try:
        # Generate filename
        filename = f"scheme_{scheme_id}_gr.pdf"
        filepath = os.path.join(SCHEME_UPLOAD_DIR, filename)
        
        # Delete old file if exists
        if scheme.gr_pdf_path and os.path.exists(scheme.gr_pdf_path):
            os.remove(scheme.gr_pdf_path)
        
        # Save new file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update scheme
        scheme.gr_pdf_path = filepath
        db.commit()
        db.refresh(scheme)
        
        return scheme
    except Exception as e:
        raise HTTPException(500, f"File upload failed: {str(e)}")


# =========================
# CITIZEN – VIEW SCHEMES
# =========================
@router.get("")
def list_active_schemes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Any authenticated user can see schemes from their own organization
    # This works for citizens, workers, and admins
    if not user or not user.organization_id:
        raise HTTPException(status_code=403, detail="User does not belong to an organization")
    # Users should see schemes belonging to their own organization
    # and also schemes published by any Mahanagar Palika (city-level schemes).
    schemes = (
        db.query(Scheme)
        .join(Organization, Organization.id == Scheme.organization_id)
        .filter(
            Scheme.is_active == True,
            or_(
                Scheme.organization_id == user.organization_id,
                Organization.type == 'mahanagar_palika'
            )
        )
        .order_by(Scheme.created_at.desc())
        .all()
    )
    
    # Enrich with organization names
    return enrich_schemes_with_org(schemes, db)


# =========================
# ADMIN – CREATE SCHEME
# =========================
@router.post("/admin", response_model=SchemeOut)
def create_scheme(
    data: SchemeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    scheme = Scheme(
        **data.dict(), 
        organization_id=admin.organization_id,  # Assign to admin's organization
        created_by=admin.id
    )
    db.add(scheme)
    db.commit()
    db.refresh(scheme)
    return scheme


# =========================
# ADMIN – UPDATE SCHEME
# =========================
@router.put("/admin/{scheme_id}", response_model=SchemeOut)
def update_scheme(
    scheme_id: int,
    data: SchemeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    scheme = db.query(Scheme).filter(
        Scheme.id == scheme_id,
        Scheme.organization_id == admin.organization_id  # Ensure admin can only update schemes from their org
    ).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(scheme, key, value)

    db.commit()
    db.refresh(scheme)
    return scheme


# =========================
# ADMIN – DELETE SCHEME
# =========================
@router.delete("/admin/{scheme_id}")
def delete_scheme(
    scheme_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    scheme = db.query(Scheme).filter(
        Scheme.id == scheme_id,
        Scheme.organization_id == admin.organization_id  # Ensure admin can only delete schemes from their org
    ).first()
    if not scheme:
        raise HTTPException(404, "Scheme not found")

    # Delete associated PDF file if exists
    if scheme.gr_pdf_path and os.path.exists(scheme.gr_pdf_path):
        os.remove(scheme.gr_pdf_path)

    db.delete(scheme)
    db.commit()
    return {"message": "Scheme deleted successfully"}
