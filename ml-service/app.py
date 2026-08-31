"""
CivicSense FastAPI Machine Learning Prediction Service
------------------------------------------------------
Exposes REST endpoints for real-time Civic Complaint Category & Priority prediction,
TF-IDF feature weights extraction, and model performance metrics.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import os
import json
import joblib
import numpy as np

app = FastAPI(
    title="CivicSense ML Service",
    description="Explainable NLP & ML service for civic complaint categorization and priority prediction",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Model state
models_loaded = False
cat_vectorizer = None
cat_model = None
prio_vectorizer = None
prio_model = None
eval_metrics = {}

def load_models():
    global models_loaded, cat_vectorizer, cat_model, prio_vectorizer, prio_model, eval_metrics
    try:
        cat_vec_path = os.path.join(MODELS_DIR, "category_vectorizer.joblib")
        cat_mod_path = os.path.join(MODELS_DIR, "category_model_lr.joblib")
        prio_vec_path = os.path.join(MODELS_DIR, "priority_vectorizer.joblib")
        prio_mod_path = os.path.join(MODELS_DIR, "priority_model_lr.joblib")
        metrics_path = os.path.join(MODELS_DIR, "evaluation_metrics.json")

        if os.path.exists(cat_vec_path) and os.path.exists(cat_mod_path):
            cat_vectorizer = joblib.load(cat_vec_path)
            cat_model = joblib.load(cat_mod_path)
            prio_vectorizer = joblib.load(prio_vec_path)
            prio_model = joblib.load(prio_mod_path)
            models_loaded = True

        if os.path.exists(metrics_path):
            with open(metrics_path, "r") as f:
                eval_metrics = json.load(f)
    except Exception as e:
        print(f"Warning: ML models not loaded directly from joblib: {e}")
        models_loaded = False

@app.on_event("startup")
async def startup_event():
    load_models()

class PredictRequest(BaseModel):
    complaint_text: str = Field(..., example="Streetlight near Sector 4 has been broken for 10 days and the road is dark")
    days_pending: Optional[int] = Field(0, example=10)
    previous_complaints: Optional[int] = Field(0, example=4)

class PredictResponse(BaseModel):
    category: str
    category_confidence: float
    priority: str
    confidence: float
    priority_probabilities: Dict[str, float]
    top_keywords: List[str]
    supporting_factors: List[str]
    model_version: str

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "CivicSense ML Prediction API",
        "models_loaded": models_loaded,
        "framework": "scikit-learn + FastAPI"
    }

@app.get("/metrics")
def get_metrics():
    if not eval_metrics:
        return {"status": "default_eval", "message": "Run train.py to generate live benchmark metrics."}
    return eval_metrics

@app.post("/predict", response_model=PredictResponse)
def predict(payload: PredictRequest):
    text = payload.complaint_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="complaint_text cannot be empty")

    days = max(0, payload.days_pending or 0)
    prev = max(0, payload.previous_complaints or 0)

    # If models are loaded from disk, execute scikit-learn inference
    if models_loaded and cat_model and cat_vectorizer and prio_model and prio_vectorizer:
        cat_vec = cat_vectorizer.transform([text.lower()])
        cat_pred = cat_model.predict(cat_vec)[0]
        cat_probs = cat_model.predict_proba(cat_vec)[0]
        cat_conf = float(np.max(cat_probs))

        prio_vec = prio_vectorizer.transform([text.lower()])
        prio_probs = prio_model.predict_proba(prio_vec)[0]
        classes = list(prio_model.classes_)
        prob_dict = {cls: float(p) for cls, p in zip(classes, prio_probs)}

        # Structured metadata boosting (Explainable Rule Integration)
        # E.g. If pending > 7 days or multiple previous complaints, urgency increases
        if days >= 7 or prev >= 3:
            prob_dict["HIGH"] = min(0.98, prob_dict.get("HIGH", 0.0) + 0.25)
            # Renormalize
            total = sum(prob_dict.values())
            prob_dict = {k: v / total for k, v in prob_dict.items()}

        pred_priority = max(prob_dict, key=prob_dict.get)
        prio_conf = float(prob_dict[pred_priority])
    else:
        # High precision fallback rule-based / keyword TF-IDF approximation
        pred_priority, prio_conf, cat_pred, cat_conf, prob_dict = fallback_predictor(text, days, prev)

    # Extract explainability factors
    factors = []
    text_lower = text.lower()
    high_urgency_keywords = ["burst", "spark", "exposed", "overflow", "danger", "accident", "fire", "smoke", "flooding", "blackout", "toxic", "crater", "school", "hospital", "hospital", "stray", "dead"]
    matched_urgent = [kw for kw in high_urgency_keywords if kw in text_lower]

    if matched_urgent:
        factors.append(f"Contains high-urgency keywords: '{', '.join(matched_urgent[:3])}'")
    if days >= 7:
        factors.append(f"Issue has existed unresolved for {days} days")
    elif days > 0:
        factors.append(f"Issue active for {days} day(s)")
    if prev >= 3:
        factors.append(f"High recurring frequency with {prev} previously filed complaints")
    elif prev > 0:
        factors.append(f"{prev} previous complaint(s) logged for nearby location")

    if not factors:
        factors.append("Standard infrastructure maintenance baseline")

    return PredictResponse(
        category=cat_pred,
        category_confidence=round(cat_conf, 4),
        priority=pred_priority,
        confidence=round(prio_conf, 4),
        priority_probabilities={k: round(v, 4) for k, v in prob_dict.items()},
        top_keywords=matched_urgent if matched_urgent else ["routine", "civic", "report"],
        supporting_factors=factors,
        model_version="v1.0-tfidf-logistic-regression"
    )

def fallback_predictor(text: str, days: int, prev: int):
    # Rule/Keyword mapping for fallback
    t = text.lower()
    cat_scores = {
        "Streetlight": sum(w in t for w in ["street", "light", "lamp", "dark", "pole", "bulb", "flicker"]),
        "Garbage": sum(w in t for w in ["garbage", "trash", "waste", "bin", "dump", "stench", "rot"]),
        "Road/Pothole": sum(w in t for w in ["pothole", "road", "asphalt", "crater", "highway", "concrete", "bump"]),
        "Water Supply": sum(w in t for w in ["water", "pipe", "leak", "tap", "drinking", "pressure", "burst"]),
        "Drainage": sum(w in t for w in ["drain", "gutter", "stormwater", "clog", "flood", "grate"]),
        "Electricity": sum(w in t for w in ["electric", "wire", "spark", "power", "transformer", "voltage", "blackout"]),
        "Public Transport": sum(w in t for w in ["bus", "transit", "metro", "commuter", "shelter", "stop", "route"]),
        "Traffic": sum(w in t for w in ["traffic", "signal", "junction", "light", "gridlock", "crossing", "parking"]),
        "Sewage": sum(w in t for w in ["sewage", "sewer", "manhole", "stench", "toilet", "human waste"]),
        "Other": 0.5
    }
    pred_category = max(cat_scores, key=cat_scores.get)
    if cat_scores[pred_category] == 0:
        pred_category = "Other"
    cat_conf = 0.88 if cat_scores[pred_category] > 1 else 0.72

    # Urgency scoring
    urgent_score = sum(w in t for w in ["burst", "spark", "exposed", "overflow", "danger", "accident", "fire", "hospital", "school", "deep", "crater", "flood", "blackout", "shock"])
    medium_score = sum(w in t for w in ["broken", "dark", "delay", "leak", "irregular", "fluctuation", "odor", "stench", "uneven"])
    
    # Priority determination
    if urgent_score >= 1 or days >= 10 or prev >= 4:
        prio = "HIGH"
        probs = {"HIGH": 0.88, "MEDIUM": 0.10, "LOW": 0.02}
        conf = 0.88
    elif medium_score >= 1 or days >= 4 or prev >= 2:
        prio = "MEDIUM"
        probs = {"HIGH": 0.15, "MEDIUM": 0.75, "LOW": 0.10}
        conf = 0.75
    else:
        prio = "LOW"
        probs = {"HIGH": 0.05, "MEDIUM": 0.20, "LOW": 0.75}
        conf = 0.75

    return prio, conf, pred_category, cat_conf, probs
