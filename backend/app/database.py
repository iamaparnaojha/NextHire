"""
MongoDB Connection using Motor (async driver).
Provides a singleton database instance used across the application.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

# Module-level client and db references
client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Initialize MongoDB connection."""
    global client, db
    print(f"⚡ Connecting to MongoDB...")
    client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        maxPoolSize=50,
        minPoolSize=10,
        serverSelectionTimeoutMS=5000,
    )
    db = client[settings.MONGODB_DB_NAME]
    # Verify connection
    try:
        await client.admin.command("ping")
        print(f"✅ Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed.")


def get_database():
    """Get the database instance."""
    return db


def get_collection(name: str):
    """Get a specific collection from the database."""
    return db[name]
