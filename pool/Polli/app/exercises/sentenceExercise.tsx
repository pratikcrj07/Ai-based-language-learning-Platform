import { speakText, stopSpeech } from "@/lib/speech";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useUserStore } from "@/store/store";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Mic, MicOff, Volume2 } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import data from "../../data/sentenceExercises.json";
import { getUnit } from "../../lib/getUnit";
import { syncCompletedLesson } from "../../lib/progressSync";

const SentenceExercise = () => {
  const { selectedLang } = useUserStore();
  const { level, unit } = useLocalSearchParams();
  const screenWidth = Dimensions.get("window").width;
  const [page, setPage] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<number[]>(
    [],
  );
  const {
    isRecognizing,
    recognizedSpeech,
    recognitionMessage,
    startRecognition,
    resetRecognition,
  } = useSpeechRecognition();
  const pageListRef = useRef<FlatList>(null);
  const pageStartRef = useRef(Date.now());
  const progressReportedRef = useRef(false);

  const unitData = getUnit(
    selectedLang as any,
    level as any,
    parseInt(unit as string, 10),
  );

  const totalPages = data.exercises.find(
    (ex) => ex.level === level && ex.unit === parseInt(unit as string, 10),
  )?.content.length;

  const exercise = data.exercises.find(
    (ex) => ex.level === level && ex.unit === parseInt(unit as string, 10),
  );
  const exerciseCount =
    exercise?.content.filter((item) => item.exercise_type !== "introduction")
      .length || 0;
  const selectedLanguageLabel =
    selectedLang === "fr"
      ? "French"
      : selectedLang === "de"
        ? "German"
        : selectedLang.toUpperCase();
  const timeSpentSeconds = Math.floor(
    (Date.now() - pageStartRef.current) / 1000,
  );
  const accuracyLabel = totalAttempts
    ? `${Math.round((correctAttempts / totalAttempts) * 100)}%`
    : "0%";

  const handleAnswerAttempt = (isCorrect: boolean) => {
    setTotalAttempts((attempts) => attempts + 1);
    if (isCorrect) {
      setCorrectAttempts((attempts) => attempts + 1);
    }
  };

  const handleExerciseCompleted = (exerciseId: number) => {
    setCompletedExerciseIds((completedIds) =>
      completedIds.includes(exerciseId)
        ? completedIds
        : [...completedIds, exerciseId],
    );
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (totalPages || 1)) {
      resetRecognition();
      setPage(newPage);
    }
    if (newPage > (totalPages || 1)) {
      resetRecognition();
      setShowSummary(true);
    }
  };

  const handleBack = () => {
    router.back();
  };
  const handleSpeakWord = (phrase: string) => {
    const speechText = phrase;

    void speakText(speechText, selectedLang);
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

  useEffect(() => {
    if (pageListRef.current) {
      pageListRef.current.scrollToIndex({ index: page - 1, animated: true });
    }
  }, [page]);

  useEffect(() => {
    return () => {
      void stopSpeech();
    };
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="mx-4">
        <View className="flex-row items-center gap-6 justify-between mt-2">
          <Pressable
            className="p-1 rounded-full active:opacity-70"
            onPress={handleBack}
          >
            <ArrowLeft size={28} color="#9CA3AF" />
          </Pressable>
          <View className="flex-1 h-3 bg-slate-300 rounded-full">
            <View
              className="h-3 bg-primary rounded-full"
              style={{ width: `${(page / (totalPages || 1)) * 100}%` }}
            />
          </View>
          <Text className="font-nunito-semibold text-lg text-slate-500">
            {`${page}/${totalPages}`}
          </Text>
        </View>
        <Text className="text-lg font-nunito-bold text-slate-400 mt-2 underline">
          {exercise?.title}
        </Text>
      </View>
      <View className="flex-1 mt-4" style={{ width: screenWidth }}>
        <FlatList
          ref={pageListRef}
          data={exercise?.content || []}

          renderItem={({ item, index }) => {
            if (item?.exercise_type === "introduction") {
              return (
                <IntroductionPage
                  exercise={unitData?.contents.find(
                    (data) => data.content_type === "introduction",
                  )}
                  onContinuePress={() => handlePageChange(page + 1)}
                />
              );
            }
            if (
              item?.exercise_type === "sentence_translate_target_to_english" ||
              item?.exercise_type === "sentence_translate_english_to_target"
            ) {
              const isEnglishToTarget =
                item.exercise_type === "sentence_translate_english_to_target";
              const contentType = isEnglishToTarget
                ? "sentence_translate_english_to_target"
                : "sentence_translate_target_to_english";

              return (
                <ArrangeTranslationPage
                  exercise={unitData?.contents
                    .find((data) => data.content_type === contentType)
                    .exercises.find((ex: any) => ex.id === item.exercise_id)}
                  isEnglishToTarget={isEnglishToTarget}
                  lang={selectedLang}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onAnswerAttempt={handleAnswerAttempt}
                  onContinuePress={() => handlePageChange(page + 1)}
                  onSpeakWord={handleSpeakWord}
                  onRecognizeSpeech={startRecognition}
                  isRecognizing={isRecognizing}
                  recognizedSpeech={recognizedSpeech}
                  recognitionMessage={recognitionMessage}
                />
              );
            }
            if (item?.exercise_type === "fill_in_the_blank") {
              return (
                <FillInTheBlankPage
                  exercise={unitData?.contents
                    .find((data) => data.content_type === "fill_in_the_blank")
                    ?.exercises?.find((ex: any) => ex.id === item.exercise_id)}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onAnswerAttempt={handleAnswerAttempt}
                  onContinuePress={() => handlePageChange(page + 1)}
                />
              );
            }
            if (item?.exercise_type === "listen_and_choose") {
              return (
                <ListenAndChoosePage
                  exercise={unitData?.contents
                    .find((data) => data.content_type === "listen_and_choose")
                    .exercises.find((ex: any) => ex.id === item.exercise_id)}
                  lang={selectedLang}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onAnswerAttempt={handleAnswerAttempt}
                  onContinuePress={() => handlePageChange(page + 1)}
                  onSpeakWord={handleSpeakWord}
                  onRecognizeSpeech={startRecognition}
                  isRecognizing={isRecognizing}
                  recognizedSpeech={recognizedSpeech}
                  recognitionMessage={recognitionMessage}
                />
              );
            }

            return null;
          }}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
        />
      </View>
      <SummaryPage
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        title={exercise?.title || "Sentence Exercise"}
        levelLabel={String(level)}
        unitLabel={`Unit ${unit}`}
        languageLabel={selectedLanguageLabel}
        accuracyLabel={accuracyLabel}
        timeTakenLabel={formatDuration(timeSpentSeconds * 1000)}
        exercisesCompletedLabel={`${completedExerciseIds.length}/${exerciseCount}`}
        wordsLearnedLabel={0}
      />
    </SafeAreaView>
  );
};

export default SentenceExercise;

function FillInTheBlankPage({
  exercise,
  onComplete,
  onAnswerAttempt,
  onContinuePress,
}: any) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalNote, setModalNote] = useState<string | undefined>();
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"success" | "warning" | "fail">(
    "success",
  );

  const showFeedback = (
    type: "success" | "warning" | "fail",
    title: string,
    message: string,
    note?: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalNote(note);
    setModalVisible(true);
  };

  const handleCheck = () => {
    if (!selectedAnswer) {
      showFeedback(
        "warning",
        "Choose an answer",
        "Select a word to fill the blank.",
      );
      return;
    }

    const isCorrect = selectedAnswer === exercise?.correct_answer;
    onAnswerAttempt(isCorrect);

    if (isCorrect) {
      showFeedback(
        "success",
        "Great Work",
        "That is the correct answer.",
        exercise?.meaning,
      );
      return;
    }

    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries === 1) {
      showFeedback(
        "warning",
        "So Close, try again",
        "Choose another word and try once more.",
      );
    } else {
      showFeedback(
        "fail",
        "Keep Practicing",
        "You have used both tries. Let's continue to the next exercise.",
        `Correct answer: ${exercise?.correct_answer}`,
      );
    }
  };

  const sentenceParts = String(exercise?.sentence || "").split("_____");

  return (
    <View className="w-screen px-4">
      <View className="flex-1">
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          Fill in the blank
        </Text>
        {exercise ? (
          <>
            <View className="flex-row flex-wrap justify-center items-center border border-primary border-dashed rounded-xl p-6 mt-4">
              <Text className="text-2xl font-nunito-bold text-slate-500 text-center">
                {sentenceParts[0]}
              </Text>
              <View className="min-w-24 mx-2 border-b-2 border-primary items-center">
                <Text className="text-2xl font-nunito-bold text-primary">
                  {selectedAnswer || "     "}
                </Text>
              </View>
              <Text className="text-2xl font-nunito-bold text-slate-500 text-center">
                {sentenceParts.slice(1).join("_____")}
              </Text>
            </View>
            <Text className="text-base font-nunito text-slate-500 text-center mt-4">
              Choose the word that completes the sentence.
            </Text>
            <View className="w-full flex-row flex-wrap justify-center items-center gap-3 mt-8">
              {exercise.options?.map((option: string) => (
                <Pressable
                  key={option}
                  className={`rounded-lg px-5 py-3 active:opacity-70 ${selectedAnswer === option ? "bg-primary" : "border border-slate-300"}`}
                  onPress={() => setSelectedAnswer(option)}
                >
                  <Text
                    className={`text-xl font-nunito-medium ${selectedAnswer === option ? "text-white" : "text-slate-500"}`}
                  >
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              className="bg-primary mt-auto mb-4 p-3 items-center justify-center rounded-xl active:opacity-70"
              onPress={handleCheck}
            >
              <Text className="text-xl font-nunito-semibold text-white">
                Check
              </Text>
            </Pressable>
          </>
        ) : (
          <View className="flex-1 justify-center items-center px-6">
            <Text className="text-lg font-nunito text-slate-500 text-center">
              This exercise is not available for the selected language yet.
            </Text>
            <Pressable
              className="bg-primary mt-6 p-3 px-8 items-center justify-center rounded-xl active:opacity-70"
              onPress={onContinuePress}
            >
              <Text className="text-xl font-nunito-semibold text-white">
                Continue
              </Text>
            </Pressable>
          </View>
        )}
      </View>
      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        note={modalNote}
        actionLabel={
          modalType === "warning" && tries > 0 ? "Try again" : "Continue"
        }
        onAction={() => {
          setModalVisible(false);
          if (modalType === "warning" && tries > 0) {
            setSelectedAnswer(null);
          } else {
            if (modalType === "success") {
              onComplete();
            }
            onContinuePress();
          }
        }}
      />
    </View>
  );
}

const IntroductionPage = ({ exercise, onContinuePress }: any) => {
  return (
    <View className="w-screen px-4">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          {exercise?.exercise_title || "Welcome to the Words Exercise!"}
        </Text>
        <Text className="text-base font-nunito text-slate-500 text-center mt-4">
          {exercise?.description_sentence}
        </Text>
      </View>
      <View className="flex-row gap-4 mt-auto">
        <Pressable
          className="flex-1 bg-primary p-3 items-center justify-center rounded-xl disabled:opacity-50"

          onPress={onContinuePress}
        >
          <Text className="text-xl font-nunito-semibold text-slate-50 text-center">
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const SpeechFeedback = ({
  transcript,
  message,
}: {
  transcript: string;
  message: string;
}) => {
  if (!message) return null;

  return (
    <View className="mt-3 rounded-lg bg-slate-100 p-3">
      {transcript ? (
        <Text className="text-sm font-nunito text-slate-600">
          Heard: {transcript}
        </Text>
      ) : null}
      <Text className="text-sm font-nunito-semibold text-slate-700">
        {message}
      </Text>
    </View>
  );
};

const ArrangeTranslationPage = ({
  exercise,
  isEnglishToTarget = false,
  lang,
  onComplete,
  onAnswerAttempt,
  onContinuePress,
  onSpeakWord,
  onRecognizeSpeech,
  isRecognizing,
  recognizedSpeech,
  recognitionMessage,
}: any) => {
  const [answerSeq, setAnswerSeq] = useState<
    { word: string; optionIndex: number }[]
  >([]);
  const [tries, setTries] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalNote, setModalNote] = useState<string | undefined>();
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"success" | "warning" | "fail">(
    "success",
  );
  const [meaningsModalVisible, setMeaningsModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [selectedMeaning, setSelectedMeaning] = useState("");

  const showFeedback = (
    type: "success" | "warning" | "fail",
    title: string,
    message: string,
    note?: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalNote(note);
    setModalVisible(true);
  };

  const handleOptionPress = (word: string, optionIndex: number) => {
    setAnswerSeq((prev) => [...prev, { word, optionIndex }]);
  };

  const handleAnswerPress = (answerIndex: number) => {
    setAnswerSeq((prev) => prev.filter((_, index) => index !== answerIndex));
  };

  const handleQuestionWordPress = (word: string) => {
    setSelectedWord(word);
    setSelectedMeaning(
      getMeaningForWord(exercise?.meanings, word) ||
        "No meaning available for this word.",
    );
    setMeaningsModalVisible(true);
  };

  const getEnglishToTargetMeaning = () =>
    exercise?.correct_order
      ?.map(
        (word: string) => getMeaningForWord(exercise?.meanings, word) || word,
      )
      .join(" ");

  const getCorrectAnswer = () => exercise?.correct_order?.join(" ");

  const handleCheck = () => {
    const isCorrect =
      answerSeq.length === exercise?.correct_order?.length &&
      answerSeq.every(
        ({ word }: { word: string }, index: number) =>
          word === exercise.correct_order[index],
      );

    if (isCorrect) {
      onAnswerAttempt(true);
      const meaning = isEnglishToTarget
        ? getEnglishToTargetMeaning()
        : undefined;
      showFeedback(
        "success",
        "Great Work",
        "That is the correct translation.",
        meaning ? `Meaning: ${meaning}` : undefined,
      );
      return;
    }

    onAnswerAttempt(false);
    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries === 1) {
      showFeedback(
        "warning",
        "So Close, try again",
        "Try arranging the words again.",
      );
    } else {
      showFeedback(
        "fail",
        "Keep Practicing",
        "You have used both tries. Let's continue to the next exercise.",
        `Correct answer: ${getCorrectAnswer()}`,
      );
    }
  };

  const selectedOptionIndices = new Set(
    answerSeq.map(({ optionIndex }) => optionIndex),
  );
  return (
    <View className="w-screen px-4">
      <View className="flex-1">
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          {exercise?.exercise_title || "MCQ Translation Exercise"}
        </Text>
        <View className="flex-row justify-center items-center gap-4 border border-primary border-dashed rounded-xl p-6 mt-4">
          {!isEnglishToTarget && (
            <Pressable
              className="p-2 rounded-lg bg-primary active:opacity-70"
              onPress={() => onSpeakWord(exercise?.sentence)}
            >
              <Volume2 size={28} color="#fff" />
            </Pressable>
          )}
          <Pressable
            className={`p-2 rounded-lg active:opacity-70 ${isRecognizing ? "bg-rose-600" : "bg-primary"}`}
            accessibilityRole="button"
            accessibilityLabel={
              isRecognizing ? "Stop speech recognition" : "Practice speaking"
            }
            onPress={() =>
              onRecognizeSpeech(
                isEnglishToTarget
                  ? exercise?.correct_order?.join(" ") || ""
                  : exercise?.sentence || "",
                lang,
              )
            }
          >
            {isRecognizing ? (
              <MicOff size={28} color="#fff" />
            ) : (
              <Mic size={28} color="#fff" />
            )}
          </Pressable>
          <View className="flex-row flex-wrap gap-2 justify-center">
            {exercise?.sentence
              .split(" ")
              .map((word: string, index: number) => (
                <Pressable
                  key={index}
                  className="border-b-2 border-slate-300 border-dashed active:opacity-70"
                  onPress={
                    isEnglishToTarget
                      ? undefined
                      : () => handleQuestionWordPress(word)
                  }
                >
                  <Text className="text-2xl font-nunito-bold text-slate-500">
                    {word}
                  </Text>
                </Pressable>
              ))}
          </View>
        </View>
        <SpeechFeedback
          transcript={recognizedSpeech}
          message={recognitionMessage}
        />
        <View className="w-full min-h-16 flex-row flex-wrap items-center gap-2 self-start my-8 border-b border-slate-300 pb-2">
          {answerSeq.map(({ word }, index) => (
            <Pressable
              key={index}
              onPress={() => handleAnswerPress(index)}
              className="border border-slate-300 rounded-lg px-4 py-2 active:opacity-70"
            >
              <Text className="text-xl font-nunito-medium text-slate-500">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="w-full flex-row flex-wrap items-center gap-2 self-start mt-4">
          {exercise?.options.map((word: string, index: number) => (
            <Pressable
              key={index}
              className={`rounded-lg px-4 py-2 ${selectedOptionIndices.has(index) ? "border border-transparent opacity-0" : "border border-slate-300 active:opacity-70"}`}
              disabled={selectedOptionIndices.has(index)}
              onPress={() => handleOptionPress(word, index)}
            >
              <Text className="text-xl font-nunito-medium text-slate-500">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          className="bg-primary mt-auto mb-4 p-3 items-center justify-center rounded-xl active:opacity-70"
          onPress={handleCheck}
        >
          <Text className="text-xl font-nunito-semibold text-white">Check</Text>
        </Pressable>
      </View>
      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        note={modalNote}
        actionLabel={modalType === "warning" ? "Try again" : "Continue"}
        onAction={() => {
          setModalVisible(false);
          if (modalType === "warning") {
            setAnswerSeq([]);
          } else {
            if (modalType === "success") {
              onComplete();
            }
            onContinuePress();
          }
        }}
      />
      <MeaningsModal
        visible={meaningsModalVisible}
        word={selectedWord}
        meaning={selectedMeaning}
        onClose={() => setMeaningsModalVisible(false)}
      />
    </View>
  );
};

const getMeaningForWord = (
  meanings: Record<string, string> | undefined,
  word: string,
) => {
  if (!meanings) {
    return undefined;
  }

  const normalizedWord = normalizeMeaningWord(word);
  const meaningKey = Object.keys(meanings).find(
    (key) => normalizeMeaningWord(key) === normalizedWord,
  );

  return meaningKey ? meanings[meaningKey] : undefined;
};

const normalizeMeaningWord = (word: string) =>
  word.trim().replace(/^[.,!?;:()[\]{}"'“”‘’]+|[.,!?;:()[\]{}"'“”‘’]+$/g, "");

const FeedbackModal = ({
  visible,
  type,
  title,
  message,
  note,
  actionLabel,
  onAction,
}: {
  visible: boolean;
  type: "success" | "warning" | "fail";
  title: string;
  message: string;
  note?: string;
  actionLabel: string;
  onAction: () => void;
}) => {
  const titleColor =
    type === "success"
      ? "text-green-600"
      : type === "warning"
        ? "text-amber-600"
        : "text-red-600";

  return (
    <Modal animationType="slide" visible={visible} transparent>
      <View className="flex-1 justify-center items-center">
        <View className="w-full bg-slate-50 mt-auto p-6 rounded-tl-3xl rounded-tr-3xl border border-slate-200">
          <Text
            className={`text-3xl font-nunito-bold text-center ${titleColor}`}
          >
            {title}
          </Text>
          <Text className="mt-2 text-slate-600 font-nunito text-base text-center">
            {message}
          </Text>
          {note && (
            <Text className="mt-3 text-slate-700 font-nunito-semibold text-base text-center">
              {note}
            </Text>
          )}
          <Pressable
            className="mt-4 rounded-xl bg-primary px-4 py-3 items-center active:opacity-70"
            onPress={onAction}
          >
            <Text className="text-white font-nunito-bold text-lg">
              {actionLabel}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const ListenAndChoosePage = ({
  exercise,
  lang,
  onComplete,
  onAnswerAttempt,
  onContinuePress,
  onSpeakWord,
  onRecognizeSpeech,
  isRecognizing,
  recognizedSpeech,
  recognitionMessage,
}: any) => {
  const [answerSeq, setAnswerSeq] = useState<
    { word: string; optionIndex: number }[]
  >([]);
  const [tries, setTries] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalNote, setModalNote] = useState<string | undefined>();
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"success" | "warning" | "fail">(
    "success",
  );

  const showFeedback = (
    type: "success" | "warning" | "fail",
    title: string,
    message: string,
    note?: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalNote(note);
    setModalVisible(true);
  };

  const getCorrectAnswer = () => exercise?.correct_order?.join(" ");

  const handleCheck = () => {
    const isCorrect =
      answerSeq.length === exercise?.correct_order?.length &&
      answerSeq.every(
        ({ word }: { word: string }, index: number) =>
          word === exercise.correct_order[index],
      );

    if (isCorrect) {
      onAnswerAttempt(true);
      showFeedback(
        "success",
        "Great Work",
        "That is the correct word order.",
        exercise?.meaning,
      );
      return;
    }

    onAnswerAttempt(false);
    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries === 1) {
      showFeedback(
        "warning",
        "So Close, try again",
        "Try arranging the words again.",
      );
    } else {
      showFeedback(
        "fail",
        "Keep Practicing",
        "You have used both tries. Let's continue to the next exercise.",
        `Correct answer: ${getCorrectAnswer()}`,
      );
    }
  };

  const selectedOptionIndices = new Set(
    answerSeq.map(({ optionIndex }) => optionIndex),
  );

  return (
    <View className="w-screen px-4">
      <View className="flex-1">
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          Listen and choose the correct word order
        </Text>
        <View className="flex-row justify-center items-center gap-3 border border-primary border-dashed rounded-xl p-6 mt-4">
          <Pressable
            className="p-4 rounded-xl bg-primary active:opacity-70"
            onPress={() => onSpeakWord(exercise?.sentence)}
          >
            <Volume2 size={36} color="#fff" />
          </Pressable>
          <Pressable
            className={`p-4 rounded-xl active:opacity-70 ${isRecognizing ? "bg-rose-600" : "bg-primary"}`}
            accessibilityRole="button"
            accessibilityLabel={
              isRecognizing ? "Stop speech recognition" : "Practice speaking"
            }
            onPress={() =>
              onRecognizeSpeech(exercise?.sentence || "", lang)
            }
          >
            {isRecognizing ? (
              <MicOff size={36} color="#fff" />
            ) : (
              <Mic size={36} color="#fff" />
            )}
          </Pressable>
        </View>
        <SpeechFeedback
          transcript={recognizedSpeech}
          message={recognitionMessage}
        />
        <View className="w-full min-h-16 flex-row flex-wrap items-center gap-2 self-start my-8 border-b border-slate-300 pb-2">
          {answerSeq.map(({ word }, index) => (
            <Pressable
              key={index}
              onPress={() =>
                setAnswerSeq((prev) =>
                  prev.filter((_, answerIndex) => answerIndex !== index),
                )
              }
              className="border border-slate-300 rounded-lg px-4 py-2 active:opacity-70"
            >
              <Text className="text-xl font-nunito-medium text-slate-500">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="w-full flex-row flex-wrap items-center gap-2 self-start mt-4">
          {exercise?.options.map((word: string, index: number) => (
            <Pressable
              key={index}
              className={`rounded-lg px-4 py-2 ${selectedOptionIndices.has(index) ? "border border-transparent opacity-0" : "border border-slate-300 active:opacity-70"}`}
              disabled={selectedOptionIndices.has(index)}
              onPress={() =>
                setAnswerSeq((prev) => [...prev, { word, optionIndex: index }])
              }
            >
              <Text className="text-xl font-nunito-medium text-slate-500">
                {word}
              </Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          className="bg-primary mt-auto mb-4 p-3 items-center justify-center rounded-xl active:opacity-70"
          onPress={handleCheck}
        >
          <Text className="text-xl font-nunito-semibold text-white">Check</Text>
        </Pressable>
      </View>
      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        note={modalNote}
        actionLabel={modalType === "warning" ? "Try again" : "Continue"}
        onAction={() => {
          setModalVisible(false);
          if (modalType === "warning") {
            setAnswerSeq([]);
          } else {
            if (modalType === "success") {
              onComplete();
            }
            onContinuePress();
          }
        }}
      />
    </View>
  );
};

const MeaningsModal = ({
  visible,
  word,
  meaning,
  onClose,
}: {
  visible: boolean;
  word: string;
  meaning: string;
  onClose: () => void;
}) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center">
        <View className="w-full bg-slate-50 mt-auto p-6 rounded-tl-3xl rounded-tr-3xl border border-slate-200">
          <Text className="text-3xl font-nunito-bold text-primary">{`Meaning: ${word}`}</Text>
          {meaning.split(",").map((line, index) => (
            <Text
              key={index}
              className="border-b border-slate-400 mt-2 text-slate-600 font-nunito text-lg py-2"
            >
              {`${index + 1}. ${line.trim()}`}
            </Text>
          ))}
          <Pressable
            className="mt-4 rounded-xl bg-primary px-4 py-3 items-center active:opacity-70"
            onPress={onClose}
          >
            <Text className="text-white font-nunito-bold text-lg">Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

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
}) => {
  return (
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
};

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
