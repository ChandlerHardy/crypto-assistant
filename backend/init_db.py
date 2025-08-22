#!/usr/bin/env python3
"""
Database initialization script for Crypto Portfolio App
Run this script to create all database tables
"""

import os
import sys
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from app.database.connection import create_tables, engine
from app.database.models import Base

def init_database():
    """Initialize the database with all tables"""
    print("Initializing database...")
    
    # Print database URL (without credentials for security)
    db_url = os.getenv("DATABASE_URL", "sqlite:///./crypto_portfolio.db")
    if "postgresql://" in db_url or "postgres://" in db_url:
        # Remove credentials from URL for display
        url_parts = db_url.split("@")
        if len(url_parts) > 1:
            host_part = url_parts[1]
            print(f"Connecting to PostgreSQL database: {host_part}")
        else:
            print("Connecting to PostgreSQL database")
    else:
        print(f"Using SQLite database: {db_url}")
    
    try:
        # Create all tables
        create_tables()
        print("✅ Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import text
        with engine.connect() as conn:
            if "sqlite" in db_url:
                result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
            else:
                result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
            tables = [row[0] for row in result]
            
        print(f"📋 Tables created: {', '.join(tables)}")
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    init_database()