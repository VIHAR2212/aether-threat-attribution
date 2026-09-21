import sqlite3
import os
from app.db import Base, engine

db_path = "aether_dev.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    cur.execute("PRAGMA table_info(cases)")
    cols = [r[1] for r in cur.fetchall()]
    
    if "status" not in cols:
        print("Adding status to cases")
        cur.execute("ALTER TABLE cases ADD COLUMN status VARCHAR(32) DEFAULT 'ACTIVE'")
    if "target_url" not in cols:
        print("Adding target_url to cases")
        cur.execute("ALTER TABLE cases ADD COLUMN target_url VARCHAR(512) DEFAULT ''")
    if "target_type" not in cols:
        print("Adding target_type to cases")
        cur.execute("ALTER TABLE cases ADD COLUMN target_type VARCHAR(64) DEFAULT 'onion'")
        
    cur.execute("UPDATE cases SET status = 'ACTIVE' WHERE status IS NULL")
    cur.execute("UPDATE cases SET target_url = onion_url WHERE target_url IS NULL OR target_url = ''")
    cur.execute("UPDATE cases SET target_type = 'onion' WHERE target_type IS NULL OR target_type = ''")
    
    conn.commit()
    conn.close()

# Ensure any new tables (evidence_records, evidence_correlations, audit_logs) are created
Base.metadata.create_all(bind=engine)
print("All tables and columns migrated successfully!")
