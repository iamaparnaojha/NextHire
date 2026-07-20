"""
History Service.
"""
from datetime import datetime
from bson import ObjectId
from app.database import get_collection
from app.history.models import HistoryItemCreate

class HistoryService:
    @property
    def collection(self):
        return get_collection("history")

    async def save_history(self, user_id: str, item: HistoryItemCreate):
        document = item.model_dump()
        document["user_id"] = user_id
        document["created_at"] = datetime.utcnow()
        
        result = await self.collection.insert_one(document)
        document["id"] = str(result.inserted_id)
        
        # Avoid returning full content for lists if we just want a basic created response
        return document

    async def get_user_history(self, user_id: str):
        # Sort by newest first
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1)
        documents = await cursor.to_list(length=100)
        
        for doc in documents:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            
        return documents

    async def get_history_by_id(self, history_id: str, user_id: str):
        doc = await self.collection.find_one({"_id": ObjectId(history_id), "user_id": user_id})
        if doc:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
        return doc
