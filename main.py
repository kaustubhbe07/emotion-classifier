import re
import pickle
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel,Field
from contextlib import asynccontextmanager
from keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences



#Constants Required
model_path = "Artifacts/BiGRU_Model.keras"
tokenizer_path = "Artifacts/tokenizer.pkl"
max_sequence_length = 178
emotion_labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]
EMOTION_EMOJIS = {
    "sadness": "😢",
    "joy": "😄",
    "love": "❤️",
    "anger": "😠",
    "fear": "😨",
    "surprise": "😲",
}

#Text Preprocessing
def preprocess_text(text: str)->str:
    text = text.lower()
    text = re.sub(r"'","",text)
    text = re.sub(r"[^a-z0-9\s]"," ", text)
    text = re.sub(r"\s+", " ",text).strip()
    return text 

#Defining Schemas
class TextInput(BaseModel):
    text : str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The sentence to analyze",
        json_schema_extra={"example": "I feel so happy and excited"}
        )

class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    confidence : float
    all_probabilities: dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool


#Loading model and lifespan management
dl_model = {} #{1. BiGRU, 2. Tokenizer}-> True , {} -> False

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Loading the model and tokenizer...')
    dl_model["BiGRU"] = load_model(model_path)                      
    with open(tokenizer_path, 'rb') as file:
        dl_model["Tokenizer"] = pickle.load(file)
    print('Model are loaded successfully...')   

    yield #Pause, model is laoded and server is running and at this point model wait karega for request

    dl_model.clear() #Ek baar server band ho gaya uske baad model ko memory se hata do.

#Mount the static files to the FastAPI app
#Enable CORS 

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/static', StaticFiles(directory="static"), name="static")


#A. Server UI at homepage ('/')
@app.get('/', include_in_schema=False)
def server_ui():
    return FileResponse('static/index.html')

#B. Health Check Endpoint ('/health')
@app.get('/health', response_model=HealthResponse)
def health_check():
    return HealthResponse(status="Server is running", model_loaded=bool(dl_model))

#C. Predict Emotion Endpoint ('/predict')
@app.post('/predict', response_model=PredictionResponse)
def predict_emotion(text_input: TextInput):
    BiGRU_model     = dl_model.get("BiGRU")
    tokenizer_model = dl_model.get("Tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Please try again later.")
 
    cleaned_text = preprocess_text(text_input.text)
    if not cleaned_text:
        raise HTTPException(
            status_code=400,
            detail="Input text contains no valid words."
        )

    tokenized_text = tokenizer_model.texts_to_sequences([cleaned_text])
    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=max_sequence_length,
        padding="post",
        truncating="post"
    )

    probabilities=BiGRU_model.predict(padded_sequence,verbose=0)[0]

    top_emotion_index = int(np.argmax(probabilities)) 
    all_probabilities =  {
        label: float(prob) for prob, label in zip(probabilities, emotion_labels)  
    }

    return PredictionResponse(
        text = text_input.text,
        predicted_emotion = emotion_labels[top_emotion_index],
        confidence = float(probabilities[top_emotion_index]), 
        all_probabilities = all_probabilities
    )