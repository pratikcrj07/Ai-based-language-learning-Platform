import { speakText, stopSpeech } from "@/lib/speech";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import { useUserStore } from "@/store/store";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Languages, Mic, MicOff, Volume2 } from "lucide-react-native";
import React, { useEffect } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import exercises from "../../data/wordExercises.json";
import { getUnit } from "../../lib/getUnit";
import { syncCompletedLesson } from "../../lib/progressSync";

const WordExercise = () => {
  const { selectedLang } = useUserStore();
  const pageListRef = React.useRef<FlatList>(null);
  const pageStartRef = React.useRef(Date.now());
  const { level, unit } = useLocalSearchParams();
  const screenWidth = Math.round(Dimensions.get("window").width);
  const [page, setPage] = React.useState(1);
  const [showSummary, setShowSummary] = React.useState(false);
  const [completedExerciseIds, setCompletedExerciseIds] = React.useState<
    number[]
  >([]);
  const [totalAttempts, setTotalAttempts] = React.useState(0);
  const [correctAttempts, setCorrectAttempts] = React.useState(0);
  const progressReportedRef = React.useRef(false);
  const {
    isRecognizing,
    recognizedSpeech,
    recognitionMessage,
    activeSpeechTarget,
    startRecognition,
    resetRecognition,
  } = useSpeechRecognition();

  const unitData = getUnit(
    selectedLang as any,
    level as any,
    parseInt(unit as string, 10),
  );

  const totalPages = exercises.exercises.find(
    (ex) => ex.level === level && ex.unit === parseInt(unit as string, 10),
  )?.content.length;
  const exercise = exercises.exercises.find(
    (ex) => ex.level === level && ex.unit === parseInt(unit as string, 10),
  );
  const selectedLanguageLabel =
    selectedLang === "fr"
      ? "French"
      : selectedLang === "de"
        ? "German"
        : selectedLang.toUpperCase();
  const timeSpentSeconds = Math.floor(
    (Date.now() - pageStartRef.current) / 1000,
  );
  const timeSpentLabel = formatDuration(timeSpentSeconds * 1000);
  const exerciseCount =
    exercise?.content.filter((item) => item.exercise_type !== "introduction")
      .length || 0;
  const accuracyLabel = totalAttempts
    ? `${Math.round((correctAttempts / totalAttempts) * 100)}%`
    : "0%";

  const handleExerciseCompleted = (exerciseId: number) => {
    setCompletedExerciseIds((completedIds) =>
      completedIds.includes(exerciseId)
        ? completedIds
        : [...completedIds, exerciseId],
    );
  };

  const handleAnswerAttempt = (isCorrect: boolean) => {
    setTotalAttempts((attempts) => attempts + 1);
    if (isCorrect) {
      setCorrectAttempts((attempts) => attempts + 1);
    }
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

  const handleSwipeEnd = (event: any) => {
    const visiblePage = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    ) + 1;
    if (visiblePage >= 1 && visiblePage <= (totalPages || 1)) {
      resetRecognition();
      setPage(visiblePage);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSpeakWord = (word: any) => {
    void speakText(word, selectedLang);
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
      requestAnimationFrame(() => {
        pageListRef.current?.scrollToIndex({
          index: page - 1,
          animated: true,
        });
      });
    }
  }, [page, screenWidth]);

  useEffect(() => {
    return () => {
      void stopSpeech();
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 mb-4">
      <View className="mt-4 mx-4">
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
          horizontal
          pagingEnabled
          onMomentumScrollEnd={handleSwipeEnd}
          getItemLayout={(_, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => {
            const currentPage = index + 1;
            if (item.exercise_type === "introduction") {
              return (
                <IntroductionPage
                  pageWidth={screenWidth}
                  exercise={unitData?.contents.find(
                    (c) => c.content_type === "introduction",
                  )}
                  lang={selectedLang}
                  onContinuePress={() => handlePageChange(currentPage + 1)}
                />
              );
            }
            if (item.exercise_type === "words") {
              return (
                <WordPage
                  pageWidth={screenWidth}
                  words={
                    unitData?.contents.find((c) => c.content_type === "words")
                      .contents || []
                  }
                  exercise={unitData?.contents
                    .find((c) => c.content_type === "word_content")
                    .contents.find((e: any) => item.exercise_id == e.id)}
                  lang={selectedLang}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onContinuePress={() => handlePageChange(currentPage + 1)}
                  onSpeakWord={handleSpeakWord}
                  onRecognizeSpeech={startRecognition}
                  isRecognizing={isRecognizing}
                  activeSpeechTarget={activeSpeechTarget}
                  recognizedSpeech={recognizedSpeech}
                  recognitionMessage={recognitionMessage}
                />
              );
            }
            if (item.exercise_type === "matching") {
              return (
                <WordMatchingPage
                  pageWidth={screenWidth}
                  words={
                    unitData?.contents.find((c) => c.content_type === "words")
                      ?.contents || []
                  }
                  exercise={unitData?.contents
                    .find((c) => c.content_type === "matching_exercises")
                    .exercises.find((e: any) => item.exercise_id == e.id)}
                  structure={item}
                  lang={selectedLang}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onAnswerAttempt={handleAnswerAttempt}
                  onContinuePress={() => handlePageChange(currentPage + 1)}
                  onSpeakWord={handleSpeakWord}
                />
              );
            }
            if (item.exercise_type === "mcq_translation") {
              return (
                <MCQTranslationPage
                  pageWidth={screenWidth}
                  words={
                    unitData?.contents.find((c) => c.content_type === "words")
                      ?.contents || []
                  }
                  structure={item}
                  exercise={unitData?.contents
                    .find((c) => c.content_type === "mcq_translation_exercises")
                    .exercises.find((e: any) => item.exercise_id == e.id)}
                  onComplete={() => handleExerciseCompleted(item.id)}
                  onAnswerAttempt={handleAnswerAttempt}
                  lang={selectedLang}
                  onContinuePress={() => handlePageChange(currentPage + 1)}
                />
              );
            }

            return null;
          }}
        />
      </View>
      <SummaryPage
        showSummary={showSummary}
        setShowSummary={setShowSummary}
        title={exercise?.title || "Words Exercise"}
        levelLabel={String(level)}
        unitLabel={`Unit ${unit}`}
        languageLabel={selectedLanguageLabel}
        accuracyLabel={accuracyLabel}
        timeTakenLabel={timeSpentLabel}
        timeTakenSeconds={timeSpentSeconds}
        exercisesCompletedLabel={`${completedExerciseIds.length}/${exerciseCount}`}
        wordsLearnedLabel={
          unitData?.contents.find((c) => c.content_type === "words")?.contents
            .length || 0
        }
      />
    </SafeAreaView>
  );
};

export default WordExercise;

const IntroductionPage = ({
  pageWidth,
  exercise,
  lang,
  onContinuePress,
}: {
  pageWidth: number;
  exercise: any;
  lang: string;
  onContinuePress: () => void;
}) => {
  return (
    <View style={{ width: pageWidth }} className="px-4">
      <View className="flex-1 justify-center items-center">
        {/* <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          {exercise?.exercise_title || "Welcome to the Words Exercise!"}
        </Text> */}
        <Text className="text-base font-nunito text-slate-500 text-center mt-4">
          {exercise?.description_word}
        </Text>
      </View>
      <Pressable
        className="mt-auto flex-col bg-primary p-4 items-center justify-center rounded-xl"
        onPress={onContinuePress}
      >
        <Text className="text-xl font-nunito-semibold text-slate-50 text-center">
          Continue
        </Text>
      </Pressable>
    </View>
  );
};

const WordPage = ({
  pageWidth,
  words,
  exercise,
  lang,
  onContinuePress,
  onSpeakWord,
  onRecognizeSpeech,
  isRecognizing,
  activeSpeechTarget,
  recognizedSpeech,
  recognitionMessage,
  onComplete,
}: any) => {
  const displayWords = exercise.words.map((wordId: number) =>
    words.find((w: any) => w.id === wordId),
  );
  return (
    <View style={{ width: pageWidth }} className="px-4">
      <View>
        <Text className="font-nunito-medium text-slate-500">
          (Try repeating these words after the audio to practice your
          pronunciation.)
        </Text>
      </View>
      <View className="flex-1 mt-2">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {displayWords.length > 0 &&
            displayWords.map((wordData: any) => (
              <View
                key={wordData.id}
                className="items-center border border-slate-300 rounded-xl p-6 mb-4"
              >
                <Text className="text-3xl font-nunito-bold text-slate-600 mt-2">
                  {wordData.word}
                </Text>
                <View className="flex-row items-center gap-2 mt-2">
                  <View className="flex-row items-center gap-1 bg-slate-200 px-2 py-2 rounded-full">
                    <Languages size={16} color="#64748b" strokeWidth={2} />
                  </View>
                  <Text className="text-xl font-nunito text-slate-500">
                    {wordData.translation}
                  </Text>
                </View>
                <View className="mt-4 flex-row flex-wrap justify-center gap-3">
                  <Pressable
                    className="flex-row items-center gap-2 rounded-full bg-primary px-4 py-2 active:opacity-70"
                    onPress={() => onSpeakWord(wordData?.word)}
                  >
                    <Volume2 size={24} color="#fff" strokeWidth={2} />
                    <Text className="text-white font-nunito-semibold text-lg">
                      Listen
                    </Text>
                  </Pressable>
                  <Pressable
                    className={`flex-row items-center gap-2 rounded-full px-4 py-2 active:opacity-70 ${isRecognizing && activeSpeechTarget === wordData.word ? "bg-rose-600" : "bg-slate-600"}`}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isRecognizing && activeSpeechTarget === wordData.word
                        ? `Stop practicing ${wordData.word}`
                        : `Practice saying ${wordData.word}`
                    }
                    disabled={
                      isRecognizing && activeSpeechTarget !== wordData.word
                    }
                    onPress={() => onRecognizeSpeech(wordData.word, lang)}
                  >
                    {isRecognizing && activeSpeechTarget === wordData.word ? (
                      <MicOff size={22} color="#fff" />
                    ) : (
                      <Mic size={22} color="#fff" />
                    )}
                    <Text className="text-white font-nunito-semibold text-base">
                      Practice
                    </Text>
                  </Pressable>
                </View>
                {activeSpeechTarget === wordData.word && recognitionMessage ? (
                  <View className="mt-3 w-full rounded-lg bg-slate-100 p-3">
                    {recognizedSpeech ? (
                      <Text className="text-sm font-nunito text-slate-600">
                        Heard: {recognizedSpeech}
                      </Text>
                    ) : null}
                    <Text className="text-sm font-nunito-semibold text-slate-700">
                      {recognitionMessage}
                    </Text>
                  </View>
                ) : null}
              </View>
            ))}
        </ScrollView>
      </View>
      <View className="flex-row gap-4 mt-auto">
        <Pressable
          className="flex-1 bg-primary p-3 items-center justify-center rounded-xl disabled:opacity-50"

          onPress={() => {
            onComplete();
            onContinuePress();
          }}
        >
          <Text className="text-xl font-nunito-semibold text-slate-50 text-center">
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const WordMatchingPage = ({
  pageWidth,
  words,
  exercise,
  structure,
  lang,
  onContinuePress,
  onSpeakWord,
  onComplete,
  onAnswerAttempt,
}: any) => {
  const [tries, setTries] = React.useState(0);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalType, setModalType] = React.useState<
    "success" | "warning" | "fail"
  >("success");
  const [selectedQuestions, setSelectedQuestions] = React.useState<
    string | null
  >(null);
  const [selectedAnswers, setSelectedAnswers] = React.useState<string | null>(
    null,
  );
  const [correctMatches, setCorrectMatches] = React.useState<
    { question: string; answer: string }[]
  >([]);
  const question_words =
    words.filter((w: any) => exercise.question_words.includes(w.id)) || [];
  const answers_words =
    exercise.answer_words.map((id: number) =>
      words.find((w: any) => w.id === id),
    ) || [];

  const showFeedback = (
    type: "success" | "warning" | "fail",
    title: string,
    message: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleIncorrectMatch = () => {
    const nextTries = tries + 1;
    setTries(nextTries);

    if (nextTries === 1) {
      showFeedback("warning", "So Close, try again", "Try another match.");
    } else {
      showFeedback(
        "fail",
        "Keep Practicing",
        "You have used both tries. Let's continue to the next exercise.",
      );
    }
  };

  const handleCorrectMatch = (question: string, answer: string) => {
    onAnswerAttempt(true);
    const nextMatches = [...correctMatches, { question, answer }];
    setCorrectMatches(nextMatches);

    if (nextMatches.length === question_words.length) {
      showFeedback(
        "success",
        "Great Work",
        "You matched all the words correctly.",
      );
    }
  };

  const handleQuestionSelect = (question: string) => {
    if (selectedQuestions === question) {
      setSelectedQuestions(null);
    } else {
      setSelectedQuestions(question);
      onSpeakWord(question);
    }
    if (selectedAnswers) {
      const matchedAnswer = words.find((ans: any) => ans.word === question);
      if (matchedAnswer && matchedAnswer[`translation`] === selectedAnswers) {
        handleCorrectMatch(question, selectedAnswers);
      } else {
        onAnswerAttempt(false);
        handleIncorrectMatch();
      }
      setSelectedQuestions(null);
      setSelectedAnswers(null);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswers === answer) {
      setSelectedAnswers(null);
    } else {
      setSelectedAnswers(answer);
    }
    if (selectedQuestions) {
      const matchedAnswer = words.find(
        (ans: any) => ans.translation === answer,
      );
      if (matchedAnswer && matchedAnswer[`word`] === selectedQuestions) {
        handleCorrectMatch(selectedQuestions, answer);
      } else {
        onAnswerAttempt(false);
        handleIncorrectMatch();
      }
      setSelectedQuestions(null);
      setSelectedAnswers(null);
    }
  };
  return (
    <View style={{ width: pageWidth }} className="px-4">
      <View>
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          Match with correct translations
        </Text>
        <View className="flex-row gap-4 mt-4">
          <View className="flex-1">
            {question_words.map((word: any, index: number) => (
              <Pressable
                key={index}
                className={`h-32 justify-center items-center p-4 gap-4 mt-4 rounded-xl border active:opacity-70 disabled:border-primary disabled:bg-primary/20 ${selectedQuestions === word.word ? "border-primary" : "border-slate-300"}`}
                disabled={correctMatches.some(
                  (match) => match.question === word.word,
                )}
                onPress={() => handleQuestionSelect(word.word)}
              >
                <Text
                  className={`text-lg font-nunito  ${selectedQuestions === word.word ? "text-primary" : "text-slate-500"}`}
                >
                  {word.word}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-1">
            {answers_words.map((answer: any, index: number) => (
              <Pressable
                key={index}
                className={`h-32 justify-center border ${selectedAnswers === answer.translation ? "border-primary" : "border-slate-300"} p-4 gap-4 mt-4 items-center rounded-xl active:opacity-70 disabled:border-primary disabled:bg-primary/20`}

                disabled={correctMatches.some(
                  (match) => match.answer === answer.translation,
                )}
                onPress={() => handleAnswerSelect(answer.translation)}
              >
                <Text
                  className={`text-lg font-nunito  ${selectedAnswers === answer.translation ? "text-primary" : "text-slate-500"}`}
                >
                  {answer.translation}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "warning" ? "Try again" : "Continue"}
        onAction={() => {
          setModalVisible(false);
          if (modalType === "success") {
            onComplete();
          }
          if (modalType !== "warning") {
            setTimeout(onContinuePress, 350);
          }
        }}
      />
    </View>
  );
};

const MCQTranslationPage = ({
  pageWidth,
  words,
  structure,
  exercise,
  lang,
  onContinuePress,
  onComplete,
  onAnswerAttempt,
}: any) => {
  const [tries, setTries] = React.useState(0);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalMessage, setModalMessage] = React.useState("");
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalType, setModalType] = React.useState<
    "success" | "warning" | "fail"
  >("success");
  const question_word = words.find(
    (w: any) => w.id === exercise.question_word,
  )?.word;
  const correctAnswer = words.find(
    (w: any) => w.id === exercise.question_word,
  )?.translation;
  const answerOptions =
    exercise?.options.map(
      (id: number) => words.find((w: any) => w.id === id)?.translation,
    ) || [];
  const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
    null,
  );
  const isAnswerCorrect = selectedAnswer === correctAnswer;

  const showFeedback = (
    type: "success" | "warning" | "fail",
    title: string,
    message: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    const answerIsCorrect = answer === correctAnswer;

    if (answerIsCorrect) {
      onAnswerAttempt(true);
      showFeedback("success", "Great Work", "That is the correct translation.");
      return;
    }

    onAnswerAttempt(false);
    const nextTries = tries + 1;
    setTries(nextTries);
    if (nextTries === 1) {
      showFeedback("warning", "So Close, try again", "Choose another answer.");
    } else {
      showFeedback(
        "fail",
        "Keep Practicing",
        "You have used both tries. Let's continue to the next exercise.",
      );
    }
  };

  return (
    <View style={{ width: pageWidth }} className="px-4">
      <View>
        <Text className="text-2xl font-nunito-bold text-slate-600 text-center">
          Choose the correct translation
        </Text>
        <View className="border border-slate-300 border-dashed rounded-xl p-6 mt-4">
          <Text className="text-2xl font-nunito-bold text-slate-500 text-center">
            {question_word}
          </Text>
        </View>
        <View className="flex-row flex-wrap mt-4">
          {answerOptions.map((option: any, index: number) => (
            <View className="w-1/2 px-2" key={index}>
              <Pressable
                className={`h-32 border p-4 gap-4 mt-4 justify-center items-center rounded-xl active:opacity-70
                    ${selectedAnswer === option ? (isAnswerCorrect ? "border-green-300 bg-green-100" : "border-red-300 bg-red-100") : "border-slate-300"}`}
                onPress={() => handleAnswerSelect(option)}
              >
                <Text
                  className={
                    "text-lg font-nunito " +
                    (selectedAnswer === option
                      ? isAnswerCorrect
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-slate-500")
                  }
                >
                  {option}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>
      <FeedbackModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        actionLabel={modalType === "warning" ? "Try again" : "Continue"}
        onAction={() => {
          setModalVisible(false);
          setSelectedAnswer(null);
          if (modalType === "success") {
            onComplete();
          }
          if (modalType !== "warning") {
            setTimeout(onContinuePress, 350);
          }
        }}
      />
    </View>
  );
};

const FeedbackModal = ({
  visible,
  type,
  title,
  message,
  actionLabel,
  onAction,
}: {
  visible: boolean;
  type: "success" | "warning" | "fail";
  title: string;
  message: string;
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

const SummaryPage = ({
  showSummary,
  setShowSummary,
  title,
  levelLabel,
  unitLabel,
  languageLabel,
  accuracyLabel,
  timeTakenLabel,
  timeTakenSeconds,
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
  timeTakenSeconds: number;
  exercisesCompletedLabel: string;
  wordsLearnedLabel: number;
}) => {
  useEffect(() => {
    if (showSummary) {
      const summaryStats = {
        exerciseTitle: title,
        level: levelLabel,
        unit: unitLabel,
        language: languageLabel,
        accuracy: accuracyLabel,
        timeTakenSeconds,
        exercisesCompleted: exercisesCompletedLabel,
        wordsLearned: wordsLearnedLabel,
      };

      console.log("Word exercise summary stats:");
      console.log(JSON.stringify(summaryStats, null, 2));
    }
  }, [
    showSummary,
    title,
    levelLabel,
    unitLabel,
    languageLabel,
    accuracyLabel,
    timeTakenLabel,
    timeTakenSeconds,
    exercisesCompletedLabel,
    wordsLearnedLabel,
  ]);

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
                <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <Text className="text-slate-400 font-nunito text-sm">
                    Accuracy
                  </Text>
                  <Text className="mt-2 text-2xl font-nunito-bold text-slate-900">
                    {accuracyLabel}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <Text className="text-slate-400 font-nunito text-sm">
                    Time Taken
                  </Text>
                  <Text className="mt-2 text-2xl font-nunito-bold text-slate-900">
                    {timeTakenLabel}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <Text className="text-slate-400 font-nunito text-sm">
                    Exercise Completed
                  </Text>
                  <Text className="mt-2 text-2xl font-nunito-bold text-slate-900">
                    {exercisesCompletedLabel}
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4">
                  <Text className="text-slate-400 font-nunito text-sm">
                    Word Learned
                  </Text>
                  <Text className="mt-2 text-2xl font-nunito-bold text-slate-900">
                    {wordsLearnedLabel}
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4">
              <Text className="text-primary font-nunito-semibold text-base">
                Great work finishing this set.
              </Text>
              <Text className="mt-2 text-slate-600 font-nunito text-base">
                You can close this summary and move on to the next lesson.
              </Text>
            </View>
          </View>

          <Pressable
            className="mt-4 rounded-xl bg-primary px-4 py-3 items-center active:opacity-70"
            onPress={() => {
              // Let the summary modal finish dismissing before leaving the
              // exercise route; navigating while it is still presented can
              // make the Close tap appear to do nothing.
              setShowSummary(false);
              setTimeout(
                () =>
                  router.replace({
                    pathname: "/exercises/[level]",
                    params: { level: levelLabel },
                  }),
                350,
              );
            }}
          >
            <Text className="text-white font-nunito-bold text-lg">Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
};
