from database import engine
from sqlalchemy import text

try:
    with engine.begin() as conn:
        conn.execute(text("UPDATE mm_portal.apps SET long_description = 'Test JSON' WHERE id = 'wyngs'"))
        print("UPDATE succeeded!")
except Exception as e:
    print("UPDATE failed:", e)
