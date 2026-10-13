import {
  getSpeechLanguage,
  getSpeechRecognitionErrorMessage,
  normalizeSpeechText,
} from "@/lib/speech";
import React, { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type SpeechRecognitionModule = typeof import("expo-speech-recognition")["ExpoSpeechRecognitionModule"];

export const useSpeechRecognition = () => {
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognizedSpeech, setRecognizedSpeech] = useState("");
  const [recognitionMessage, setRecognitionMessage] = useState("");
  const [activeSpeechTarget, setActiveSpeechTarget] = useState("");
  const expectedSpeechRef = useRef("");
  const speechRecognitionModuleRef = useRef<SpeechRecognitionModule | null>(
    null,
  );
  const speechRecognitionSubscriptionsRef = useRef<{ remove: () => void }[]>(
    [],
  );

  const resetRecognition = () => {
    if (isRecognizing) speechRecognitionModuleRef.current?.abort();
    setIsRecognizing(false);
    setRecognizedSpeech("");
    setRecognitionMessage("");
    setActiveSpeechTarget("");
  };

  const startRecognition = async (targetText: string, language: string) => {
    if (isRecognizing) {
      speechRecognitionModuleRef.current?.stop();
      return;
    }
    if (!targetText.trim()) return;

    setIsRecognizing(true);
    setRecognizedSpeech("");
    setRecognitionMessage("Checking speech recognition...");
    setActiveSpeechTarget(targetText);

    try {
      const { ExpoSpeechRecognitionModule } = await import(
        "expo-speech-recognition"
      );
      speechRecognitionModuleRef.current = ExpoSpeechRecognitionModule;

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setIsRecognizing(false);
        setRecognitionMessage(
          "Speech recognition is not supported in this browser or device.",
        );
        return;
      }

      if (speechRecognitionSubscriptionsRef.current.length === 0) {
        speechRecognitionSubscriptionsRef.current = [
          ExpoSpeechRecognitionModule.addListener("start", () => {
            setRecognitionMessage("Listening... Speak now.");
          }),
          ExpoSpeechRecognitionModule.addListener("result", (event) => {
            const transcript = event.results[0]?.transcript?.trim();
            if (!transcript) return;
            setRecognizedSpeech(transcript);
            if (event.isFinal) {
              const matches =
                normalizeSpeechText(transcript) ===
                normalizeSpeechText(expectedSpeechRef.current);
              setRecognitionMessage(
                matches
                  ? "The recognized words match the target."
                  : "That was not an exact text match. Listen and try again.",
              );
            }
          }),
          ExpoSpeechRecognitionModule.addListener("error", (event) => {
            setIsRecognizing(false);
            if (event.error !== "aborted") {
              setRecognitionMessage(
                getSpeechRecognitionErrorMessage(event.error),
              );
            }
          }),
          ExpoSpeechRecognitionModule.addListener("end", () => {
            setIsRecognizing(false);
            setRecognitionMessage((message) =>
              message === "Listening... Speak now."
                ? "No speech was recognized. Try again."
                : message,
            );
          }),
        ];
      }

      if (Platform.OS === "web") {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
      } else {
        const permission =
          await ExpoSpeechRecognitionModule.requestPermissionsAsync();
        if (!permission.granted) {
          setIsRecognizing(false);
          setRecognitionMessage(
            "Allow microphone access to practice speaking.",
          );
          return;
        }
      }

      expectedSpeechRef.current = targetText;
      ExpoSpeechRecognitionModule.start({
        lang: getSpeechLanguage(language),
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        contextualStrings: targetText.split(/\s+/),
      });
    } catch (error) {
      setIsRecognizing(false);
      const browserErrorName =
        typeof error === "object" && error !== null && "name" in error
          ? String(error.name)
          : "";
      const browserErrorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : String(error);
      setRecognitionMessage(
        Platform.OS === "web"
          ? browserErrorName === "NotAllowedError"
            ? "Chrome blocked microphone access. Allow it in site settings and reload."
            : browserErrorName === "NotFoundError"
              ? "No microphone was found. Connect or enable a microphone and try again."
              : browserErrorName === "NotReadableError"
                ? "The microphone is unavailable. Close other apps using it and try again."
                : `The speech service could not start: ${browserErrorMessage}`
          : "Speech recognition needs a native development build. Expo Go does not include it.",
      );
    }
  };

  useEffect(() => {
    return () => {
      speechRecognitionModuleRef.current?.abort();
      speechRecognitionSubscriptionsRef.current.forEach((subscription) =>
        subscription.remove(),
      );
    };
  }, []);

  return {
    isRecognizing,
    recognizedSpeech,
    recognitionMessage,
    activeSpeechTarget,
    startRecognition,
    resetRecognition,
  };
};