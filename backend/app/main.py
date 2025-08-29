import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import GraphQLRouter
from app.schemas.schema import schema
from app.database.connection import create_tables

app = FastAPI(
    title="Crypto Portfolio Analyzer API",
    description="Real-time cryptocurrency portfolio tracking and analysis",
    version="1.0.0"
)

# Create database tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

# CORS middleware
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GraphQL endpoint
graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/cryptassist/graphql")

@app.get("/")
async def root():
    return {"message": "Crypto Portfolio Analyzer API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}