import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from app.deps import get_db, require_role
from app.models.complaint import Complaint
from app.models.user import User

UPLOAD_DIR = "uploads/completed"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(
    prefix="/worker",
    tags=["Worker"]
)


# 0️⃣ Worker stats & profile
@router.get("/stats")
def worker_stats(
    db: Session = Depends(get_db),
    worker: User = Depends(require_role("worker"))
):
    all_tasks = db.query(Complaint).filter(
        Complaint.worker_id == worker.id,
        Complaint.organization_id == worker.organization_id
    ).all()
    
    assigned = len([c for c in all_tasks if c.status == "assigned"])
    in_progress = len([c for c in all_tasks if c.status == "in_progress"])
    completed = len([c for c in all_tasks if c.status == "completed"])
    
    return {
        "profile": {
            "id": worker.id,
            "name": worker.name,
            "email": worker.email,
            "village": worker.village,
            "area": worker.area,
        },
        "stats": {
            "assigned": assigned,
            "in_progress": in_progress,
            "completed": completed,
            "total": len(all_tasks),
        }
    }


# 0️⃣.5 Worker history (completed tasks)
@router.get("/history")
def worker_history(
    db: Session = Depends(get_db),
    worker: User = Depends(require_role("worker"))
):
    completed = (
        db.query(Complaint)
        .filter(Complaint.worker_id == worker.id)
        .filter(Complaint.status == "completed")
        .filter(Complaint.organization_id == worker.organization_id)
        .order_by(Complaint.completed_at.desc())
        .all()
    )

    return [
        {
            "id": c.id,
            "address": c.address,
            "village": c.village,
            "area": c.area,
            "photo_path": c.photo_path,
            "completed_photo_path": c.completed_photo_path,
            "created_at": c.created_at,
            "completed_at": c.completed_at,
        }
        for c in completed
    ]


# 1️⃣ View assigned complaints (active tasks)
@router.get("/complaints")
def my_complaints(
    db: Session = Depends(get_db),
    worker: User = Depends(require_role("worker"))
):
    complaints = (
        db.query(Complaint)
        .filter(Complaint.worker_id == worker.id)
        .filter(Complaint.status.in_(["assigned", "in_progress"]))
        .filter(Complaint.organization_id == worker.organization_id)
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
            "status": c.status,
            "created_at": c.created_at,
        }
        for c in complaints
    ]


# 2️⃣ Start work
@router.post("/complaints/{complaint_id}/start")
def start_complaint(
    complaint_id: int,
    db: Session = Depends(get_db),
    worker: User = Depends(require_role("worker"))
):
    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.worker_id == worker.id,
            Complaint.organization_id == worker.organization_id
        )
        .first()
    )

    if not complaint:
        raise HTTPException(404, "Complaint not found")

    if complaint.status != "assigned":
        raise HTTPException(400, "Complaint not in assigned state")

    complaint.status = "in_progress"
    db.commit()

    return {
        "message": "Work started",
        "complaint_id": complaint.id,
        "status": complaint.status
    }


# 3️⃣ Complete work + upload photo
@router.post("/complaints/{complaint_id}/complete")
def complete_complaint(
    complaint_id: int,
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    worker: User = Depends(require_role("worker"))
):
    if not photo.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files allowed")

    complaint = (
        db.query(Complaint)
        .filter(
            Complaint.id == complaint_id,
            Complaint.worker_id == worker.id,
            Complaint.organization_id == worker.organization_id
        )
        .first()
    )

    if not complaint:
        raise HTTPException(404, "Complaint not found")

    if complaint.status != "in_progress":
        raise HTTPException(400, "Complaint not in progress")

    # Save completion photo
    ext = photo.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as f:
        f.write(photo.file.read())

    complaint.status = "completed"
    complaint.completed_photo_path = file_path
    complaint.completed_at = func.now()

    db.commit()

    return {
        "message": "Complaint completed successfully",
        "complaint_id": complaint.id,
        "status": complaint.status
    }
