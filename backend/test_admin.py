import sqlalchemy
from sqlalchemy import create_engine, text

# Try different combinations of user and password to connect as owner
db_urls = [
    "postgresql+psycopg2://admin:MmPortal%402026%23App@35.154.90.17:5432/mm_portal",
    "postgresql+psycopg2://postgres:MmPortal%402026%23App@35.154.90.17:5432/mm_portal",
    "postgresql+psycopg2://admin:admin@35.154.90.17:5432/mm_portal",
    "postgresql+psycopg2://postgres:postgres@35.154.90.17:5432/mm_portal"
]

for url in db_urls:
    try:
        engine = create_engine(url)
        with engine.connect() as conn:
            user = conn.execute(text("SELECT current_user")).scalar()
            print(f"SUCCESS: connected to {url} as current_user: {user}")
            break
    except Exception as e:
        print(f"FAILED: {url} -> {e}")
