from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext

from app.deps import get_db, require_role
from app.models.complaint import Complaint
from app.models.user import User

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class WorkerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    village: str = ""
    area: str = ""

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/complaints")
def list_all_complaints(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    complaints = db.query(Complaint).filter(
        Complaint.organization_id == admin.organization_id
    ).order_by(Complaint.created_at.desc()).all()

    result = []
    for c in complaints:
        # Get citizen info
        citizen = db.query(User).filter(User.id == c.citizen_id).first()
        # Get worker info if assigned
        worker = None
        if c.worker_id:
            worker = db.query(User).filter(User.id == c.worker_id).first()

        result.append({
            "id": c.id,
            "address": c.address,
            "village": c.village,
            "area": c.area,
            "latitude": c.latitude,
            "longitude": c.longitude,
            "photo_path": c.photo_path,
            "completed_photo_path": c.completed_photo_path,
            "status": c.status,
            "citizen_id": c.citizen_id,
            "citizen_name": citizen.name if citizen else None,
            "worker_id": c.worker_id,
            "worker_name": worker.name if worker else None,
            "created_at": c.created_at,
            "completed_at": c.completed_at
        })

    return result


@router.post("/complaints/{complaint_id}/assign/{worker_id}")
def assign_worker(
    complaint_id: int,
    worker_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    complaint = db.query(Complaint).filter(
        Complaint.id == complaint_id,
        Complaint.organization_id == admin.organization_id
    ).first()
    if not complaint:
        raise HTTPException(404, "Complaint not found")

    worker = db.query(User).filter(
        User.id == worker_id,
        User.role == "worker",
        User.organization_id == admin.organization_id  # Ensure worker is from same org
    ).first()
    if not worker:
        raise HTTPException(404, "Worker not found")

    complaint.worker_id = worker.id
    complaint.status = "assigned"

    db.commit()

    return {
        "message": "Worker assigned successfully",
        "complaint_id": complaint.id,
        "worker_id": worker.id,
        "status": complaint.status
    }


@router.get("/workers")
def list_workers(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    workers = db.query(User).filter(
        User.role == "worker",
        User.organization_id == admin.organization_id
    ).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "email": w.email,
            "village": w.village,
            "area": w.area
        }
        for w in workers
    ]


@router.post("/workers")
def create_worker(
    data: WorkerCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    if len(data.password.encode("utf-8")) > 72:
        raise HTTPException(400, "Password too long (max 72 bytes)")

    if db.query(User).filter(User.email == data.email.lower()).first():
        raise HTTPException(400, "Email already registered")

    worker = User(
        name=data.name.strip(),
        email=data.email.lower().strip(),
        password_hash=pwd.hash(data.password),
        organization_id=admin.organization_id,  # Assign to admin's organization
        village=data.village.strip(),
        area=data.area.strip(),
        role="worker"
    )

    db.add(worker)
    db.commit()
    db.refresh(worker)

    return {
        "message": "Worker created successfully",
        "id": worker.id,
        "name": worker.name,
        "email": worker.email
    }
