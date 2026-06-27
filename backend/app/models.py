from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="citizen")  # citizen | worker | admin
    village = Column(String)
    area = Column(String)

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True)

    citizen_id = Column(Integer, ForeignKey("users.id"))
    worker_id = Column(Integer, nullable=True)

    manual_address = Column(String)
    village = Column(String)
    area = Column(String)
    pincode = Column(String)

    latitude = Column(Float)
    longitude = Column(Float)

    photo_path = Column(String)

    status = Column(String, default="pending")

    completed_photo_path = Column(String)
    completed_latitude = Column(Float)
    completed_longitude = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True))
