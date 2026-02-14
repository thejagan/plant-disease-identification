from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from model import classifier
import uvicorn
import io
import os
from PIL import Image

app = FastAPI(title="Plant Disease Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve Frontend Static Files
app.mount("/static", StaticFiles(directory="frontend"), name="static")

# Serve index.html at root
@app.get("/")
async def read_index():
    return FileResponse('frontend/index.html')

# Serve other static files directly if needed (like style.css being at root in html)
@app.get("/{filename}")
async def read_static(filename: str):
    file_path = os.path.join("frontend", filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "File not found"}

@app.post("/predict")
async def predict_disease(file: UploadFile = File(...)):
    # Read the image file
    contents = await file.read()
    
    # Optional: Validate it's an image using PIL
    try:
        image = Image.open(io.BytesIO(contents))
        image.verify()  # verify that it is, in fact an image
    except Exception:
        return {"error": "Invalid image file"}

    # Get prediction from the model
    result = classifier.predict(contents)
    
    return {
        "filename": file.filename,
        "prediction": result["class"],
        "confidence": result["confidence"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
