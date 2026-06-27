import os
import uuid
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    Form,
    HTTPException,
)
from sqlalchemy.orm import Session

from app.deps import get_db, require_role, require_organization_access
from app.models.complaint import Complaint
from app.models.user import User

UPLOAD_DIR = "uploads/complaints"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/complaints",
    tags=["Complaints"]
)

# =====================================================
# SUBMIT COMPLAINT (CITIZEN)
# =====================================================
@router.post("/submit")
def submit_complaint(
    address: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    village: str = Form(""),
    area: str = Form(""),
    photo: UploadFile = File(...),

    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    # Validate coordinates
    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=422,
            detail="Latitude and longitude are required"
        )

    # Validate photo
    if not photo or not photo.content_type:
        raise HTTPException(
            status_code=422,
            detail="Photo is required"
        )

    if not photo.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are allowed"
        )

    # Save image
    ext = photo.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as f:
            f.write(photo.file.read())
    except Exception:
        raise HTTPException(500, "Failed to save image")

    complaint = Complaint(
        organization_id=user.organization_id,
        citizen_id=user.id,
        address=address.strip(),
        village=village.strip(),
        area=area.strip(),
        latitude=latitude,
        longitude=longitude,
        photo_path=file_path,
        status="pending"
    )

    db.add(complaint)
    db.commit()
    db.refresh(complaint)

    return {
        "message": "Complaint submitted successfully",
        "complaint_id": complaint.id,
        "status": complaint.status
    }

# =====================================================
# GET MY COMPLAINTS (CITIZEN)
# =====================================================
@router.get("/my")
def my_complaints(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    complaints: List[Complaint] = (
        db.query(Complaint)
        .filter(
            Complaint.citizen_id == user.id,
            Complaint.organization_id == user.organization_id
        )
        .order_by(Complaint.created_at.desc())
        .all()
    )

    return [
        {
            "id": c.id,
            "address": c.address,
            "village": c.village,
            "area": c.area,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "photo_path": c.photo_path,
            "completed_photo_path": c.completed_photo_path,
            "status": c.status,
            "created_at": c.created_at,
            "completed_at": c.completed_at,
            "worker_id": c.worker_id,
        }
        for c in complaints
    ]

# =====================================================
# GET COMPLAINT DETAIL (CITIZEN)
# =====================================================
@router.get("/{complaint_id}")
def get_complaint_detail(
    complaint_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.citizen_id == user.id,
        Complaint.organization_id == user.organization_id
    ).first()

    if not complaint:
        raise HTTPException(404, "Complaint not found")

    return {
        "id": complaint.id,
        "address": complaint.address,
        "village": complaint.village,
        "area": complaint.area,
        "latitude": complaint.latitude,
        "longitude": complaint.longitude,
        "photo_path": complaint.photo_path,
        "completed_photo_path": complaint.completed_photo_path,
        "status": complaint.status,
        "created_at": complaint.created_at,
        "completed_at": complaint.completed_at,
        "worker_id": complaint.worker_id,
    }
