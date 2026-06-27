from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SchemeCreate(BaseModel):
    title: str
    description: str
    eligibility: str
    benefits: str
    start_date: datetime
    end_date: Optional[datetime] = None
    is_active: bool = True
    gr_pdf_path: Optional[str] = None


class SchemeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    benefits: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    gr_pdf_path: Optional[str] = None


class SchemeOut(BaseModel):
    id: int
    title: str
    description: str
    eligibility: str
    benefits: str
    start_date: datetime
    end_date: Optional[datetime]
    is_active: bool
    gr_pdf_path: Optional[str]
    created_at: datetime
    organization_id: int
    organization_name: Optional[str] = None

    class Config:
        from_attributes = True
