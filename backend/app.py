# app.py
import os
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from fastapi.middleware.cors import CORSMiddleware

MODEL_FILE = os.getenv("MODEL_FILE", "heart_model.pkl")

app = FastAPI(title="HeartPredict API")

# allow local frontend dev at port 5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input schema: fields your frontend will send (match your Form fields)
class Features(BaseModel):
    age: float
    sex: Optional[Any] = 1
    cp: Optional[Any] = 0
    trestbps: float
    chol: float
    fbs: Optional[Any] = 0
    restecg: Optional[Any] = 0
    thalch: Optional[Any] = None   # accept thalch or thalach
    thalach: Optional[Any] = None  # allow either name
    exang: Optional[Any] = 0
    oldpeak: Optional[float] = 0.0
    slope: Optional[Any] = 1
    ca: Optional[int] = 0
    thal: Optional[Any] = 1
    dataset: Optional[Any] = 0

class PredictResponse(BaseModel):
    prediction: int
    probability: float
    raw: Optional[Dict[str, Any]] = None

MODEL = None

def load_model(path):
    global MODEL
    if not os.path.exists(path):
        raise FileNotFoundError(f"Model file not found at {path}")
    with open(path, "rb") as f:
        MODEL = pickle.load(f)
    return MODEL

@app.on_event("startup")
def startup_event():
    try:
        m = load_model(MODEL_FILE)
        print("Loaded model from", MODEL_FILE, "type:", type(m))
    except Exception as e:
        print("Error loading model:", e)
        raise

# --- Helpers and feature construction (model expects 14 features) ---

FEATURE_ORDER = [
    "age","sex","dataset","cp","trestbps","chol","fbs","restecg",
    "thalch","exang","oldpeak","slope","ca","thal"
]

def to_float(v, default=0.0):
    try:
        return float(v)
    except Exception:
        return default

def map_bool(v):
    if v in (True, False): return int(v)
    if isinstance(v, (int, float)): return int(bool(v))
    s = str(v).strip().lower()
    return 1 if s in ("1","true","t","yes","y") else 0

def map_sex(v):
    if isinstance(v,(int,float)): return int(v)
    s = str(v).strip().lower()
    if s in ("m","male","1","true","t","yes","y"): return 1
    return 0

def map_cp(v):
    if isinstance(v,(int,float)): 
        try: return int(v)
        except: return 0
    s=str(v).strip().lower()
    if s.startswith("typ"): return 0
    if s.startswith("aty"): return 1
    if s.startswith("non"): return 2
    if s.startswith("asy"): return 3
    try: return int(float(s))
    except: return 0

def map_restecg(v):
    if v is None: return 0
    if isinstance(v,(int,float)): 
        try: return int(v)
        except: return 0
    s=str(v).strip().lower()
    if "normal" in s: return 0
    if "st" in s or "abnormal" in s: return 1
    if "left" in s: return 2
    try: return int(float(s))
    except: return 0

def map_slope(v):
    if v is None: return 1
    if isinstance(v,(int,float)):
        try: return int(v)
        except: return 1
    s=str(v).strip().lower()
    if s.startswith("up"): return 2
    if s.startswith("flat"): return 1
    if s.startswith("down"): return 0
    try: return int(float(s))
    except: return 1

def map_thal(v):
    if v is None: return 1
    if isinstance(v,(int,float)):
        try: return int(v)
        except: return 1
    s=str(v).strip().lower()
    if "normal" in s: return 1
    if "fixed" in s: return 2
    if "reversible" in s: return 3
    try: return int(float(s))
    except: return 1

def construct_input_vector(payload: dict):
    """
    Build a 1x14 numpy array in the exact FEATURE_ORDER.
    Accepts payload dict (the JSON body) and handles common alternate keys.
    """
    def get_any(keys, default=None):
        for k in keys:
            if k in payload and payload[k] is not None:
                return payload[k]
        return default

    v = []
    for feat in FEATURE_ORDER:
        if feat == "age":
            val = get_any(["age"], 0.0)
            v.append(to_float(val, 0.0))
        elif feat == "sex":
            val = get_any(["sex","gender"], 1)
            v.append(map_sex(val))
        elif feat == "dataset":
            val = get_any(["dataset"], 0)
            try:
                v.append(int(float(val)))
            except:
                v.append(0)
        elif feat == "cp":
            val = get_any(["cp","chestpain","chest_pain"], 0)
            v.append(map_cp(val))
        elif feat == "trestbps":
            val = get_any(["trestbps","trest_bp","trest_bp"], 0.0)
            v.append(to_float(val,0.0))
        elif feat == "chol":
            val = get_any(["chol","cholesterol"], 0.0)
            v.append(to_float(val,0.0))
        elif feat == "fbs":
            val = get_any(["fbs","fasting_bs"], 0)
            v.append(map_bool(val))
        elif feat == "restecg":
            val = get_any(["restecg","rest_ecg"], 0)
            v.append(map_restecg(val))
        elif feat == "thalch":
            # accept either 'thalch' or 'thalach'
            val = None
            for name in ["thalch","thalach","thal_ch","thal_ach"]:
                if name in payload and payload[name] is not None:
                    val = payload[name]
                    break
            v.append(to_float(val, 0.0))
        elif feat == "exang":
            val = get_any(["exang","exercise_angina","exertional_angina"], 0)
            v.append(map_bool(val))
        elif feat == "oldpeak":
            val = get_any(["oldpeak","old_peak"], 0.0)
            v.append(to_float(val, 0.0))
        elif feat == "slope":
            val = get_any(["slope"], 1)
            v.append(map_slope(val))
        elif feat == "ca":
            val = get_any(["ca","num_vessels","vessels"], 0)
            try:
                v.append(int(float(val)))
            except:
                v.append(0)
        elif feat == "thal":
            val = get_any(["thal"], 1)
            v.append(map_thal(val))
        else:
            val = payload.get(feat, 0)
            v.append(to_float(val, 0.0))

    arr = np.array([v], dtype=float)
    return arr

@app.post("/predict", response_model=PredictResponse)
def predict(features: Features):
    if MODEL is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        payload = features.dict()

        # build input vector with 14 features in correct order
        x = construct_input_vector(payload)

        # diagnostic check
        expected = getattr(MODEL, "n_features_in_", None)
        if expected is not None and x.shape[1] != expected:
            raise HTTPException(status_code=400, detail=f"Input vector has {x.shape[1]} features but model expects {expected}")

        # get probability & prediction
        if hasattr(MODEL, "predict_proba"):
            p = float(MODEL.predict_proba(x)[:,1][0])
        else:
            p = float(MODEL.predict(x)[0])
        pred = int(MODEL.predict(x)[0])

        return PredictResponse(prediction=pred, probability=p, raw={"used_order": FEATURE_ORDER})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
