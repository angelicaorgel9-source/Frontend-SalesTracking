from functools import lru_cache

from django.conf import settings
from pymongo import MongoClient


@lru_cache(maxsize=1)
def get_mongo_client():
    if not settings.MONGO_URI:
        raise RuntimeError('MONGO_URI is not configured.')
    return MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=5000)


def get_mongo_database():
    return get_mongo_client()[settings.MONGO_DB_NAME]