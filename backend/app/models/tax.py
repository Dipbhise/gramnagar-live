from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base


class TaxType(Base):
    __tablename__ = "tax_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # "Water", "Electricity", "Light", etc.
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CitizenTax(Base):
    __tablename__ = "citizen_taxes"

    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign keys
    citizen_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    tax_type_id = Column(Integer, ForeignKey("tax_types.id"), nullable=False)
    
    # Tax details
    amount_owed = Column(Float, nullable=False)
    is_paid = Column(Boolean, default=False)
    paid_date = Column(DateTime(timezone=True), nullable=True)
    
    # Audit
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
