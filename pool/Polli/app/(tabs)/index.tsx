import {
  languageNames,
  supportedLanguages,
  type LanguageCode,
} from "@/constants/languages";
import { theme } from "@/constants/theme";
import exerciseCatalog from "@/data/exerciseList.json";
import { nodeApi, pythonApi } from "@/lib/axios";
import { useUserStore } from "@/store/store";
import { router } from "expo-router";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Leaf,
  MessageCircle,
  Play,
  Search,
  X,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type UnitSearchResult = {
  id: number;
  level: string;
  title: string;
  description: string;
  relevance_score: number;
};

const Home = () => {
  const { selectedLang, setSelectedLang, languages, setLanguages, token } =
    useUserStore();
  const [isLangModalVisible, setIsLangModalVisible] = React.useState(false);
  const [learningGoal, setLearningGoal] = React.useState("");
  const [isGoalFocused, setIsGoalFocused] = React.useState(false);
  const [unitResults, setUnitResults] = React.useState<UnitSearchResult[]>([]);
  const [isSearchingUnits, setIsSearchingUnits] = React.useState(false);
  const [unitSearchError, setUnitSearchError] = React.useState<string | null>(
    null,
  );
  const [promptIndex, setPromptIndex] = React.useState(0);
  const [resumeProgress, setResumeProgress] = React.useState<{
    level: string;
    unit: number;
    exercise: number;
    mode: string;
    totalTime: number;
  } | null>(null);
  const promptTransition = React.useRef(new Animated.Value(0)).current;
  const prompts = [
    "What do you want to learn to do?",
    "Shopping",
    "Asking Direction",
    "Use public transport...",
  ];
  const langList = supportedLanguages.filter((language) =>
    languages.includes(language.code),
  );
  const activeLanguage =
    supportedLanguages.find((language) => language.code === selectedLang) ??
    langList[0] ??
    supportedLanguages[0];

  React.useEffect(() => {
    const query = learningGoal.trim();
    if (!query) {
      setUnitResults([]);
      setUnitSearchError(null);
      setIsSearchingUnits(false);
      return;
    }

    let cancelled = false;
    const searchTimeout = setTimeout(async () => {
      setIsSearchingUnits(true);
      setUnitSearchError(null);

      try {
        const response = await pythonApi.post<{ results?: UnitSearchResult[] }>(
          "/api/search-units",
          { user_input: query, top_k: 5 },
        );
        const body = response.data;

        if (response.status < 200 || response.status >= 300) {
          throw new Error("Unit search failed.");
        }

        if (!cancelled) setUnitResults(body?.results ?? []);
      } catch {
        if (!cancelled) {
          setUnitResults([]);
          setUnitSearchError("Search is unavailable right now.");
        }
      } finally {
        if (!cancelled) setIsSearchingUnits(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(searchTimeout);
    };
  }, [learningGoal]);

  React.useEffect(() => {
    if (!token) {
      setResumeProgress(null);
      return;
    }

    let cancelled = false;
    const loadProgress = async () => {
      try {
        const response = await nodeApi.get<{
          progress?: {
            lastExercise?: string | null;
            completedLesson?: string[];
            totalTime?: number;
          };
        }>("/api/progress", {
          params: { language: selectedLang },
          headers: { Accept: "application/json", Authorization: token },
        });
        const body = response.data;
        const match = body?.progress?.lastExercise?.match(
          /^([^_]+)_(\d+)_(\d+)$/,
        );
        if (
          cancelled ||
          response.status < 200 ||
          response.status >= 300 ||
          !match
        ) {
          if (!cancelled && !match) setResumeProgress(null);
          return;
        }
        const [, level] = match;
        const levelData = exerciseCatalog.exercises.find(
          (item) => item.level === level,
        );
        const completed = new Set(body?.progress?.completedLesson ?? []);
        let next: { unit: number; exercise: number; mode: string } | null =
          null;
        for (const unitData of levelData?.units ?? []) {
          for (let index = 0; index < unitData.exercises.length; index += 1) {
            const exerciseKey = `${level}_${unitData.id}_${index + 1}`;
            if (!completed.has(exerciseKey)) {
              next = {
                unit: unitData.id,
                exercise: index + 1,
                mode: unitData.exercises[index],
              };
              break;
            }
          }
          if (next) break;
        }
        if (!next) {
          if (!cancelled) setResumeProgress(null);
          return;
        }
        setResumeProgress({
          level,
          ...next,
          totalTime: body?.progress?.totalTime ?? 0,
        });
      } catch {
        if (!cancelled) setResumeProgress(null);
      }
    };
    void loadProgress();
    return () => {
      cancelled = true;
    };
  }, [selectedLang, token]);

  React.useEffect(() => {
    if (!token) return;

    const loadProfileLanguages = async () => {
      try {
        const response = await nodeApi.get<{
          success?: boolean;
          user?: { language?: LanguageCode[] };
        }>("/api/fetch-profile", {
          headers: { Accept: "application/json", Authorization: token },
        });
        const body = response.data;
        if (
          response.status >= 200 &&
          response.status < 300 &&
          body?.success &&
          body.user?.language?.length
        ) {
          setLanguages(body.user.language);
          if (!body.user.language.includes(selectedLang as LanguageCode)) {
            setSelectedLang(body.user.language[0]);
          }
        }
      } catch {
        // Home can continue using the locally cached language list.
      }
    };

    void loadProfileLanguages();
  }, [selectedLang, setLanguages, setSelectedLang, token]);

  React.useEffect(() => {
    if (learningGoal || isGoalFocused) {
      promptTransition.stopAnimation();
      promptTransition.setValue(0);
      return;
    }

    promptTransition.setValue(0);
    const promptInterval = setInterval(() => {
      Animated.timing(promptTransition, {
        toValue: 1,
        duration: 350,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (!finished) {
          return;
        }

        setPromptIndex((index) => (index + 1) % prompts.length);
        promptTransition.setValue(-1);
        Animated.timing(promptTransition, {
          toValue: 0,
          duration: 350,
          useNativeDriver: false,
        }).start();
      });
    }, 2600);

    return () => clearInterval(promptInterval);
  }, [isGoalFocused, learningGoal, promptTransition, prompts.length]);

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <Modal
        visible={isLangModalVisible}
        animationType="slide"
        onRequestClose={() => setIsLangModalVisible(false)}
        transparent
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: `${theme.color.inkStrong}80` }}
        >
          <SafeAreaView
            edges={["bottom"]}
            className="bg-surface rounded-t-[20px] p-4"
          >
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-nunito-bold text-ink-strong">
                Select Language
              </Text>
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full bg-surface-muted active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel="Close language selection"
                onPress={() => setIsLangModalVisible(false)}
              >
                <X size={20} color={theme.color.inkMuted} strokeWidth={1.8} />
              </Pressable>
            </View>
            <View className="gap-2">
              {langList.map((lang) => (
                <Pressable
                  key={lang.code}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedLang === lang.code }}
                  className={`flex-row items-center gap-3 p-3 rounded-xl border active:opacity-70 ${
                    selectedLang === lang.code
                      ? "bg-brand-soft border-brand"
                      : "bg-surface border-line-subtle"
                  }`}
                  onPress={() => {
                    setSelectedLang(lang.code);
                    setIsLangModalVisible(false);
                  }}
                >
                  <Text className="text-2xl">{lang.flag}</Text>
                  <Text className="font-nunito-semibold text-base text-ink-strong">
                    {lang.name}
                  </Text>
                  {selectedLang === lang.code && (
                    <View className="ml-auto">
                      <Check
                        size={20}
                        color={theme.color.brand}
                        strokeWidth={1.8}
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="w-full max-w-3xl self-center px-4">
          <View className="mt-4">
            <Pressable
              className="min-h-12 flex-row items-center gap-3 bg-surface border border-line-subtle px-3 py-2 rounded-xl active:bg-surface-muted self-start"
              accessibilityRole="button"
              accessibilityLabel={`Select Language, ${languageNames[activeLanguage.code]}`}
              onPress={() => setIsLangModalVisible(true)}
            >
              <Text className="text-2xl">{activeLanguage.flag}</Text>
              <Text className="font-nunito-bold text-base text-ink-strong">
                {languageNames[activeLanguage.code]}
              </Text>
              <ChevronDown
                size={18}
                color={theme.color.inkMuted}
                strokeWidth={1.8}
              />
            </Pressable>
          </View>
          <View className="mt-6">
            <View
              className={`flex-row items-center gap-3 rounded-xl border bg-surface px-4 ${isGoalFocused ? "border-brand" : "border-line"}`}
            >
              <Search
                size={20}
                color={isGoalFocused ? theme.color.brand : theme.color.inkMuted}
                strokeWidth={1.8}
              />
              <View className="relative flex-1 justify-center overflow-hidden">
                <TextInput
                  value={learningGoal}
                  onChangeText={setLearningGoal}
                  onFocus={() => setIsGoalFocused(true)}
                  onBlur={() => setIsGoalFocused(false)}
                  className="min-h-14 py-4 font-nunito text-base text-ink"
                  selectionColor={theme.color.brand}
                  multiline
                  accessibilityLabel="Learning goal"
                />
                {!learningGoal && !isGoalFocused && (
                  <Animated.Text
                    pointerEvents="none"
                    className="absolute left-0 right-0 font-nunito text-base text-ink-muted"
                    style={{
                      opacity: promptTransition.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [0, 1, 0],
                      }),
                      transform: [
                        {
                          translateY: promptTransition.interpolate({
                            inputRange: [-1, 0, 1],
                            outputRange: [20, 0, -20],
                          }),
                        },
                      ],
                    }}
                  >
                    {prompts[promptIndex]}
                  </Animated.Text>
                )}
              </View>
            </View>
          </View>
          {learningGoal.trim() && (
            <View className="mt-3 overflow-hidden rounded-xl border border-line-subtle bg-surface">
              {isSearchingUnits && (
                <View className="flex-row items-center gap-2 px-4 py-3">
                  <ActivityIndicator color={theme.color.brand} size="small" />
                  <Text className="font-nunito text-sm text-ink-muted">
                    Finding lessons...
                  </Text>
                </View>
              )}
              {unitSearchError && !isSearchingUnits && (
                <Text className="px-4 py-3 font-nunito text-sm text-danger">
                  {unitSearchError}
                </Text>
              )}
              {!isSearchingUnits &&
                !unitSearchError &&
                unitResults.length === 0 && (
                  <Text className="px-4 py-3 font-nunito text-sm text-ink-muted">
                    No matching lessons found.
                  </Text>
                )}
              {!isSearchingUnits &&
                unitResults.map((result) => (
                  <Pressable
                    key={`${result.level}-${result.id}`}
                    className="flex-row items-center gap-3 border-b border-line-subtle px-4 py-3 last:border-b-0 active:bg-brand-subtle"
                    onPress={() => router.push(`/exercises/${result.level}`)}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${result.title}, ${result.level}`}
                  >
                    <View className="h-10 w-10 items-center justify-center rounded-lg bg-brand-soft">
                      <Text className="font-nunito-bold text-sm text-primary">
                        {result.level}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-nunito-bold text-base text-ink-strong">
                        {result.title}
                      </Text>
                      <Text className="mt-1 font-nunito text-sm text-ink-muted">
                        {result.description}
                      </Text>
                    </View>
                    <ChevronRight
                      size={20}
                      color={theme.color.inkMuted}
                      strokeWidth={1.8}
                    />
                  </Pressable>
                ))}
            </View>
          )}
          {resumeProgress && (
            <Pressable
              className="mt-6 rounded-2xl bg-primary p-5 active:bg-brand-strong"
              onPress={() => router.push(`/exercises/${resumeProgress.level}`)}
              accessibilityRole="button"
              accessibilityLabel="Resume your learning journey"
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="font-nunito-bold text-2xl leading-8 text-ink-inverse">
                    Continue your learning journey
                  </Text>
                  <Text className="mt-3 font-nunito-semibold text-sm leading-5 text-ink-inverse">
                    {resumeProgress.level} · Unit {resumeProgress.unit} ·
                    Exercise {resumeProgress.exercise}
                  </Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-surface">
                  <Play
                    size={20}
                    color={theme.color.brand}
                    fill={theme.color.brand}
                    strokeWidth={1.8}
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </View>
              <View className="mt-5 border-t border-brand-soft/25 pt-4 flex-row flex-wrap items-center justify-between gap-3">
                <Text className="font-nunito-semibold text-sm text-ink-inverse">
                  {resumeProgress.mode}
                </Text>
                <View className="flex-row items-center gap-2">
                  <Clock3
                    size={16}
                    color={theme.color.inverse}
                    strokeWidth={1.8}
                  />
                  <Text className="font-nunito-medium text-sm text-ink-inverse">
                    {Math.floor(resumeProgress.totalTime / 60)} min practiced
                  </Text>
                </View>
              </View>
            </Pressable>
          )}
          <View className="mt-8">
            <Text className="text-xl font-nunito-bold text-ink-strong">
              Recommended Modes
            </Text>
            <View className="mt-4 rounded-2xl border border-line-subtle bg-surface overflow-hidden">
              <Pressable
                className="flex-row items-center gap-3 p-4 active:bg-brand-subtle"
                accessibilityRole="button"
                onPress={() => router.push("/chat")}
              >
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
                  <MessageCircle
                    size={24}
                    color={theme.color.brand}
                    strokeWidth={1.8}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-nunito-bold text-ink-strong">
                    Chat
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-ink-muted font-nunito">
                    Enhance your language skills by chatting with our AI
                    teacher.
                  </Text>
                </View>
                <ChevronRight
                  size={20}
                  color={theme.color.inkMuted}
                  strokeWidth={1.8}
                />
              </Pressable>
              <View className="mx-4 h-px bg-line-subtle" />
              <Pressable className="flex-row items-center gap-3 p-4 active:bg-surface-muted">
                <View className="h-12 w-12 items-center justify-center rounded-xl bg-surface-muted">
                  <Leaf
                    size={24}
                    color={theme.color.inkMuted}
                    strokeWidth={1.8}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-nunito-bold text-ink-strong">
                    Zen Mode
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-ink-muted font-nunito">
                    Slow down, focus, and practice with a calm learning session.
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default Home;
