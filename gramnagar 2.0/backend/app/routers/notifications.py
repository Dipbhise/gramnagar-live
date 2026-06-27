from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from datetime import datetime, timedelta
from typing import List

from app.deps import get_db, require_role, get_current_user
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import (
    NotificationCreate, 
    NotificationUpdate, 
    NotificationOut, 
    NotificationListItem
)

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


def enrich_notifications(notifications: List[Notification], db: Session) -> List[dict]:
    """Attach creator names to notifications"""
    enriched = []
    for notification in notifications:
        notification_dict = {
            "id": notification.id,
            "title": notification.title,
            "description": notification.description,
            "category": notification.category,
            "priority": notification.priority,
            "effective_date": notification.effective_date,
            "expiry_date": notification.expiry_date,
            "is_active": notification.is_active,
            "is_pinned": notification.is_pinned,
            "organization_id": notification.organization_id,
            "created_at": notification.created_at,
            "updated_at": notification.updated_at,
            "created_by_name": None
        }
        
        # Get creator name
        creator = db.query(User).filter(User.id == notification.created_by).first()
        if creator:
            notification_dict["created_by_name"] = creator.name
            
        enriched.append(notification_dict)
    
    return enriched


# =========================
# ADMIN – MANAGE NOTIFICATIONS
# =========================
@router.post("/", response_model=NotificationOut)
def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Create a new notification"""
    # Validate dates
    if notification_data.expiry_date and notification_data.effective_date >= notification_data.expiry_date:
        raise HTTPException(status_code=400, detail="Effective date must be before expiry date")
    
    # Validate effective date is not in the past (with 1 minute buffer)
    # Convert to naive datetime for comparison since SQLite doesn't handle timezones well
    current_time = datetime.now()
    effective_date_naive = notification_data.effective_date.replace(tzinfo=None) if notification_data.effective_date.tzinfo else notification_data.effective_date
    # Allow 1 minute buffer to account for network latency and processing time
    if effective_date_naive < current_time - timedelta(minutes=1):
        raise HTTPException(status_code=400, detail="Effective date cannot be in the past")
    
    notification = Notification(
        title=notification_data.title,
        description=notification_data.description,
        category=notification_data.category,
        priority=notification_data.priority,
        effective_date=notification_data.effective_date,
        expiry_date=notification_data.expiry_date,
        is_pinned=notification_data.is_pinned,
        organization_id=admin.organization_id,
        created_by=admin.id
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    # Enrich with creator name
    enriched = enrich_notifications([notification], db)[0]
    return enriched


@router.get("/admin", response_model=List[NotificationListItem])
def list_admin_notifications(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """List all notifications for admin's organization"""
    notifications = (
        db.query(Notification)
        .filter(Notification.organization_id == admin.organization_id)
        .order_by(desc(Notification.is_pinned), desc(Notification.created_at))
        .all()
    )
    
    # Enrich with creator names
    return enrich_notifications(notifications, db)


@router.get("/admin/{notification_id}", response_model=NotificationOut)
def get_admin_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Get a specific notification for admin"""
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.organization_id == admin.organization_id
        )
        .first()
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Enrich with creator name
    enriched = enrich_notifications([notification], db)[0]
    return enriched


@router.put("/admin/{notification_id}", response_model=NotificationOut)
def update_notification(
    notification_id: int,
    update_data: NotificationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Update a notification"""
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.organization_id == admin.organization_id
        )
        .first()
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Validate dates if provided
    effective_date = update_data.effective_date or notification.effective_date
    expiry_date = update_data.expiry_date or notification.expiry_date
    
    if expiry_date and effective_date >= expiry_date:
        raise HTTPException(status_code=400, detail="Effective date must be before expiry date")
    
    # Update fields
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(notification, key, value)
    
    notification.updated_at = datetime.now()
    
    db.commit()
    db.refresh(notification)
    
    # Enrich with creator name
    enriched = enrich_notifications([notification], db)[0]
    return enriched


@router.delete("/admin/{notification_id}")
def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("admin"))
):
    """Delete a notification"""
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.organization_id == admin.organization_id
        )
        .first()
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    
    return {"message": "Notification deleted successfully"}


# =========================
# CITIZEN – VIEW NOTIFICATIONS
# =========================
@router.get("/", response_model=List[NotificationListItem])
def list_citizen_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    """List active notifications for citizen's organization"""
    now = datetime.now()
    
    notifications = (
        db.query(Notification)
        .filter(
            Notification.organization_id == user.organization_id,
            Notification.is_active == True,
            Notification.effective_date <= now,
            or_(
                Notification.expiry_date.is_(None),
                Notification.expiry_date > now
            )
        )
        .order_by(
            desc(Notification.is_pinned),
            desc(Notification.priority),
            desc(Notification.created_at)
        )
        .all()
    )
    
    # Enrich with creator names
    return enrich_notifications(notifications, db)


@router.get("/{notification_id}", response_model=NotificationOut)
def get_citizen_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("citizen"))
):
    """Get a specific notification for citizen"""
    now = datetime.now()
    
    notification = (
        db.query(Notification)
        .filter(
            Notification.id == notification_id,
            Notification.organization_id == user.organization_id,
            Notification.is_active == True,
            Notification.effective_date <= now,
            or_(
                Notification.expiry_date.is_(None),
                Notification.expiry_date > now
            )
        )
        .first()
    )
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    # Enrich with creator name
    enriched = enrich_notifications([notification], db)[0]
    return enriched