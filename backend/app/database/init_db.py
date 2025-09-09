"""
Database initialization script
Run this to create/recreate the database with the new schema including user authentication
"""

import os
from app.database.connection import engine, create_tables
from app.database.models import Base

def init_database():
    """Initialize database with new schema"""
    print("Creating database tables...")
    
    # Drop all tables and recreate (for development only)
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    print("Database initialized successfully!")
    print("Tables created:")
    for table_name in Base.metadata.tables.keys():
        print(f"  - {table_name}")

if __name__ == "__main__":
    init_database()