from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import json


class CertificateTypeCreate(BaseModel):
    name: str
    display_name: str
    description: Optional[str] = None
    is_active: bool = True
    required_fields: Optional[str] = None  # JSON string of required fields
    template_path: Optional[str] = None


class CertificateTypeUpdate(BaseModel):
    display_name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    required_fields: Optional[str] = None
    template_path: Optional[str] = None


class CertificateTypeOut(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str]
    is_active: bool
    required_fields: Optional[str]
    template_path: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CertificateApplicationCreate(BaseModel):
    certificate_type_id: int
    form_data: str  # JSON string of form data
    supporting_documents: Optional[str] = None  # JSON string of document paths


class CertificateApplicationUpdate(BaseModel):
    form_data: Optional[str] = None
    supporting_documents: Optional[str] = None


class CertificateApplicationReview(BaseModel):
    status: str  # "approved", "rejected"
    admin_remarks: Optional[str] = None


class CertificateApplicationOut(BaseModel):
    id: int
    application_number: Optional[str]
    citizen_id: int
    organization_id: int
    certificate_type_id: int
    form_data: str
    supporting_documents: Optional[str]
    status: str
    admin_remarks: Optional[str]
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    approved_at: Optional[datetime]
    certificate_number: Optional[str]
    issued_at: Optional[datetime]
    certificate_path: Optional[str]
    created_at: datetime
    updated_at: datetime
    citizen_name: Optional[str] = None
    certificate_type_name: Optional[str] = None

    class Config:
        from_attributes = True


class CertificateApplicationListItem(BaseModel):
    id: int
    application_number: Optional[str]
    citizen_id: int
    citizen_name: Optional[str]
    certificate_type_id: int
    certificate_type_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True