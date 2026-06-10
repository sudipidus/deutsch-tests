export function isTTSAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getGermanVoices(): SpeechSynthesisVoice[] {
  if (!isTTSAvailable()) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith("de"));
}

export function speak(
  text: string,
  options?: { voice?: string; rate?: number; onEnd?: () => void }
): SpeechSynthesisUtterance | null {
  if (!isTTSAvailable()) return null;

  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = options?.rate ?? 1;

  if (options?.voice) {
    const voice = speechSynthesis.getVoices().find((v) => v.name === options.voice);
    if (voice) utterance.voice = voice;
  }

  if (options?.onEnd) utterance.onend = options.onEnd;

  speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (isTTSAvailable()) speechSynthesis.cancel();
}
