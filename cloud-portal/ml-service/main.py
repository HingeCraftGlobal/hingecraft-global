from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sentence_transformers import SentenceTransformer
import os
import time

app = FastAPI(title="ML Brain Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model
model = None

@app.on_event("startup")
async def load_model():
    global model
    print("🔄 Loading ML model...")
    model_name = os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2")
    model = SentenceTransformer(model_name)
    print("✅ Model loaded successfully")

@app.get("/health")
async def health():
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    return {
        "status": "healthy",
        "model": os.getenv("MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"),
        "ready": model is not None
    }

@app.get("/embed")
async def embed(text: str):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        embedding = model.encode(text, convert_to_numpy=True).tolist()
        return {"embedding": embedding, "dimension": len(embedding)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

