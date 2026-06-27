from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class TaxTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None


class TaxTypeOut(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        from_attributes = True


class CitizenTaxCreate(BaseModel):
    citizen_id: int
    tax_type_id: int
    amount_owed: float


class CitizenTaxUpdate(BaseModel):
    amount_owed: Optional[float] = None
    is_paid: Optional[bool] = None


class CitizenTaxOut(BaseModel):
    id: int
    citizen_id: int
    organization_id: int
    tax_type_id: int
    amount_owed: float
    is_paid: bool
    paid_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tax_type_name: Optional[str] = None  # Will be enriched from TaxType
    citizen_name: Optional[str] = None   # Will be enriched from User

    class Config:
        from_attributes = True


class CitizenTaxListItem(BaseModel):
    id: int
    citizen_id: int
    citizen_name: Optional[str]
    tax_type_id: int
    tax_type_name: str
    amount_owed: float
    is_paid: bool
    paid_date: Optional[datetime]
    created_at: datetime
