"""
Auth Routes — Register, Login, and Get Current User endpoints.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime, timezone
from bson import ObjectId

from app.auth.models import UserRegister, UserLogin, AuthResponse, UserResponse
from app.auth.service import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.database import get_collection

router = APIRouter()


# ──────────────────────────────────────────────
#  POST /api/auth/register
# ──────────────────────────────────────────────
@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user.
    - Checks if email already exists
    - Hashes password with bcrypt
    - Creates user document in MongoDB
    - Returns JWT token + user data
    """
    users = get_collection("users")

    # Check for existing user
    existing = await users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    # Create user document
    user_doc = {
        "name": user_data.name.strip(),
        "email": user_data.email.lower().strip(),
        "password": hash_password(user_data.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Generate JWT token
    token = create_access_token(user_id, user_doc["email"])

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"],
            created_at=user_doc["created_at"],
        ),
    )


# ──────────────────────────────────────────────
#  POST /api/auth/login
# ──────────────────────────────────────────────
@router.post("/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    """
    Authenticate user with email + password.
    Returns JWT token + user data on success.
    """
    users = get_collection("users")

    # Find user by email
    user = await users.find_one({"email": user_data.email.lower().strip()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    token = create_access_token(user_id, user["email"])

    return AuthResponse(
        token=token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            created_at=user.get("created_at"),
        ),
    )


# ──────────────────────────────────────────────
#  GET /api/auth/me
# ──────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    """
    Get the currently authenticated user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return UserResponse(
        id=user["_id"],
        name=user["name"],
        email=user["email"],
        created_at=user.get("created_at"),
    )
