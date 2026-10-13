import * as Speech from "expo-speech";
import type { ExpoSpeechRecognitionErrorCode } from "expo-speech-recognition";

const languageMap: Record<string, string> = {
  en: "en-US",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
  it: "it-IT",
  pt: "pt-PT",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  ar: "ar-SA",
};

export const getSpeechLanguage = (languageCode?: string) => {
  if (!languageCode) {
    return "en-US";
  }

  return languageMap[languageCode] || languageCode;
};

export const normalizeSpeechText = (text: string) =>
  text
    .toLocaleLowerCase()
    .replace(/\u00df/g, "ss")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

export const getSpeechRecognitionErrorMessage = (
  error: ExpoSpeechRecognitionErrorCode,
) => {
  if (error === "not-allowed") {
    return "Allow microphone access to practice speaking.";
  }
  if (error === "no-speech") {
    return "No speech was recognized. Try again.";
  }
  if (
    error === "network" ||
    error === "service-not-allowed" ||
    error === "language-not-supported"
  ) {
    return "Speech recognition is unavailable here. Try Chrome or Safari.";
  }
  return "Speech recognition failed. Please try again.";
};

export const speakText = async (
  text: string,
  languageCode?: string,
  options: Partial<Speech.SpeechOptions> = {},
) => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  await Speech.stop();
  Speech.speak(trimmedText, {
    language: getSpeechLanguage(languageCode),
    pitch: 1,
    rate: 0.9,
    ...options,
  });
};

export const stopSpeech = () => Speech.stop();
