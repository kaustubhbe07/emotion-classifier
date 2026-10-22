# 🧠 Emotion Classification Web Application

An end-to-end Deep Learning and NLP application that detects emotional tone from natural language in real time using a **Bidirectional GRU (BiGRU)** neural network served with **FastAPI** and a clean, minimal light frontend.

---

## 🎯 Overview

Sentiment analysis often stops at binary polarity (positive vs. negative). This application predicts **6 distinct human emotions** with full probability distributions:

| Emotion | Emoji | Sample Input |
| :--- | :---: | :--- |
| **Joy** | 😄 | *"i feel so joyful and grateful for everything today"* |
| **Love** | ❤️ | *"i feel incredibly blessed and in love with my life"* |
| **Sadness** | 😢 | *"i feel so empty and completely hopeless inside"* |
| **Surprise** | 😲 | *"i feel amazed and stunned by this wonderful news"* |
| **Fear** | 😨 | *"i feel terrified and anxious about what might happen"* |
| **Anger** | 😠 | *"i feel so irritated and furious with this situation"* |

---

## ✨ Key Features

- **Bidirectional GRU (BiGRU)**: Captures context from both directions in text sequences, yielding nuanced emotion representations.
- **FastAPI Lifespan Management**: Model and tokenizer load once on server boot and clear on shutdown, avoiding repetitive disk I/O.
- **Input Sanitization & Validation**: Detects and cleanly rejects whitespace or symbol-only inputs (`???!!!`) with HTTP 400 instead of false-confidence predictions.
- **Minimal Light UI**: Built with pure Vanilla HTML5, CSS3, and JavaScript—zero bloated external frameworks. Includes:
  - 1-click dataset-aligned sample prompt chips
  - Live character counter (`0 / 2,000`)
  - Keyboard shortcut (`Ctrl + Enter`) for instant submission
  - Dynamic, animated probability breakdown bars sorted by confidence
- **Interactive OpenAPI Docs**: Auto-generated interactive Swagger UI at `/docs`.

---

## 🏗️ Architecture & Tech Stack

```text
Natural Language Input
        │
        ▼
Text Preprocessing (Regex lowercase, clean punctuation)
        │
        ▼
Tokenizer & Sequence Padding (maxlen = 66, post-padding)
        │
        ▼
BiGRU Deep Learning Model (Keras / TensorFlow)
        │
        ▼
Softmax Probabilities (Joy, Love, Sadness, Anger, Fear, Surprise)
        │
        ▼
FastAPI Backend (Lifespan + Threadpool Dispatch)
        │
        ▼
Vanilla HTML / CSS / JS Minimal Web Interface
```

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Deep Learning**: TensorFlow, Keras (BiGRU sequential architecture)
- **Frontend**: Semantic HTML5, Vanilla CSS (Swiss minimal light design), Vanilla JavaScript

---

## 📁 Repository Structure

```text
Emotion-Classification/
├── Artifacts/
│   ├── BiGRU_Model.keras         # Trained Bidirectional GRU model (35.8 MB)
│   └── tokenizer.pkl             # Fitted Keras/Pickle Tokenizer vocabulary
├── static/
│   ├── index.html                # Responsive web interface
│   ├── style.css                 # Minimal light mode design system
│   └── script.js                 # Frontend API client & animation logic
├── main.py                       # FastAPI application & inference pipeline
├── requirements.txt              # Pinned Python dependencies
├── .gitignore                    # Git ignore rules for Python & venv
└── Emotion_Claasification.ipynb  # Model training & experimentation notebook
```

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git
cd <YOUR_REPOSITORY_NAME>
```

### 2. Create and Activate Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application
```bash
uvicorn main:app --reload --port 8000
```

Open your browser and navigate to:
- **Web Interface**: `http://127.0.0.1:8000/`
- **Interactive API Docs (Swagger)**: `http://127.0.0.1:8000/docs`

---

## 📡 API Reference

### Health Check
`GET /health`

**Response:**
```json
{
  "status": "Server is running",
  "model_loaded": true
}
```

### Predict Emotion
`POST /predict`

**Request Body:**
```json
{
  "text": "i feel so joyful and grateful for everything today"
}
```

**Response (200 OK):**
```json
{
  "text": "i feel so joyful and grateful for everything today",
  "predicted_emotion": "joy",
  "confidence": 0.9984,
  "all_probabilities": {
    "sadness": 0.0003,
    "joy": 0.9984,
    "love": 0.0008,
    "anger": 0.0001,
    "fear": 0.0002,
    "surprise": 0.0002
  }
}
```

---

## 📜 License
This project is open-source and available under the [MIT License](LICENSE).
