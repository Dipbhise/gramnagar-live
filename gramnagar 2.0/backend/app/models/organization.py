from sqlalchemy import Column, Integer, String
from app.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)  # "Gram Panchayat" or "Mahanagar Palika"
    type = Column(String, nullable=False, unique=True)  # "gram_panchayat" or "mahanagar_palika"
    description = Column(String, nullable=True)