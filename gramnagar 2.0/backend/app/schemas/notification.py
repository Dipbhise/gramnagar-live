from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationCategory(str, Enum):
    MEETING = "meeting"
    EVENT = "event"
    ALERT = "alert"
    GENERAL = "general"
    HOLIDAY = "holiday"
    ANNOUNCEMENT = "announcement"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            return cls(value.lower())


# Create schema
class NotificationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1)
    category: NotificationCategory = NotificationCategory.GENERAL
    priority: NotificationPriority = NotificationPriority.MEDIUM
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    is_pinned: bool = False


# Update schema
class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[NotificationCategory] = None
    priority: Optional[NotificationPriority] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    is_active: Optional[bool] = None
    is_pinned: Optional[bool] = None


# Response schema for individual notification
class NotificationOut(BaseModel):
    id: int
    title: str
    description: str
    category: NotificationCategory
    priority: NotificationPriority
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    is_active: bool
    is_pinned: bool
    created_by_name: Optional[str] = None
    organization_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response schema for notification list items
class NotificationListItem(BaseModel):
    id: int
    title: str
    description: str
    category: NotificationCategory
    priority: NotificationPriority
    effective_date: datetime
    expiry_date: Optional[datetime] = None
    is_active: bool
    is_pinned: bool
    created_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True