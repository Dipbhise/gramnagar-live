from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)

    # organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    # relations
    citizen_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    worker_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )

    # manual address
    address = Column(String, nullable=False)
    village = Column(String, default="")
    area = Column(String, default="")

    # gps
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # images
    photo_path = Column(String, nullable=False)
    completed_photo_path = Column(String, nullable=True)

    # status lifecycle:
    # pending → assigned → in_progress → completed
    status = Column(String, default="pending", index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
