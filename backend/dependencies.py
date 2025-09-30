from functools import lru_cache

from supabase import Client, create_client

from config import settings


@lru_cache(maxsize=1)
def _get_supabase_client() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_supabase() -> Client:
    return _get_supabase_client()
