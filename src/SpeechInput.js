import React, { useRef } from 'react';

function SpeechInput({ onResult, disabled }) {
  const recognitionRef = useRef(null);

  const handleStart = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (event) => {
      alert('Speech recognition error: ' + event.error);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStop = () => {
    recognitionRef.current && recognitionRef.current.stop();
  };

  return (
    <button type="button" onClick={handleStart} disabled={disabled} style={{ marginLeft: 8 }}>
      🎤 Speak
    </button>
  );
}

export default SpeechInput;
