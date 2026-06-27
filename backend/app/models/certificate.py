from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class CertificateType(Base):
    __tablename__ = "certificate_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # "birth_certificate", "income_certificate", etc.
    display_name = Column(String, nullable=False)  # "Birth Certificate", "Income Certificate", etc.
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    required_fields = Column(Text, nullable=True)  # JSON string of required fields
    template_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


class CertificateApplication(Base):
    __tablename__ = "certificate_applications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Relations
    citizen_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    reviewed_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    # Application details
    application_number = Column(String, unique=True, nullable=True)  # Generated application number
    certificate_type_id = Column(Integer, ForeignKey("certificate_types.id"), nullable=False)
    form_data = Column(Text, nullable=False)  # JSON string of filled form data
    supporting_documents = Column(Text, nullable=True)  # JSON string of uploaded document paths
    
    # Status: pending → under_review → approved/rejected
    status = Column(String, default="pending", index=True)
    admin_remarks = Column(Text, nullable=True)
    
    # Timestamps
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    certificate_number = Column(String, nullable=True)  # Generated certificate number
    issued_at = Column(DateTime(timezone=True), nullable=True)
    certificate_path = Column(String, nullable=True)  # Path to generated certificate
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )