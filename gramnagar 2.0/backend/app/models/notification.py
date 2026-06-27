from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(str, enum.Enum):
    MEETING = "meeting"
    EVENT = "event"
    ALERT = "alert"
    GENERAL = "general"
    HOLIDAY = "holiday"
    ANNOUNCEMENT = "announcement"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Organization association
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    
    # Relations
    created_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )
    
    # Notification content
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    
    # Metadata
    category = Column(
    Enum(
        NotificationCategory,
        values_callable=lambda enum: [e.value for e in enum]
    ),
    default=NotificationCategory.GENERAL
    )

    priority = Column(
        Enum(
            NotificationPriority,
            values_callable=lambda enum: [e.value for e in enum]
        ),
        default=NotificationPriority.MEDIUM
    )

    
    # Dates
    publish_date = Column(DateTime(timezone=True), server_default=func.now())
    effective_date = Column(DateTime(timezone=True), nullable=False)  # When the notification becomes active
    expiry_date = Column(DateTime(timezone=True), nullable=True)  # When the notification expires
    
    # Status
    is_active = Column(Boolean, default=True)
    is_pinned = Column(Boolean, default=False)  # For important notifications that should stay visible
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )