import {
  languageNames,
  supportedLanguages,
  type LanguageCode,
} from "@/constants/languages";
import { nodeApi } from "@/lib/axios";
import { useUserStore } from "@/store/store";
import { router } from "expo-router";
import { CircleAlert, Flame, RefreshCw, Trophy } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DailyTime = { day: (typeof WEEK_DAYS)[number]; seconds: number };

type ProgressData = {
  language: LanguageCode;
  totalTime: number;
  dailyTime: DailyTime[];
  streakDate: string[];
  streak: number;
  completedLesson: string[];
  accuracy: number;
  lastExercise: string | null;
  weekStart: string;
};

type ProgressResponse = {
  message?: string;
  progress?: ProgressData;
};

const Progress = () => {
  const selectedLang = useUserStore(
    (state) => state.selectedLang,
  ) as LanguageCode;
  const token = useUserStore(
    (state) => state.token ?? state.user?.token ?? null,
  );
  const [progress, setProgress] = React.useState<ProgressData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchProgress = React.useCallback(async () => {
    if (!token) {
      setProgress(null);
      setError("Sign in to view your progress.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await nodeApi.get<ProgressResponse>("/api/progress", {
        params: { language: selectedLang },
        headers: { Accept: "application/json", Authorization: token },
      });
      const body = response.data;

      if (response.status < 200 || response.status >= 300 || !body?.progress) {
        setError(body?.message ?? "Unable to load your progress.");
        return;
      }

      setProgress(body.progress);
    } catch {
      setError(
        "We could not reach Polli. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedLang, token]);

  React.useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  const activeLanguage =
    supportedLanguages.find((language) => language.code === selectedLang) ??
    supportedLanguages[0];
  const dailySeconds = WEEK_DAYS.map(
    (day) => progress?.dailyTime.find((item) => item.day === day)?.seconds ?? 0,
  );
  const streakDates = new Set(
    (progress?.streakDate ?? []).map((date) =>
      new Date(date).toISOString().slice(0, 10),
    ),
  );
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas px-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-5 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-nunito-bold text-ink-strong">
              Your progress
            </Text>
            <Text className="mt-1 font-nunito text-ink-muted">
              {activeLanguage.flag} {languageNames[activeLanguage.code]} this
              week
            </Text>
          </View>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
            onPress={() => void fetchProgress()}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Refresh progress"
          >
            <RefreshCw size={20} color="#64748B" strokeWidth={1.5} />
          </Pressable>
        </View>

        {loading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator color="#5E5CE6" size="large" />
            <Text className="mt-3 font-nunito text-ink-muted">
              Loading progress…
            </Text>
          </View>
        ) : error && !token ? (
          <Pressable
            className="mt-6 flex-row items-center gap-2 rounded-xl border border-brand bg-brand-soft p-3 active:opacity-70"
            onPress={() => router.push("/(auth)")}
            accessibilityRole="button"
            accessibilityLabel="Sign in to view your progress"
          >
            <CircleAlert size={20} color="#5E5CE6" strokeWidth={1.5} />
            <Text className="flex-1 font-nunito-semibold text-primary">
              Sign in to view your progress.
            </Text>
          </Pressable>
        ) : error ? (
          <View className="mt-6 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
            <CircleAlert size={20} color="#DC2626" strokeWidth={1.5} />
            <Text className="flex-1 font-nunito text-danger">{error}</Text>
          </View>
        ) : progress ? (
          <>
            <View className="mt-5 rounded-3xl bg-primary p-5">
              <Text className="text-xs font-nunito-bold uppercase tracking-widest text-indigo-100">
                Weekly snapshot
              </Text>
              <Text className="mt-2 text-2xl font-nunito-bold text-white">
                Small steps, real progress.
              </Text>
              <Text className="mt-1 font-nunito text-indigo-100">
                Keep practicing to build your confidence.
              </Text>
              <View className="mt-5 flex-row gap-3">
                <View className="flex-1 rounded-2xl bg-white/15 p-3">
                  <Text className="font-nunito-bold text-xl text-white">
                    {formatDuration(progress.totalTime)}
                  </Text>
                  <Text className="mt-1 text-xs font-nunito text-indigo-100">
                    practice time
                  </Text>
                </View>
                <View className="flex-1 rounded-2xl bg-white/15 p-3">
                  <Text className="font-nunito-bold text-xl text-white">
                    {progress.streak} days
                  </Text>
                  <Text className="mt-1 text-xs font-nunito text-indigo-100">
                    current streak
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-indigo-100 bg-indigo-50 p-5">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-lg font-nunito-bold text-ink-strong">
                    Overall Practice Time
                  </Text>
                  <Text className="mt-1 font-nunito text-ink-muted">
                    Your activity over the last 7 days.
                  </Text>
                </View>
                <View className="rounded-full bg-white px-3 py-2">
                  <Text className="font-nunito-bold text-primary">
                    {formatDuration(progress.totalTime)}
                  </Text>
                </View>
              </View>
              <View className="mt-5 rounded-2xl bg-white/60 px-2 pt-3">
                <LineChart
                  data={{
                    labels: DAY_LABELS,
                    datasets: [
                      {
                        data: dailySeconds.map((seconds) =>
                          Math.round(seconds / 60),
                        ),
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 56}
                  height={210}
                  fromZero
                  bezier
                  withDots
                  withInnerLines
                  withOuterLines={false}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "#FFFFFF",
                    backgroundGradientTo: "#FFFFFF",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(94, 92, 230, ${opacity})`,
                    labelColor: (opacity = 1) =>
                      `rgba(71, 85, 105, ${opacity})`,
                    propsForDots: {
                      r: "4",
                      strokeWidth: "2",
                      stroke: "#FFFFFF",
                    },
                    propsForBackgroundLines: {
                      stroke: "#D9DDFB",
                      strokeDasharray: "5 6",
                    },
                  }}
                  style={{ marginLeft: -8, borderRadius: 16 }}
                />
                <View className="mt-1 flex-row justify-between border-t border-indigo-100 px-1 pb-2 pt-2">
                  <Text className="font-nunito-medium text-xs text-ink-muted">
                    Minutes practiced
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-orange-200 bg-orange-50 p-5">
              <View className="flex-row items-center gap-2">
                <Flame size={21} color="#F97316" fill="#F97316" />
                <Text className="text-lg font-nunito-bold text-ink-strong">
                  Current Streak
                </Text>
              </View>
              <Text className="mt-1 font-nunito text-ink-muted">
                A streak day requires at least 3 minutes of practice.
              </Text>
              <View className="mt-4 flex-row items-center justify-between border-t border-line-subtle pt-4">
                <Text className="font-nunito-semibold text-ink">This week</Text>
                <View className="rounded-full bg-orange-500 px-4 py-2">
                  <Text className="font-nunito-medium text-white">
                    {progress.streak} days
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <View className="flex-row items-center gap-2">
                <Trophy size={20} color="#059669" />
                <Text className="text-lg font-nunito-bold text-ink-strong">
                  Weekly Summary
                </Text>
              </View>
              <SummaryRow
                label="Completed lessons"
                value={`${progress.completedLesson.length}`}
              />
              <SummaryRow
                label="Accuracy"
                value={`${Math.round(progress.accuracy * 100)}%`}
              />
              <SummaryRow
                label="Last exercise"
                value={progress.lastExercise ?? "None yet"}
              />
            </View>

            <View className="mb-6 mt-4 rounded-3xl border border-sky-200 bg-sky-50 p-5">
              <Text className="text-lg font-nunito-bold text-ink-strong">
                Streak Calendar
              </Text>
              <View className="mt-4 flex-row justify-between border-t border-line-subtle pt-4">
                {DAY_LABELS.map((day, index) => {
                  const date = new Date(progress.weekStart);
                  // `weekStart` is Monday, while this calendar starts on Sunday.
                  const mondayOffset = index === 0 ? 6 : index - 1;
                  date.setUTCDate(date.getUTCDate() + mondayOffset);
                  const active =
                    streakDates.has(date.toISOString().slice(0, 10)) ||
                    dailySeconds[index] >= 180;
                  return (
                    <View key={day} className="items-center">
                      <Text className="font-nunito-medium text-ink-muted">
                        {day}
                      </Text>
                      <View
                        className={`mt-2 h-10 w-10 items-center justify-center rounded-full ${
                          active ? "bg-success" : "bg-surface-muted"
                        }`}
                      >
                        {active ? (
                          <Flame
                            size={20}
                            color="#FFFFFF"
                            fill="#FFFFFF"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <Text className="font-nunito text-ink">
                            {index + 1}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View className="mt-4 flex-row items-center justify-between border-b border-line-subtle pb-3">
    <Text className="font-nunito text-ink-muted">{label}</Text>
    <Text className="font-nunito-semibold text-ink-strong">{value}</Text>
  </View>
);

export default Progress;
