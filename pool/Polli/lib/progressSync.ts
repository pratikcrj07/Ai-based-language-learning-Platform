import type { LanguageCode } from "@/constants/languages";
import { nodeApi } from "@/lib/axios";
import { useUserStore } from "@/store/store";

const WEEK_DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

type DailyTime = { day: (typeof WEEK_DAYS)[number]; seconds: number };
type ProgressRecord = {
  language: LanguageCode;
  totalTime: number;
  dailyTime: DailyTime[];
  streakDate: string[];
  streak: number;
  completedLesson: string[];
  accuracy: number;
  lastExercise: string | null;
};

const getToday = () => {
  const date = new Date();
  return {
    day: WEEK_DAYS[date.getUTCDay()],
    date: date.toISOString().slice(0, 10),
  };
};

export const syncCompletedLesson = async ({
  language,
  level,
  unit,
  exerciseId,
  durationSeconds,
  accuracy,
}: {
  language: string;
  level: string;
  unit: string;
  exerciseId?: number;
  durationSeconds: number;
  accuracy: number;
}) => {
  const token = useUserStore.getState().token;
  if (!token) return;

  const safeLanguage = language as LanguageCode;
  const baseHeaders = { Accept: "application/json", Authorization: token };
  const progressResponse = await nodeApi.get<{ progress?: ProgressRecord }>(
    "/api/progress",
    { params: { language: safeLanguage }, headers: baseHeaders },
  );
  const progressBody = progressResponse.data;
  if (
    progressResponse.status < 200 ||
    progressResponse.status >= 300 ||
    !progressBody?.progress
  )
    return;

  const current = progressBody.progress;
  const today = getToday();
  const seconds = Math.max(180, Math.floor(durationSeconds));
  const dailyTime = WEEK_DAYS.map((day) => ({
    day,
    seconds: current.dailyTime.find((entry) => entry.day === day)?.seconds ?? 0,
  }));
  const todayEntry = dailyTime.find((entry) => entry.day === today.day);
  if (todayEntry) todayEntry.seconds += seconds;

  const streakDate = [...current.streakDate];
  if (
    todayEntry &&
    todayEntry.seconds >= 180 &&
    !streakDate.some((date) => date.slice(0, 10) === today.date)
  ) {
    streakDate.push(today.date);
  }

  const completedId = exerciseId
    ? `${level}_${unit}_${exerciseId}`
    : `${level}_${unit}_1`;
  const completedLesson = [
    ...new Set([...current.completedLesson, completedId]),
  ];
  const nextAccuracy = current.accuracy || accuracy;
  const lastExercise = exerciseId ? completedId : current.lastExercise;

  const updateResponse = await nodeApi.put(
    "/api/progress",
    {
      language: safeLanguage,
      totalTime: current.totalTime + seconds,
      dailyTime,
      streakDate,
      streak: Math.min(7, streakDate.length),
      completedLesson,
      accuracy: nextAccuracy,
      lastExercise,
    },
    { headers: { ...baseHeaders, "Content-Type": "application/json" } },
  );

  if (updateResponse.status < 200 || updateResponse.status >= 300) {
    throw new Error("Unable to save lesson progress");
  }
};
