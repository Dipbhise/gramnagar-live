from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    role = Column(String, default="citizen")
    
    # Organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)

    village = Column(String, nullable=True)
    area = Column(String, nullable=True)
