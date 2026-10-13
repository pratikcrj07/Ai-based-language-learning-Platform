import { speakText, stopSpeech } from "@/lib/speech";
import { useUserStore } from "@/store/store";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Volume2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUnit } from "../../lib/getUnit";
import { syncCompletedLesson } from "../../lib/progressSync";

const DialogueExercise = () => {
  const { selectedLang } = useUserStore();
  const { level, unit } = useLocalSearchParams();
  const [page, setPage] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<number[]>(
    [],
  );
  const pageListRef = useRef<FlatList>(null);
  const pageStartRef = useRef(Date.now());
  const screenWidth = Dimensions.get("window").width;
  const progressReportedRef = useRef(false);

  const unitData = getUnit(
    selectedLang as any,
    level as any,
    parseInt(unit as string, 10),
  );
  const dialogueContent = unitData?.contents.find(
    (content) => content.content_type === "dialogue",
  );
  const dialogueExercises: DialogueExerciseData[] =
    dialogueContent?.exercises || [];
  const pages: DialoguePageItem[] = [
    { id: "introduction", type: "introduction" },
    ...dialogueExercises.map((dialogue, index) => ({
      id: `dialogue-${dialogue.id ?? index}`,
      type: "dialogue" as const,
      dialogue,
    })),
  ];
  const totalPages = pages.length;
  const timeSpentSeconds = Math.floor(
    (Date.now() - pageStartRef.current) / 1000,
  );
  const accuracyLabel = totalAttempts
    ? `${Math.round((correctAttempts / totalAttempts) * 100)}%`
    : "0%";
  const selectedLanguageLabel =
    selectedLang === "fr"
      ? "French"
      : selectedLang === "de"
        ? "German"
        : selectedLang.toUpperCase();

  useEffect(() => {
    return () => {
      void stopSpeech();
    };
  }, []);

  const handleSpeak = (text: string) => {
    void speakText(text, selectedLang);
  };

  useEffect(() => {
    if (!showSummary || progressReportedRef.current) return;
    progressReportedRef.current = true;
    void syncCompletedLesson({
      language: selectedLang,
      level: String(level),
      unit: String(unit),
      exerciseId: completedExerciseIds.at(-1),
      durationSeconds: Math.max(180, timeSpentSeconds),
      accuracy: totalAttempts ? correctAttempts / totalAttempts : 0,
    });
  }, [completedExerciseIds, correctAttempts, level, selectedLang, showSummary, timeSpentSeconds, totalAttempts, unit]);

  const handleAnswerAttempt = (isCorrect: boolean) => {
    setTotalAttempts((attempts) => attempts + 1);
    if (isCorrect) {
      setCorrectAttempts((attempts) => attempts + 1);
    }
  };

  const handleExerciseCompleted = (exerciseId?: number) => {
    if (exerciseId === undefined) {
      return;
    }
    setCompletedExerciseIds((completedIds) =>
      completedIds.includes(exerciseId)
        ? completedIds
        : [...completedIds, exerciseId],
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      return;
    }

    if (newPage > totalPages) {
      setShowSummary(true);
    }
  };

  useEffect(() => {
    pageListRef.current?.scrollToIndex({ index: page - 1, animated: true });
  }, [page]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-4 mt-2">
        <View className="flex-row items-center gap-6 justify-between">
          <Pressable
            className="p-1 rounded-full active:opacity-70"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={28} color="#9CA3AF" />
          </Pressable>
          <View className="flex-1 h-3 bg-slate-300 rounded-full">
            <View
              className="h-3 bg-primary rounded-full"
              style={{ width: `${(page / totalPages) * 100}%` }}
            />
          </View>
          <Text className="font-nunito-semibold text-lg text-slate-500">
            {`${page}/${totalPages}`}
          </Text>
        </View>
        <Text className="text-lg font-nunito-bold text-slate-400 mt-2 underline">
          {unitData?.title || "Dialogue Practice"}
        </Text>
      </View>

      <View className="flex-1 mt-4" style={{ width: screenWidth }}>
        <FlatList
          ref={pageListRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({
            item,
            index,
          }: ListRenderItemInfo<DialoguePageItem>) => {
            const currentPage = index + 1;

            if (item.type === "introduction") {
              return (
                <DialogueIntroduction
                  description={dialogueContent?.description}
                  language={selectedLanguageLabel}
                  available={dialogueExercises.length > 0}
                  onContinue={() => handlePageChange(currentPage + 1)}
                />
              );
            }

            return (
              <DialoguePage
                key={item.id}
                dialogue={item.dialogue}
                language={selectedLang}
                onSpeak={handleSpeak}
                onAnswerAttempt={handleAnswerAttempt}
                onComplete={() => handleExerciseCompleted(item.dialogue.id)}
                onContinue={() => handlePageChange(currentPage + 1)}
              />
            );
          }}
        />
      </View>
      <SummaryPage
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        title={unitData?.title || "Dialogue Practice"}
        levelLabel={String(level)}
        unitLabel={`Unit ${unit}`}
        languageLabel={selectedLanguageLabel}
        accuracyLabel={accuracyLabel}
        timeTakenLabel={formatDuration(timeSpentSeconds * 1000)}
        exercisesCompletedLabel={`${completedExerciseIds.length}/${dialogueExercises.length}`}
        wordsLearnedLabel={0}
      />
    </SafeAreaView>
  );
};

