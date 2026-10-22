/**
 * Emotion Classification - Frontend Logic
 * Clean Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const textInput = document.getElementById('textInput');
  const charCount = document.getElementById('charCount');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnLabel = document.getElementById('btnLabel');
  const clearBtn = document.getElementById('clearBtn');
  const alertBox = document.getElementById('alertBox');
  const alertMessage = document.getElementById('alertMessage');
  
  // Results Elements
  const resultsContainer = document.getElementById('resultsContainer');
  const heroEmoji = document.getElementById('heroEmoji');
  const heroEmotion = document.getElementById('heroEmotion');
  const heroConfidence = document.getElementById('heroConfidence');
  const probList = document.getElementById('probList');
  const promptChips = document.querySelectorAll('.chip-btn');

  // Emotion Mapping & Metadata
  const EMOTIONS = [
    { key: 'joy', label: 'Joy', emoji: '😄' },
    { key: 'love', label: 'Love', emoji: '❤️' },
    { key: 'surprise', label: 'Surprise', emoji: '😲' },
    { key: 'sadness', label: 'Sadness', emoji: '😢' },
    { key: 'fear', label: 'Fear', emoji: '😨' },
    { key: 'anger', label: 'Anger', emoji: '😠' }
  ];

  // Live Character Counter
  const updateCharCount = () => {
    const len = textInput.value.length;
    charCount.textContent = `${len.toLocaleString()} / 2,000`;
  };

  textInput.addEventListener('input', () => {
    updateCharCount();
    if (alertBox.classList.contains('active')) {
      hideAlert();
    }
  });

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter
  textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      analyzeEmotion();
    }
  });

  // Prompt Chips
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptText = chip.getAttribute('data-prompt');
      if (promptText) {
        textInput.value = promptText;
        updateCharCount();
        hideAlert();
        analyzeEmotion();
      }
    });
  });

  // Clear Button
  clearBtn.addEventListener('click', () => {
    textInput.value = '';
    updateCharCount();
    hideAlert();
    resultsContainer.classList.remove('visible');
    setTimeout(() => {
      resultsContainer.style.display = 'none';
    }, 200);
    textInput.focus();
  });

  // Alert helpers
  const showAlert = (message) => {
    alertMessage.textContent = message;
    alertBox.classList.add('active');
  };

  const hideAlert = () => {
    alertBox.classList.remove('active');
  };

  // Loading State
  const setLoading = (loading) => {
    analyzeBtn.disabled = loading;
    clearBtn.disabled = loading;
    textInput.disabled = loading;

    if (loading) {
      btnSpinner.style.display = 'inline-block';
      btnLabel.textContent = 'Analyzing...';
    } else {
      btnSpinner.style.display = 'none';
      btnLabel.textContent = 'Analyze Emotion';
    }
  };

  // Main Submit Function
  const analyzeEmotion = async () => {
    const rawText = textInput.value.trim();

    if (!rawText) {
      showAlert('Please enter a sentence to analyze.');
      textInput.focus();
      return;
    }

    hideAlert();
    setLoading(true);

    try {
      const response = await fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: rawText })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.detail || 'Prediction failed. Please try again.';
        showAlert(errorMsg);
        setLoading(false);
        return;
      }

      displayResults(data);
    } catch (err) {
      showAlert('Unable to connect to the classification server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Render Prediction Results
  const displayResults = (data) => {
    const { predicted_emotion, confidence, all_probabilities } = data;
    const topEmotionMeta = EMOTIONS.find(e => e.key === predicted_emotion) || {
      key: predicted_emotion,
      label: predicted_emotion,
      emoji: '✨'
    };

    // Populate Hero Card
    heroEmoji.textContent = topEmotionMeta.emoji;
    heroEmotion.textContent = topEmotionMeta.label;
    heroConfidence.textContent = `${(confidence * 100).toFixed(1)}% Confidence`;

    // Render Probability Meters
    probList.innerHTML = '';

    // Sort emotions by probability descending for crisp clarity
    const sortedEmotions = [...EMOTIONS].sort((a, b) => {
      const probA = all_probabilities[a.key] || 0;
      const probB = all_probabilities[b.key] || 0;
      return probB - probA;
    });

    sortedEmotions.forEach(emotion => {
      const probValue = all_probabilities[emotion.key] || 0;
      const percentage = (probValue * 100).toFixed(1);

      const row = document.createElement('div');
      row.className = 'prob-row';

      row.innerHTML = `
        <div class="prob-row-header">
          <div class="prob-label-wrap">
            <span>${emotion.emoji}</span>
            <span>${emotion.label}</span>
          </div>
          <span class="prob-percent">${percentage}%</span>
        </div>
        <div class="prob-bar-track">
          <div class="prob-bar-fill fill-${emotion.key}" style="width: 0%"></div>
        </div>
      `;

      probList.appendChild(row);

      // Trigger CSS width transition on next animation frame
      requestAnimationFrame(() => {
        setTimeout(() => {
          const fill = row.querySelector('.prob-bar-fill');
          if (fill) {
            fill.style.width = `${percentage}%`;
          }
        }, 50);
      });
    });

    // Make visible with smooth fade
    resultsContainer.style.display = 'block';
    requestAnimationFrame(() => {
      resultsContainer.classList.add('visible');
    });

    // Scroll smoothly to results if on small screen
    if (window.innerWidth < 600) {
      resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Bind Form Submit
  analyzeBtn.addEventListener('click', analyzeEmotion);
});
