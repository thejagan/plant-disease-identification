import random
import time

class PlantDiseaseClassifier:
    def __init__(self):
        # In a real scenario, load your model here (e.g., tensorflow, pytorch)
        # self.model = load_model("path/to/model.h5")
        self.classes = [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Blueberry___healthy",
            "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy",
            "Grape___Black_rot", "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)",
            "Peach___Bacterial_spot", "Peach___healthy",
            "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy",
            "Potato___Early_blight", "Potato___Late_blight", "Potato___healthy",
            "Raspberry___healthy",
            "Soybean___healthy",
            "Squash___Powdery_mildew",
            "Strawberry___Leaf_scorch", "Strawberry___healthy",
            "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
        ]
        
        # Knowledge Base: Map keywords or specific classes to info
        self.knowledge_base = {
            "healthy": {
                "description": "Your plant looks vibrant and healthy! No signs of disease detected.",
                "treatment": [
                    "Continue regular watering and fertilization schedules.",
                    "Monitor for pests occasionally.",
                    "Ensure adequate sunlight."
                ]
            },
            "Scab": {
                "description": "Scab is a fungal disease that causes dark, scabby spots on fruit and leaves.",
                "treatment": [
                    "Prune and destroy infected plant parts.",
                    "Apply fungicides such as Captan or Sulfur.",
                    "Improve air circulation around the plant."
                ]
            },
            "Rot": {
                "description": "Rot indicates fungal or bacterial decay, often due to excess moisture.",
                "treatment": [
                    "Remove affecting parts immediately.",
                    "Avoid overhead watering; water at the base.",
                    "Ensure soil has good drainage."
                ]
            },
            "Rust": {
                "description": "Rust appears as reddish-orange powdery spots on leaves.",
                "treatment": [
                    "Remove infected leaves.",
                    "Apply copper-based fungicides.",
                    "Space plants directly to reduce humidity."
                ]
            },
            "Mildew": {
                "description": "Powdery mildew looks like white flour dusted on leaves.",
                "treatment": [
                    "Apply neem oil or sulfur-based fungicides.",
                    "Water early in the day so leaves dry out.",
                    "Prune overcrowded areas."
                ]
            },
            "Blight": {
                "description": "Blight causes rapid browning and death of plant tissue.",
                "treatment": [
                    "Apply fungicides containing mancozeb or copper.",
                    "Rotate crops yearly.",
                    "Burn or deeply bury infected plant debris."
                ]
            },
            "Virus": {
                "description": "Viral infections often cause yellowing, mottling, or curling of leaves.",
                "treatment": [
                    "There is no cure for viral infections.",
                    "Remove and destroy the entire infected plant to prevent spread.",
                    "Control aphids/pests that spread the virus."
                ]
            },
            "Mite": {
                "description": "Spider mites cause stippling (tiny yellow spots) and webbing on leaves.",
                "treatment": [
                    "Spray with strong stream of water to dislodge mites.",
                    "Apply insecticidal soap or neem oil.",
                    "Introduce predatory mites."
                ]
            },
             "Spot": {
                "description": "Leaf spots are often caused by bacteria or fungi.",
                "treatment": [
                    "Remove affected leaves.",
                    "Avoid wetting foliage when watering.",
                    "Apply copper fungicide if severe."
                ]
            }
        }
        print("Model loaded (Simulated)")

    def get_info(self, disease_name):
        # specific check
        for key, info in self.knowledge_base.items():
            if key.lower() in disease_name.lower():
                return info
        
        # Default fallback
        return {
            "description": "A plant disease affecting leaf health.",
            "treatment": [
                "Isolate the plant.",
                "Consult a local expert.",
                "Ensure proper watering and light."
            ]
        }

    def predict(self, image_bytes):
        # Simulate processing time
        time.sleep(1)
        
        # Mock prediction logic
        predicted_class = random.choice(self.classes)
        confidence = random.uniform(0.75, 0.99)
        
        info = self.get_info(predicted_class)
        
        return {
            "class": predicted_class,
            "confidence": confidence,
            "description": info["description"],
            "treatment": info["treatment"]
        }

# Singleton instance
classifier = PlantDiseaseClassifier()
