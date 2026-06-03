"""MongoDB connection — single source of truth for `client` and `db`.

Imported by server.py and any router/service module that needs to query Mongo.
Lazy-evaluated at module import so the connection is shared across the
application lifecycle.
"""
import os

from motor.motor_asyncio import AsyncIOMotorClient

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
