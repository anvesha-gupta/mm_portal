from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    owner = conn.execute(text("SELECT tableowner FROM pg_tables WHERE tablename = 'apps' AND schemaname = 'mm_portal'")).scalar()
    print("Table Owner:", owner)
    
    # Also check current user
    user = conn.execute(text("SELECT current_user")).scalar()
    print("Current User:", user)
