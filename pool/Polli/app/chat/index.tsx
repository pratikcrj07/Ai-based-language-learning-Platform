import { pythonApi } from "@/lib/axios";
import { speakText, stopSpeech } from "@/lib/speech";
import { useUserStore } from "@/store/store";
import { router } from "expo-router";
import {
  ArrowLeft,
  EllipsisVertical,
  Languages,
  Mic,
  SendHorizonal,
  Volume2,
  VolumeOff,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatMessage = {
  id: number;
  text: string;
  sender: "bot" | "user";
  topic?: string;
  translation?: string;
};

type StartChatResponse = {
  message?: string;
  message_translation?: string;
};

type ClassifyResponse = {
  detail?: string;
  message?: string;
  response?: string;
  response_translation?: string;
  follow_up?: {
    question?: string;
    topic?: string;
    should_ask_follow_up?: boolean;
  };
  follow_up_translation?: string | { question?: string };
};

export default function ChatScreen() {
  const lang = useUserStore((state) => state.selectedLang);
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [inputText, setInputText] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryKey, setRetryKey] = React.useState(0);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const lastSpokenBotMessageId = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const startChat = async () => {
      setLoading(true);
      setError(null);
      setMessages([]);

      try {
        const response = await pythonApi.post<StartChatResponse>(
          "/api/start-chat",
          { lang },
          { headers: { Accept: "application/json" } },
        );
        const body = response.data;

        if (response.status < 200 || response.status >= 300 || !body?.message) {
          throw new Error("Unable to start the chat.");
        }

        if (!cancelled) {
          setMessages([
            {
              id: 1,
              text: body.message,
              sender: "bot",
              translation: body.message_translation,
            },
          ]);
        }
      } catch {
        if (!cancelled) {
          setError(
            "We could not reach Polli. Check your connection and try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void startChat();
    return () => {
      cancelled = true;
    };
  }, [lang, retryKey]);

  const handleSendMessage = async () => {
    const userText = inputText.trim();
    if (!userText || sending || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      text: userText,
      sender: "user",
    };
    const history = messages.map(({ id, ...message }) => ({ ...message, id }));
    setMessages((previousMessages) => [...previousMessages, userMessage]);
    setInputText("");
    setSending(true);
    setError(null);

    try {
      const response = await pythonApi.post<ClassifyResponse>(
        "/api/classifyScenarioIntent",
        {
          user_input: userText,
          lang,
          conversation_history: history,
        },
        { headers: { Accept: "application/json" } },
      );
      const body = response.data;

      if (response.status < 200 || response.status >= 300 || !body?.response) {
        setError(
          body?.detail ?? body?.message ?? "Your message could not be sent. Please try again.",
        );
        return;
      }

      const followUp = body.follow_up?.should_ask_follow_up
        ? body.follow_up.question
        : undefined;
      const followUpTranslation =
        typeof body.follow_up_translation === "string"
          ? body.follow_up_translation
          : body.follow_up_translation?.question;
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: Date.now() + 1,
          text: [body.response, followUp].filter(Boolean).join(" "),
          sender: "bot",
          topic: body.follow_up?.topic,
          translation: [body.response_translation, followUpTranslation]
            .filter(Boolean)
            .join(" "),
        },
      ]);
    } catch {
      setError("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleRetry = () => {
    setMessages([]);
    setError(null);
    setRetryKey((key) => key + 1);
  };

  React.useEffect(() => {
    if (!soundEnabled) {
      void stopSpeech();
      return;
    }

    const lastBotMessage = [...messages]
      .reverse()
      .find((message) => message.sender === "bot");
    if (
      lastBotMessage &&
      lastSpokenBotMessageId.current !== lastBotMessage.id
    ) {
      lastSpokenBotMessageId.current = lastBotMessage.id;
      void speakText(lastBotMessage.text, lang);
    }
  }, [lang, messages, soundEnabled]);

  React.useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, sending]);

  React.useEffect(() => () => void stopSpeech(), []);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center gap-3 border-b border-line-subtle bg-surface px-4 pb-4 pt-4">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-muted"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#9CA3AF" strokeWidth={2} />
          </Pressable>
          <View className="relative">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Text className="text-xl font-nunito-bold text-primary">P</Text>
            </View>
            <View className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
          </View>
          <View className="mr-auto">
            <Text className="font-nunito-bold text-lg text-ink-strong">
              Polli Coach
            </Text>
            <Text className="font-nunito text-xs text-emerald-600">
              Online · {lang.toUpperCase()} practice
            </Text>
          </View>
          <Pressable
            className="rounded-full p-2 active:opacity-70"
            onPress={() => setSoundEnabled(!soundEnabled)}
            accessibilityLabel={
              soundEnabled ? "Mute coach" : "Enable coach sound"
            }
            accessibilityRole="button"
          >
            {soundEnabled ? (
              <Volume2 size={24} color="#9CA3AF" strokeWidth={2} />
            ) : (
              <VolumeOff size={24} color="#9CA3AF" strokeWidth={2} />
            )}
          </Pressable>
          <Pressable className="rounded-full p-2 active:opacity-70">
            <EllipsisVertical size={24} color="#9CA3AF" strokeWidth={2.5} />
          </Pressable>
        </View>
        <View className="mt-4 flex-1 px-4 py-2">
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 12 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="mb-5 mt-2 text-center font-nunito-medium text-xs uppercase tracking-widest text-slate-400">
              Today
            </Text>
            {loading && (
              <View className="items-center py-8">
                <ActivityIndicator color="#4F46E5" />
                <Text className="mt-2 font-nunito text-sm text-ink-muted">
                  Starting your chat...
                </Text>
              </View>
            )}
            {error && (
              <View className="mb-4 rounded-xl border border-danger-line bg-danger-soft p-3">
                <Text className="font-nunito text-danger">{error}</Text>
                {messages.length === 0 && (
                  <Pressable className="mt-2 self-start" onPress={handleRetry}>
                    <Text className="font-nunito-bold text-primary">
                      Try again
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
            {messages.map((message) => (
              <View
                key={message.id}
                className={`mb-4 flex-row items-end ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <View
                  className={`max-w-[82%] px-4 py-3 ${
                    message.sender === "user"
                      ? "rounded-2xl rounded-br-md bg-primary"
                      : "rounded-2xl rounded-bl-md border border-line-subtle bg-surface"
                  }`}
                >
                  <Text
                    className="font-nunito text-base"
                    style={{
                      color: message.sender === "user" ? "#fff" : "#1E293B",
                    }}
                  >
                    {message.text}
                  </Text>
                </View>
                {message.sender === "bot" &&
                  lang !== "en" &&
                  message.translation && (
                    <Pressable
                      className="ml-2 rounded-full bg-slate-300 p-2 active:opacity-70"
                      onPress={() =>
                        setMessages((current) =>
                          current.map((item) =>
                            item.id === message.id
                              ? {
                                  ...item,
                                  text: item.translation ?? item.text,
                                  translation: item.text,
                                }
                              : item,
                          ),
                        )
                      }
                      accessibilityLabel="Show English translation"
                      accessibilityRole="button"
                    >
                      <Languages size={18} color="#475569" strokeWidth={1.5} />
                    </Pressable>
                  )}
              </View>
            ))}
            {sending && (
              <View className="mb-4 self-start rounded-2xl rounded-bl-md border border-line-subtle bg-surface px-4 py-3">
                <ActivityIndicator color="#64748B" size="small" />
              </View>
            )}
          </ScrollView>
        </View>
        <View className="flex-row items-center gap-3 border-t border-line-subtle bg-surface px-4 py-3">
          <TextInput
            className="min-h-12 flex-1 rounded-2xl border border-line-subtle bg-surface-canvas px-4 font-nunito text-base text-ink-strong"
            placeholder="Type a message..."
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            editable={!loading && !sending}
            onSubmitEditing={() => void handleSendMessage()}
            returnKeyType="send"
          />
          {inputText ? (
            <Pressable
              className={`rounded-full bg-primary p-3 active:opacity-70 ${sending ? "opacity-50" : ""}`}
              onPress={() => void handleSendMessage()}
              disabled={sending || loading}
              accessibilityLabel="Send message"
              accessibilityRole="button"
            >
              <SendHorizonal size={20} color="#fff" strokeWidth={1.5} />
            </Pressable>
          ) : (
            <Pressable
              className="rounded-full bg-primary p-3 active:opacity-70"
              accessibilityLabel="Voice input"
              accessibilityRole="button"
            >
              <Mic size={20} color="#fff" strokeWidth={1.5} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
