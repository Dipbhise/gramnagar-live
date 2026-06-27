from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)

    # organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    eligibility = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)

    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)

    is_active = Column(Boolean, default=True)

    # GR (Government Resolution) PDF file path
    gr_pdf_path = Column(String, nullable=True)

    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )
