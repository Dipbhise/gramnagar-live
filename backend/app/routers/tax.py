from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from app.deps import get_db, require_role, get_current_user
from app.models.tax import TaxType, CitizenTax
from app.models.user import User
from app.schemas.tax import (
    TaxTypeCreate, TaxTypeOut, CitizenTaxCreate, 
    CitizenTaxUpdate, CitizenTaxOut, CitizenTaxListItem
)

router = APIRouter(
    prefix="/taxes",
    tags=["Taxes"]
)


# ===========================
# ADMIN – MANAGE TAX TYPES
# ===========================
@router.post("/admin/types", response_model=TaxTypeOut)
def create_tax_type(
    data: TaxTypeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Create a new tax type (system-wide)"""
    existing = db.query(TaxType).filter(TaxType.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tax type already exists")
    
    tax_type = TaxType(**data.dict())
    db.add(tax_type)
    db.commit()
    db.refresh(tax_type)
    return tax_type


@router.get("/admin/types", response_model=list[TaxTypeOut])
def list_tax_types(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """List all tax types"""
    return db.query(TaxType).all()


# ===========================
# ADMIN – MANAGE CITIZEN TAXES
# ===========================
@router.get("/admin/citizens")
def list_citizens_in_org(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """List all citizens in admin's organization"""
    citizens = db.query(User).filter(
        User.organization_id == admin.organization_id,
        User.role == "citizen"
    ).all()
    
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "village": c.village,
            "area": c.area
        }
        for c in citizens
    ]


@router.get("/admin/citizens/{citizen_id}/taxes")
def get_citizen_taxes(
    citizen_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Get all taxes for a specific citizen (must be in admin's org)"""
    # Verify citizen is in admin's organization
    citizen = db.query(User).filter(
        User.id == citizen_id,
        User.organization_id == admin.organization_id
    ).first()
    
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found in your organization")
    
    citizen_taxes = db.query(CitizenTax).filter(
        CitizenTax.citizen_id == citizen_id,
        CitizenTax.organization_id == admin.organization_id
    ).all()
    
    # Enrich with tax type names
    enriched = []
    for tax in citizen_taxes:
        tax_type = db.query(TaxType).filter(TaxType.id == tax.tax_type_id).first()
        enriched.append({
            "id": tax.id,
            "citizen_id": tax.citizen_id,
            "citizen_name": citizen.name,
            "tax_type_id": tax.tax_type_id,
            "tax_type_name": tax_type.name if tax_type else "Unknown",
            "amount_owed": tax.amount_owed,
            "is_paid": tax.is_paid,
            "paid_date": tax.paid_date,
            "created_at": tax.created_at
        })
    
    return enriched


@router.post("/admin/citizens/{citizen_id}/taxes")
def assign_tax_to_citizen(
    citizen_id: int,
    data: CitizenTaxCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Assign a tax to a citizen (admin only)"""
    # Verify citizen exists and is in admin's org
    citizen = db.query(User).filter(
        User.id == citizen_id,
        User.organization_id == admin.organization_id
    ).first()
    
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found in your organization")
    
    # Verify tax type exists
    tax_type = db.query(TaxType).filter(TaxType.id == data.tax_type_id).first()
    if not tax_type:
        raise HTTPException(status_code=404, detail="Tax type not found")
    
    # Check if tax already assigned
    existing = db.query(CitizenTax).filter(
        CitizenTax.citizen_id == citizen_id,
        CitizenTax.organization_id == admin.organization_id,
        CitizenTax.tax_type_id == data.tax_type_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="This citizen already has this tax assigned")
    
    citizen_tax = CitizenTax(
        citizen_id=citizen_id,
        organization_id=admin.organization_id,
        tax_type_id=data.tax_type_id,
        amount_owed=data.amount_owed
    )
    db.add(citizen_tax)
    db.commit()
    db.refresh(citizen_tax)
    
    return {
        "id": citizen_tax.id,
        "citizen_id": citizen_tax.citizen_id,
        "tax_type_id": citizen_tax.tax_type_id,
        "amount_owed": citizen_tax.amount_owed,
        "is_paid": citizen_tax.is_paid,
        "message": "Tax assigned successfully"
    }


# ===========================
# CITIZEN – VIEW OWN TAXES
# ===========================
@router.get("/citizen/my-taxes")
def get_my_taxes(
    db: Session = Depends(get_db),
    citizen: User = Depends(get_current_user)
):
    """Get all taxes for current logged-in citizen in their current org"""
    if citizen.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can view their own taxes")
    
    citizen_taxes = db.query(CitizenTax).filter(
        CitizenTax.citizen_id == citizen.id,
        CitizenTax.organization_id == citizen.organization_id
    ).all()
    
    # Enrich with tax type names
    enriched = []
    for tax in citizen_taxes:
        tax_type = db.query(TaxType).filter(TaxType.id == tax.tax_type_id).first()
        enriched.append({
            "id": tax.id,
            "citizen_id": tax.citizen_id,
            "tax_type_id": tax.tax_type_id,
            "tax_type_name": tax_type.name if tax_type else "Unknown",
            "amount_owed": tax.amount_owed,
            "is_paid": tax.is_paid,
            "paid_date": tax.paid_date,
            "created_at": tax.created_at,
            "updated_at": tax.updated_at
        })
    
    return enriched


@router.put("/citizen/taxes/{tax_id}/mark-paid")
def mark_tax_as_paid(
    tax_id: int,
    db: Session = Depends(get_db),
    citizen: User = Depends(get_current_user)
):
    """Mark a tax as paid (citizen can only mark their own taxes)"""
    if citizen.role != "citizen":
        raise HTTPException(status_code=403, detail="Only citizens can mark taxes as paid")
    
    # Verify the tax belongs to this citizen in their current org
    tax = db.query(CitizenTax).filter(
        CitizenTax.id == tax_id,
        CitizenTax.citizen_id == citizen.id,
        CitizenTax.organization_id == citizen.organization_id
    ).first()
    
    if not tax:
        raise HTTPException(status_code=404, detail="Tax not found or does not belong to you")
    
    tax.is_paid = True
    tax.paid_date = datetime.utcnow()
    db.commit()
    db.refresh(tax)
    
    # Get tax type name for response
    tax_type = db.query(TaxType).filter(TaxType.id == tax.tax_type_id).first()
    
    return {
        "id": tax.id,
        "tax_type_name": tax_type.name if tax_type else "Unknown",
        "is_paid": tax.is_paid,
        "paid_date": tax.paid_date,
        "message": "Tax marked as paid successfully"
    }
