from functools import lru_cache

from supabase import Client, create_client

from backend.config import settings
# from services.rl_engine import ChronotypeRLEngine


@lru_cache(maxsize=1)
def _get_supabase_client() -> Client:
    key = settings.supabase_service_role_key or settings.supabase_anon_key
    return create_client(settings.supabase_url, key)


def get_supabase() -> Client:
    return _get_supabase_client()


# @lru_cache(maxsize=1)
# def _get_rl_engine_instance() -> ChronotypeRLEngine:
#     return ChronotypeRLEngine()


# def get_rl_engine() -> ChronotypeRLEngine:
#     return _get_rl_engine_instance()
