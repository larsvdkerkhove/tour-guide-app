import { useState, useCallback } from 'react';

export function useVoice() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (tekst, taal = 'nl-NL') => {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(tekst);
      utterance.lang = taal;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [supported]
  );

  return { speak, speaking, supported };
}