export default DialogueExercise;

type DialogueExerciseData = {
  id?: number;
  dialogue: string;
  dialogue_translation: string;
  options: string[];
  correct_answer: string;
  meaning?: string;
};

type DialoguePageItem =
  | { id: string; type: "introduction" }
  | { id: string; type: "dialogue"; dialogue: DialogueExerciseData };

const DialogueIntroduction = ({
  description,
  language,
  available,
  onContinue,
}: {
  description?: string;
  language: string;
  available: boolean;
  onContinue: () => void;
}) => (
  <View className="w-screen flex-1 px-4">
    <View className="flex-1 justify-center items-center">
      <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
        Practice a real conversation
      </Text>
      <Text className="text-base font-nunito text-slate-500 text-center mt-4">
        {available
          ? description || `Listen and repeat this ${language} dialogue.`
          : `Dialogue practice is not available for ${language} yet.`}
      </Text>
      {available && (
        <View className="flex-row items-center gap-2 mt-8 rounded-full bg-slate-100 px-4 py-2">
          <Volume2 size={18} color="#64748B" />
          <Text className="font-nunito-semibold text-slate-600">
            Listen, read, and repeat
          </Text>
        </View>
      )}
    </View>
    <Pressable
      className="mb-4 bg-primary p-3 items-center justify-center rounded-xl active:opacity-70"
      onPress={onContinue}
    >
      <Text className="text-xl font-nunito-semibold text-white">
        {available ? "Start Dialogue" : "Go Back"}
      </Text>
    </Pressable>
  </View>
);

