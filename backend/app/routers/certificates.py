from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import uuid
from pathlib import Path
import shutil
from datetime import datetime
import json

from app.deps import get_db, require_role, get_current_user
from app.models.certificate import CertificateType, CertificateApplication
from app.models.user import User
from app.models.organization import Organization
from app.schemas.certificate import (
    CertificateTypeCreate, CertificateTypeUpdate, CertificateTypeOut,
    CertificateApplicationCreate, CertificateApplicationUpdate, 
    CertificateApplicationReview, CertificateApplicationOut,
    CertificateApplicationListItem
)

router = APIRouter(
    prefix="/certificates",
    tags=["Certificates"]
)

# Upload directory for certificate documents
CERTIFICATES_UPLOAD_DIR = "uploads/certificates"
GENERATED_CERTIFICATES_DIR = "uploads/generated_certificates"
Path(CERTIFICATES_UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(GENERATED_CERTIFICATES_DIR).mkdir(parents=True, exist_ok=True)


# Helper function to upload supporting documents
def upload_supporting_documents(files: list[UploadFile]) -> list[str]:
    """Upload supporting documents and return their paths"""
    document_paths = []
    for file in files:
        if not file.content_type.startswith("image/") and not file.filename.endswith(('.pdf', '.doc', '.docx')):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not an allowed document type")
        
        ext = file.filename.split(".")[-1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = os.path.join(CERTIFICATES_UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        document_paths.append(file_path)
    
    return document_paths


# Helper function to generate application number
def generate_application_number():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = str(uuid.uuid4().hex)[:6].upper()
    return f"CERT-{timestamp}-{random_part}"


# Helper function to generate certificate number
def generate_certificate_number():
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = str(uuid.uuid4().hex)[:6].upper()
    return f"GEN-{timestamp}-{random_part}"


# Helper function to enrich certificate applications with names
def enrich_certificate_applications(applications: list, db: Session) -> list:
    """Attach citizen names and certificate type names to applications"""
    enriched = []
    for app in applications:
        app_dict = {
            "id": app.id,
            "application_number": app.application_number,
            "citizen_id": app.citizen_id,
            "organization_id": app.organization_id,
            "certificate_type_id": app.certificate_type_id,
            "form_data": app.form_data,
            "supporting_documents": app.supporting_documents,
            "status": app.status,
            "admin_remarks": app.admin_remarks,
            "reviewed_by": app.reviewed_by,
            "reviewed_at": app.reviewed_at,
            "approved_at": app.approved_at,
            "certificate_number": app.certificate_number,
            "issued_at": app.issued_at,
            "certificate_path": app.certificate_path,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "citizen_name": None,
            "certificate_type_name": None
        }
        
        # Get citizen name
        citizen = db.query(User).filter(User.id == app.citizen_id).first()
        if citizen:
            app_dict["citizen_name"] = citizen.name
        
        # Get certificate type name
        cert_type = db.query(CertificateType).filter(CertificateType.id == app.certificate_type_id).first()
        if cert_type:
            app_dict["certificate_type_name"] = cert_type.display_name
            
        enriched.append(app_dict)
    
    return enriched


# =========================
# ADMIN – MANAGE CERTIFICATE TYPES
# =========================
@router.post("/admin/types", response_model=CertificateTypeOut)
def create_certificate_type(
    data: CertificateTypeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Create a new certificate type"""
    # Check if certificate type already exists
    existing = db.query(CertificateType).filter(CertificateType.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Certificate type already exists")
    
    cert_type = CertificateType(**data.dict())
    db.add(cert_type)
    db.commit()
    db.refresh(cert_type)
    return cert_type


@router.get("/admin/types", response_model=list[CertificateTypeOut])
def list_certificate_types(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """List all certificate types"""
    return db.query(CertificateType).all()


@router.put("/admin/types/{type_id}", response_model=CertificateTypeOut)
def update_certificate_type(
    type_id: int,
    data: CertificateTypeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Update a certificate type"""
    cert_type = db.query(CertificateType).filter(CertificateType.id == type_id).first()
    if not cert_type:
        raise HTTPException(status_code=404, detail="Certificate type not found")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(cert_type, key, value)
    
    db.commit()
    db.refresh(cert_type)
    return cert_type


@router.delete("/admin/types/{type_id}")
def delete_certificate_type(
    type_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Delete a certificate type"""
    cert_type = db.query(CertificateType).filter(CertificateType.id == type_id).first()
    if not cert_type:
        raise HTTPException(status_code=404, detail="Certificate type not found")
    
    # Check if any applications exist for this type
    applications = db.query(CertificateApplication).filter(
        CertificateApplication.certificate_type_id == type_id
    ).count()
    if applications > 0:
        raise HTTPException(status_code=400, detail="Cannot delete certificate type with existing applications")
    
    db.delete(cert_type)
    db.commit()
    return {"message": "Certificate type deleted successfully"}


# =========================
# ADMIN – REVIEW APPLICATIONS
# =========================
@router.get("/admin/applications")
def list_certificate_applications(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """List all certificate applications for admin's organization"""
    applications = (
        db.query(CertificateApplication)
        .filter(CertificateApplication.organization_id == admin.organization_id)
        .order_by(CertificateApplication.created_at.desc())
        .all()
    )
    
    # Enrich with names
    return enrich_certificate_applications(applications, db)


@router.get("/admin/applications/{application_id}", response_model=CertificateApplicationOut)
def get_certificate_application_detail(
    application_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Get detailed information about a certificate application"""
    application = (
        db.query(CertificateApplication)
        .filter(
            CertificateApplication.id == application_id,
            CertificateApplication.organization_id == admin.organization_id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Enrich with names
    enriched = enrich_certificate_applications([application], db)[0]
    return enriched


@router.put("/admin/applications/{application_id}/review")
def review_certificate_application(
    application_id: int,
    review_data: CertificateApplicationReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Review and approve/reject a certificate application"""
    application = (
        db.query(CertificateApplication)
        .filter(
            CertificateApplication.id == application_id,
            CertificateApplication.organization_id == admin.organization_id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if review_data.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Update application status
    application.status = review_data.status
    application.admin_remarks = review_data.admin_remarks
    application.reviewed_by = admin.id
    application.reviewed_at = datetime.utcnow()
    
    # If approved, generate certificate number and path
    if review_data.status == "approved":
        application.approved_at = datetime.utcnow()
        application.certificate_number = generate_certificate_number()
        # For now, we'll create a placeholder for the generated certificate
        # In a real implementation, you'd generate the actual certificate document
        filename = f"certificate_{application.id}_{application.certificate_number}.pdf"
        filepath = os.path.join(GENERATED_CERTIFICATES_DIR, filename)
        application.certificate_path = filepath
        application.issued_at = datetime.utcnow()
    
    db.commit()
    db.refresh(application)
    
    # Enrich with names
    enriched = enrich_certificate_applications([application], db)[0]
    return enriched


# =========================
# CITIZEN – SUBMIT AND TRACK APPLICATIONS
# =========================
@router.get("/types")
def list_available_certificate_types(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """List available certificate types for citizen"""
    types = db.query(CertificateType).filter(CertificateType.is_active == True).all()
    return types


@router.post("/apply")
def apply_for_certificate(
    certificate_type_id: int = Form(...),
    form_data: str = Form(...),
    supporting_documents: list[UploadFile] = File(None),
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    """Apply for a certificate with supporting documents"""
    # Verify certificate type exists and is active
    cert_type = db.query(CertificateType).filter(
        CertificateType.id == certificate_type_id,
        CertificateType.is_active == True
    ).first()
    
    if not cert_type:
        raise HTTPException(status_code=404, detail="Certificate type not found or inactive")
    
    # Handle document uploads if any
    document_paths = []
    if supporting_documents:
        # Filter out any empty files
        valid_documents = [doc for doc in supporting_documents if doc and doc.filename]
        if valid_documents:
            document_paths = upload_supporting_documents(valid_documents)
    
    # Generate application number
    application_number = generate_application_number()
    
    # Create application
    application = CertificateApplication(
        application_number=application_number,
        citizen_id=user.id,
        organization_id=user.organization_id,
        certificate_type_id=certificate_type_id,
        form_data=form_data,
        supporting_documents=json.dumps(document_paths) if document_paths else json.dumps([]),  # Store as JSON array of file paths
        status="pending"
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    # Enrich with names
    enriched = enrich_certificate_applications([application], db)[0]
    return {
        "message": "Certificate application submitted successfully",
        "application": enriched
    }


@router.get("/my-applications")
def get_my_certificate_applications(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    """Get all certificate applications submitted by the citizen"""
    applications = (
        db.query(CertificateApplication)
        .filter(
            CertificateApplication.citizen_id == user.id,
            CertificateApplication.organization_id == user.organization_id
        )
        .order_by(CertificateApplication.created_at.desc())
        .all()
    )
    
    # Enrich with names
    return enrich_certificate_applications(applications, db)


@router.get("/applications/{application_id}")
def get_certificate_application(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    """Get a specific certificate application"""
    application = (
        db.query(CertificateApplication)
        .filter(
            CertificateApplication.id == application_id,
            CertificateApplication.citizen_id == user.id,
            CertificateApplication.organization_id == user.organization_id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Enrich with names
    enriched = enrich_certificate_applications([application], db)[0]
    return enriched


@router.get("/download/{application_id}")
def download_certificate(
    application_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Download approved certificate"""
    application = (
        db.query(CertificateApplication)
        .filter(
            CertificateApplication.id == application_id,
            CertificateApplication.status == "approved",
            CertificateApplication.citizen_id == user.id,
            CertificateApplication.organization_id == user.organization_id
        )
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Approved certificate not found")
    
    if not application.certificate_path or not os.path.exists(application.certificate_path):
        raise HTTPException(status_code=404, detail="Certificate file not found")
    
    # Return file path for download
    return {
        "certificate_path": application.certificate_path,
        "certificate_number": application.certificate_number,
        "application_id": application.id
    }


@router.get("/download-document/{filename}")
def download_certificate_document(
    filename: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Download a certificate supporting document - requires authentication"""
    import os
    from fastapi.responses import FileResponse
    
    # Construct the file path
    file_path = os.path.join(CERTIFICATES_UPLOAD_DIR, filename)
    
    # Verify the file exists
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check if the user has access to this document
    # First, verify that the filename exists in some application's supporting documents
    # Query applications to see if this file is associated with any application the user can access
    if user.role == "admin":
        # Admin can access any document from their organization
        applications = db.query(CertificateApplication).filter(
            CertificateApplication.organization_id == user.organization_id
        ).all()
        
        file_found = False
        for app in applications:
            if app.supporting_documents:
                try:
                    doc_list = json.loads(app.supporting_documents)
                    for doc_path in doc_list:
                        if filename in doc_path:
                            file_found = True
                            break
                except:
                    continue
        
        if not file_found:
            raise HTTPException(status_code=403, detail="Access denied")
            
    elif user.role == "citizen":
        # Citizen can only access documents from their own applications
        applications = db.query(CertificateApplication).filter(
            CertificateApplication.citizen_id == user.id,
            CertificateApplication.organization_id == user.organization_id
        ).all()
        
        file_found = False
        for app in applications:
            if app.supporting_documents:
                try:
                    doc_list = json.loads(app.supporting_documents)
                    for doc_path in doc_list:
                        if filename in doc_path:
                            file_found = True
                            break
                except:
                    continue
        
        if not file_found:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return FileResponse(
        path=file_path,
        media_type='application/octet-stream',  # More generic media type
        filename=filename
    )
