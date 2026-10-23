# 🧠 Emotion Classification Web Application

An end-to-end Deep Learning and NLP application that detects emotional tone from natural language in real time using a **Bidirectional GRU (BiGRU)** neural network served with **FastAPI** and a clean, minimal light frontend.

---

## 🎯 Overview

Sentiment analysis often stops at binary polarity (positive vs. negative). This application predicts **6 distinct human emotions** with full probability distributions:

| Emotion | Emoji | Sample Input |
| :--- | :---: | :--- |
| **Joy** | 😄 | *"I feel so joyful and grateful for everything today"* |
| **Love** | ❤️ | *"I feel incredibly blessed and in love with my life"* |
| **Sadness** | 😢 | *"I feel so empty and completely hopeless inside"* |
| **Surprise** | 😲 | *"I feel amazed and stunned by this wonderful news"* |
| **Fear** | 😨 | *"I feel terrified and anxious about what might happen"* |
| **Anger** | 😠 | *"I feel so irritated and furious with this situation"* |

---

## 📊 Dataset

The model is trained on the comprehensive [`dair-ai/emotion`](https://huggingface.co/datasets/dair-ai/emotion) dataset from Hugging Face (`unsplit` configuration):

- **Dataset Link**: [Hugging Face - dair-ai/emotion](https://huggingface.co/datasets/dair-ai/emotion)
- **Total Dataset Size**: **416,809 samples**
- **Data Splits (Stratified Split)**:
  - **Training Set (80%)**: `333,447` samples
  - **Validation Set (10%)**: `41,681` samples
  - **Test Set (10%)**: `41,681` samples
- **Vocabulary & Sequences**:
  - Vocabulary Limit (`max_words`): `60,000` tokens (`67,866` unique words in corpus)
  - Maximum Sequence Length (`max_len`): `178` tokens
  - Out-of-Vocabulary (OOV) Token: `<ukn>`
- **Imbalance Handling**: Class weights computed via `sklearn.utils.class_weight.compute_class_weight` to ensure balanced gradient updates across all 6 emotion classes.

---

## 📈 Model Performance & Metrics

Both **BiGRU** and **BiLSTM** architectures were trained and evaluated on **41,681 unseen test samples**:

| Model | Architecture | Parameters | Test Loss | Test Accuracy |
| :--- | :--- | :---: | :---: | :---: |
| **BiLSTM** | Bidirectional LSTM (128 -> 64) | 15.92M | 0.1129 | **94.01%** |
| **BiGRU (Deployed)** | Bidirectional GRU (128 -> 64) | 15.78M | 0.1139 | **93.93%** |

### Why BiGRU Was Selected for Deployment
While BiLSTM achieved a marginally higher accuracy (+0.08%), **BiGRU was selected for production** because:
1. **Structural Efficiency**: GRUs utilize only two gates (reset and update) compared to LSTM's three gates (input, forget, and output), requiring fewer matrix multiplications per timestep.
2. **Reduced Latency**: Faster inference execution and lower memory overhead, making it ideal for real-time REST API serving with FastAPI.
3. **Comparable Accuracy**: Reaches ~94% accuracy with identical generalization quality across all 6 emotion categories.

### Training Configuration
- **Loss**: `sparse_categorical_crossentropy`
- **Optimizer**: `adam`
- **Batch Size**: 64
- **Epochs**: 25 (with `EarlyStopping` monitoring `val_loss` at patience=3 and `ModelCheckpoint` restoring best weights)

---

## ✨ Key Features

- **Bidirectional GRU (BiGRU)**: Captures context from both directions in text sequences, yielding nuanced emotion representations.
- **FastAPI Lifespan Management**: Model and tokenizer load once on server boot and clear on shutdown, avoiding repetitive disk I/O.
- **Input Sanitization & Validation**: Detects and cleanly rejects whitespace or symbol-only inputs (`???!!!`) with HTTP 400 instead of false-confidence predictions.
- **Minimal Light UI**: Built with pure Vanilla HTML5, CSS3, and JavaScript. 
- **Interactive OpenAPI Docs**: Auto-generated interactive Swagger UI at `/docs`.

---

## 🏗️ Architecture & Tech Stack

```text
Natural Language Input
        │
        ▼
Text Preprocessing (Regex clean, lowercase)
        │
        ▼
Tokenizer & Sequence Padding (maxlen = 178)
        │
        ▼
BiGRU Deep Learning Model
        │
        ▼
Softmax Probabilities
        │
        ▼
FastAPI Backend
        │
        ▼
Vanilla HTML / CSS / JS Minimal Web Interface
```

- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Deep Learning**: TensorFlow, Keras (BiGRU sequential architecture)
- **Frontend**: HTML, CSS ,JavaScript

---

## 📁 Repository Structure

```text
Emotion-Classification/
├── Artifacts/
│   ├── BiGRU_Model.keras        
│   └── tokenizer.pkl             
├── static/
│   ├── index.html                
│   ├── style.css                 
│   └── script.js                
├── main.py                       
├── requirements.txt              
├── .gitignore                    
├── README.md                     
└── notebook.ipynb                
```

---

## 🚀 Quickstart Guide

### 1. Clone the Repository
```bash
git clone https://github.com/kaustubhbe07/emotion-classifier.git
cd emotion-classifier
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
  "confidence": 0.9998859167098999,
  "all_probabilities": {
    "sadness": 0.000008609986252849922,
    "joy": 0.9998859167098999,
    "love": 0.0000377257056243252,
    "anger": 0.0000012591327731570345,
    "fear": 0.00002126986328221392,
    "surprise": 0.00004521963273873553
  }
}
```