const DialoguePage = ({
  dialogue,
  language,
  onSpeak,
  onAnswerAttempt,
  onComplete,
  onContinue,
}: {
  dialogue?: DialogueExerciseData;
  language?: string;
  onSpeak: (text: string) => void;
  onAnswerAttempt: (isCorrect: boolean) => void;
  onComplete: () => void;
  onContinue: () => void;
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "success" | "warning" | "fail"
  >("success");
  const [promptModalVisible, setPromptModalVisible] = useState(false);

  const isCorrect = selectedAnswer === dialogue?.correct_answer;
  const feedbackTitle =
    feedbackType === "success"
      ? "Great Work"
      : feedbackType === "warning"
        ? "So Close, try again"
        : "Keep Practicing";
  const feedbackMessage =
    feedbackType === "success"
      ? "That is the correct response."
      : feedbackType === "warning"
        ? "Choose another response and try once more."
        : "You have used both tries. Let's continue to the next exercise.";

  const handleCheck = () => {
    if (!selectedAnswer) {
      setFeedbackType("warning");
      setFeedbackVisible(true);
      return;
    }

    onAnswerAttempt(isCorrect);
    if (isCorrect) {
      setFeedbackType("success");
      setFeedbackVisible(true);
      return;
    }

    const nextTries = tries + 1;
    setTries(nextTries);
    setFeedbackType(nextTries === 1 ? "warning" : "fail");
    setFeedbackVisible(true);
  };

  const handleFeedbackAction = () => {
    setFeedbackVisible(false);
    if (feedbackType === "warning") {
      if (tries > 0) {
        setSelectedAnswer(null);
      }
      return;
    }
    if (feedbackType === "success") {
      onComplete();
    }
    onContinue();
  };

  return (
    <View className="w-screen flex-1 px-4">
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-2xl font-nunito-bold text-slate-600">
          Choose the correct response
        </Text>
      </View>
      <Text className="mt-1 font-nunito text-slate-500">
        Listen to the {language === "de" ? "German" : "French"} prompt and
        choose what comes next.
      </Text>

      <View className="flex-row">
        <View className="flex-row gap-3 mt-6">
          <ProfileCircle label="A" />
          <Pressable
            className="w-2/3 border border-primary/30 bg-primary/10 rounded-2xl rounded-tl-none p-5 active:opacity-80"
            onPress={() => setPromptModalVisible(true)}
            accessibilityLabel="Open prompt translation"
          >
            <View className="flex-row items-center gap-3">
              <Text className="flex-1 text-xl font-nunito-semibold text-slate-700">
                {dialogue?.dialogue}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="flex-row justify-end gap-3 mt-6">
        <View className="w-2/3 border border-slate-300 bg-slate-100 rounded-2xl rounded-tr-none p-5">
          <Text className="text-xl font-nunito-semibold text-slate-700">
            {selectedAnswer || "Choose a response below"}
          </Text>
        </View>
        <ProfileCircle label="B" muted />
      </View>

      <View className="mt-16 gap-3">
        {dialogue?.options.map((option) => (
          <Pressable
            key={option}
            className={`rounded-xl border p-4 active:opacity-70 ${selectedAnswer === option ? "border-primary bg-primary/10" : "border-slate-300"}`}
            onPress={() => {
              setSelectedAnswer(option);
              onSpeak(option);
            }}
          >
            <Text
              className={`text-lg font-nunito-semibold ${selectedAnswer === option ? "text-primary" : "text-slate-600"}`}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        className="mt-auto mb-4 bg-primary p-3 items-center justify-center rounded-xl active:opacity-70"
        onPress={handleCheck}
      >
        <Text className="text-xl font-nunito-semibold text-white">Check</Text>
      </Pressable>

      <Modal
        visible={promptModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPromptModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/20">
          <View className="rounded-t-3xl border border-slate-200 bg-slate-50 p-6">
            <Text className="text-2xl font-nunito-bold text-slate-700 text-center">
              {dialogue?.dialogue}
            </Text>
            <Text className="mt-3 text-lg font-nunito text-slate-600 text-center">
              {dialogue?.dialogue_translation}
            </Text>
            <Pressable
              className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 active:opacity-70"
              onPress={() => dialogue?.dialogue && onSpeak(dialogue.dialogue)}
            >
              <Volume2 size={21} color="#fff" />
              <Text className="text-lg font-nunito-bold text-white">
                Play sound
              </Text>
            </Pressable>
            <Pressable
              className="mt-3 rounded-xl border border-slate-300 px-4 py-3 items-center active:opacity-70"
              onPress={() => setPromptModalVisible(false)}
            >
              <Text className="text-lg font-nunito-semibold text-slate-600">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={feedbackVisible} transparent animationType="slide">
        <View className="flex-1 justify-end">
          <View className="rounded-t-3xl border border-slate-200 bg-slate-50 p-6">
            <Text
              className={`text-3xl font-nunito-bold text-center ${feedbackType === "success" ? "text-green-600" : feedbackType === "warning" ? "text-amber-600" : "text-red-600"}`}
            >
              {feedbackTitle}
            </Text>
            <Text className="mt-2 text-base font-nunito text-slate-600 text-center">
              {feedbackMessage}
            </Text>
            {feedbackType === "fail" && (
              <Text className="mt-3 text-base font-nunito-semibold text-slate-700 text-center">
                Correct response: {dialogue?.correct_answer}
              </Text>
            )}
            {feedbackType === "success" && dialogue?.meaning && (
              <Text className="mt-3 text-base font-nunito-semibold text-slate-700 text-center">
                Meaning: {dialogue.meaning}
              </Text>
            )}
            <Pressable
              className="mt-4 rounded-xl bg-primary px-4 py-3 items-center active:opacity-70"
              onPress={handleFeedbackAction}
            >
              <Text className="text-lg font-nunito-bold text-white">
                {feedbackType === "warning" ? "Try again" : "Continue"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ProfileCircle = ({
  label,
  muted = false,
}: {
  label: string;
  muted?: boolean;
}) => (
  <View
    className={`h-10 w-10 items-center justify-center rounded-full ${muted ? "bg-slate-300" : "bg-primary"}`}
  >
    <Text className="font-nunito-bold text-white">{label}</Text>
  </View>
);

const SummaryPage = ({
  showSummary,
  setShowSummary,
  title,
  levelLabel,
  unitLabel,
  languageLabel,
  accuracyLabel,
  timeTakenLabel,
  exercisesCompletedLabel,
  wordsLearnedLabel,
}: {
  showSummary: boolean;
  setShowSummary: (visible: boolean) => void;
  title: string;
  levelLabel: string;
  unitLabel: string;
  languageLabel: string;
  accuracyLabel: string;
  timeTakenLabel: string;
  exercisesCompletedLabel: string;
  wordsLearnedLabel: number;
}) => (
  <Modal
    visible={showSummary}
    animationType="slide"
    onRequestClose={() => setShowSummary(false)}
  >
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1 px-4 py-6">
        <View className="flex-1 gap-5">
          <View className="items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5">
            <Text className="text-3xl font-nunito-bold text-slate-900 text-center">
              Summary
            </Text>
            <Text className="text-slate-600 font-nunito text-base text-center">
              {title}
            </Text>
            <View className="flex-row items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
              <Text className="text-slate-700 font-nunito-semibold text-sm uppercase tracking-wider">
                {levelLabel}
              </Text>
              <Text className="text-slate-400">•</Text>
              <Text className="text-slate-700 font-nunito-semibold text-sm uppercase tracking-wider">
                {unitLabel}
              </Text>
              <Text className="text-slate-400">•</Text>
              <Text className="text-slate-700 font-nunito-semibold text-sm uppercase tracking-wider">
                {languageLabel}
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Text className="text-slate-700 font-nunito-semibold text-lg">
              Progress recap
            </Text>
            <View className="flex-row gap-3">
              <SummaryStat label="Accuracy" value={accuracyLabel} />
              <SummaryStat label="Time Taken" value={timeTakenLabel} />
            </View>
            <View className="flex-row gap-3">
              <SummaryStat
                label="Exercise Completed"
                value={exercisesCompletedLabel}
              />
              <SummaryStat
                label="Words Learned"
                value={String(wordsLearnedLabel)}
              />
            </View>
          </View>
        </View>

        <Pressable
          className="mt-4 rounded-xl bg-primary px-4 py-3 items-center active:opacity-70"
          onPress={() => router.back()}
        >
          <Text className="text-white font-nunito-bold text-lg">Close</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  </Modal>
);

const SummaryStat = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
    <Text className="text-slate-400 font-nunito text-sm">{label}</Text>
    <Text className="mt-2 text-2xl font-nunito-bold text-slate-900">
      {value}
    </Text>
  </View>
);

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return minutes === 0
    ? `${seconds}s`
    : `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};
