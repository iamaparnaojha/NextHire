"""
History API Routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.dependencies import get_current_user
from app.history.models import HistoryItemCreate, HistoryItemResponse
from app.history.service import HistoryService

router = APIRouter()
service = HistoryService()

@router.post("/", response_model=HistoryItemResponse, status_code=status.HTTP_201_CREATED)
async def create_history(
    item: HistoryItemCreate,
    user: dict = Depends(get_current_user)
):
    """Save a new history item for the user."""
    return await service.save_history(user["_id"], item)

@router.get("/")
async def list_history(user: dict = Depends(get_current_user)):
    """Get all history items for the user."""
    return await service.get_user_history(user["_id"])

@router.get("/{history_id}")
async def get_history(history_id: str, user: dict = Depends(get_current_user)):
    """Get a specific history item."""
    item = await service.get_history_by_id(history_id, user["_id"])
    if not item:
        raise HTTPException(status_code=404, detail="History not found")
    return item
