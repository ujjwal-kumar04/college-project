import { useCallback, useEffect, useRef, useState } from 'react';

const getRecognition = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const useSpeechRecognition = () => {
  const recognitionRef = useRef(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const SpeechRecognition = getRecognition();
    if (!SpeechRecognition) {
      setIsSupported(false);
      return undefined;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        finalTranscript += event.results[index][0].transcript;
      }
      setTranscript(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || 'Voice input failed.');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError('');
    setIsListening(true);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }

    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError('');
  }, []);

  return {
    isSupported,
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;