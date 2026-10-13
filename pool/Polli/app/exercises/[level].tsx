import { theme } from "@/constants/theme";
import exercises from "@/data/exerciseList.json";
import { nodeApi } from "@/lib/axios";
import { useUserStore } from "@/store/store";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  MessageCircle,
  TextAlignStart,
} from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ExerciseList = () => {
  const { level } = useLocalSearchParams();
  const levelCode = String(level);
  const { selectedLang, token } = useUserStore();
  const levelExercises = React.useMemo(
    () =>
      exercises.exercises.filter((exercise) => exercise.level === levelCode),
    [levelCode],
  );
  const units = React.useMemo(
    () => levelExercises[0]?.units ?? [],
    [levelExercises],
  );
  const unitIds = units.map((unit) => unit.id).join(",");
  const [completedExerciseIds, setCompletedExerciseIds] = React.useState<
    string[]
  >([]);

  React.useEffect(() => {
    if (!token || !selectedLang) {
      setCompletedExerciseIds([]);
      return;
    }

    let cancelled = false;
    const fetchProgress = async () => {
      try {
        const response = await nodeApi.get<{
          progress?: {
            completedLesson?: string[];
            lastExercise?: string | null;
          };
        }>("/api/progress", {
          params: { language: selectedLang },
          headers: { Accept: "application/json", Authorization: token },
        });
        const body = response.data;
        if (cancelled || response.status < 200 || response.status >= 300)
          return;

        const completedLesson = body?.progress?.completedLesson ?? [];
        setCompletedExerciseIds(completedLesson);
      } catch {
        if (!cancelled) {
          setCompletedExerciseIds([]);
        }
      }
    };

    void fetchProgress();
    return () => {
      cancelled = true;
    };
  }, [levelCode, selectedLang, token, unitIds, units]);

  const completedUnits = units.filter((unit) =>
    unit.exercises.every((_, index) =>
      completedExerciseIds.includes(`${levelCode}_${unit.id}_${index + 1}`),
    ),
  );
  const totalExercises = units.reduce(
    (total, unit) => total + unit.exercises.length,
    0,
  );
  const completedExerciseCount = units.reduce(
    (total, unit) =>
      total +
      unit.exercises.filter((_, index) =>
        completedExerciseIds.includes(`${levelCode}_${unit.id}_${index + 1}`),
      ).length,
    0,
  );
  const progress = totalExercises
    ? (completedExerciseCount / totalExercises) * 100
    : 0;
  const getExerciseRoute = (exercise: string) => {
    if (exercise === "Sentence Mode") {
      return "/exercises/sentenceExercise";
    }

    if (exercise === "Dialogue Mode") {
      return "/exercises/dialogueExercise";
    }

    return "/exercises/wordExercise";
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="w-full max-w-3xl self-center px-4">
          <View className="flex-row items-center gap-3 mt-4 mb-6">
            <Pressable
              className="h-11 w-11 rounded-xl border border-line-subtle bg-surface items-center justify-center active:bg-surface-muted"
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                router.back();
              }}
            >
              <ArrowLeft size={22} color={theme.color.ink} strokeWidth={1.8} />
            </Pressable>
            <Text className="flex-1 text-2xl leading-8 font-nunito-bold text-ink-strong">
              {levelExercises[0]?.title || "Exercises"}
            </Text>
          </View>
          <View className="rounded-2xl border border-line-subtle bg-surface p-4 mb-8">
            <Text className="text-ink-muted font-nunito text-base">
              Start your journey here
            </Text>
            {/* Progress Indicator */}
            <View className="mt-4">
              <View
                className="bg-brand-soft rounded-full overflow-hidden"
                accessibilityRole="progressbar"
                accessibilityValue={{
                  min: 0,
                  max: totalExercises,
                  now: completedExerciseCount,
                }}
                accessibilityLabel={`${completedExerciseCount} of ${totalExercises} exercises completed`}
              >
                <View
                  className="h-2 bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>
          </View>
          {levelExercises[0]?.units?.map((unit) => (
            <View className="mb-8" key={unit.id}>
              <View className="flex-row flex-wrap items-center gap-2 mb-2">
                <Text className="text-sm font-nunito-bold text-primary">
                  Unit {unit.id}
                </Text>
                {completedUnits.some(
                  (completedUnit) => completedUnit.id === unit.id,
                ) && (
                  <View className="bg-success-soft rounded-full px-3 py-1 ml-auto flex-row items-center gap-1">
                    <Check
                      size={14}
                      color={theme.color.success}
                      strokeWidth={1.8}
                    />
                    <Text className="text-success text-xs font-nunito-semibold">
                      Completed
                    </Text>
                  </View>
                )}
              </View>
              <View className="mb-1">
                <Text className="text-ink-strong text-xl leading-7 font-nunito-bold">
                  {unit.title}
                </Text>
              </View>
              {unit?.exercises.map((exercise, index) => {
                const exerciseKey = `${levelCode}_${unit.id}_${index + 1}`;
                const isCompleted = completedExerciseIds.includes(exerciseKey);
                const ExerciseIcon =
                  exercise === "Sentence Mode"
                    ? TextAlignStart
                    : exercise === "Dialogue Mode"
                      ? MessageCircle
                      : BookOpen;
                return (
                  <Pressable
                    key={index}
                    className="flex-row items-center gap-3 mt-3 border border-line-subtle bg-surface p-4 rounded-2xl active:bg-brand-subtle"
                    accessibilityRole="button"
                    onPress={() =>
                      router.push(
                        `${getExerciseRoute(exercise)}?level=${level}&unit=${unit.id}`,
                      )
                    }
                  >
                    <View
                      className={`h-11 w-11 items-center justify-center rounded-xl ${isCompleted ? "bg-success-soft" : "bg-brand-soft"}`}
                    >
                      <ExerciseIcon
                        size={22}
                        color={
                          isCompleted ? theme.color.success : theme.color.brand
                        }
                        strokeWidth={1.8}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="font-nunito-bold text-base text-ink-strong">
                        Exercise {index + 1}
                      </Text>
                      <Text className="mt-1 text-sm text-ink-muted font-nunito">
                        {exercise}
                      </Text>
                    </View>
                    {isCompleted ? (
                      <View className="max-w-[40%] bg-success-soft rounded-full px-2 py-1">
                        <Text className="text-success text-xs font-nunito-semibold">
                          Completed
                        </Text>
                      </View>
                    ) : (
                      <ChevronRight
                        size={20}
                        color={theme.color.inkMuted}
                        strokeWidth={1.8}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ExerciseList;
