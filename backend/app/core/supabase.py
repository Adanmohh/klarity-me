import os
from supabase import create_client, Client
from typing import Optional
from app.core.config import settings

class SupabaseClient:
    _client: Optional[Client] = None
    
    @classmethod
    def get_client(cls) -> Client:
        if cls._client is None:
            supabase_url = settings.SUPABASE_URL or os.getenv("SUPABASE_URL")
            supabase_key = settings.SUPABASE_ANON_KEY or os.getenv("SUPABASE_ANON_KEY")
            
            if not supabase_url or not supabase_key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set in environment variables")
            
            cls._client = create_client(supabase_url, supabase_key)
        
        return cls._client

def get_supabase() -> Client:
    return SupabaseClient.get_client()