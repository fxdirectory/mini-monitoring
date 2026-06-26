import os

class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "CHANGE_ME_SECRET_KEY"
    )

    JWT_EXPIRE_HOURS = 8