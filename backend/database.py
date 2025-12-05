from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/richup")

class Database:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        try:
            self.client = AsyncIOMotorClient(MONGO_URL)
            self.db = self.client.richup
            print("Connected to MongoDB")
        except Exception as e:
            print(f"MongoDB connection error: {e}")

    def close(self):
        if self.client:
            self.client.close()
            print("Disconnected from MongoDB")

db = Database()
