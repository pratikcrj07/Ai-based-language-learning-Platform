import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { levels } from "../../data/levels";

const Learn = () => {
  const levelAccents = [
    { card: "bg-indigo-50", border: "border-indigo-200", tile: "bg-indigo-500", text: "text-indigo-700" },
    { card: "bg-sky-50", border: "border-sky-200", tile: "bg-sky-500", text: "text-sky-700" },
    { card: "bg-emerald-50", border: "border-emerald-200", tile: "bg-emerald-500", text: "text-emerald-700" },
    { card: "bg-amber-50", border: "border-amber-200", tile: "bg-amber-500", text: "text-amber-700" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mx-5 mt-5 overflow-hidden rounded-3xl bg-primary px-6 py-7">
          <Text className="text-xs font-nunito-bold tracking-widest text-indigo-100">YOUR LEARNING PATH</Text>
          <Text className="mt-2 text-4xl font-nunito-bold text-white">Learn</Text>
          <Text className="mt-2 font-nunito text-base leading-6 text-indigo-100">Build confidence one focused lesson at a time.</Text>
          <View className="mt-6 flex-row gap-3">
            <View className="rounded-xl bg-white/15 px-3 py-2">
              <Text className="font-nunito-bold text-white">7</Text>
              <Text className="text-xs font-nunito text-indigo-100">levels</Text>
            </View>
            <View className="rounded-xl bg-white/15 px-3 py-2">
              <Text className="font-nunito-bold text-white">∞</Text>
              <Text className="text-xs font-nunito text-indigo-100">ways to grow</Text>
            </View>
          </View>
        </View>
        <View className="px-5 pb-8 pt-8">
          <View className="mb-1 flex-row items-end justify-between">
            <View>
              <Text className="text-2xl font-nunito-bold text-ink-strong">Levels</Text>
              <Text className="mt-1 font-nunito text-ink-muted">Choose a level to practice</Text>
            </View>
            <Text className="font-nunito-medium text-slate-400">{levels.length} levels</Text>
          </View>
          {levels.map((level, index) => (
            <Pressable
              key={index}
              className={`mt-4 flex-row items-center rounded-2xl border p-4 active:opacity-70 ${levelAccents[index % levelAccents.length].card} ${levelAccents[index % levelAccents.length].border}`}
              onPress={() => router.push(`/exercises/${level.level}`)}
            >
              <View
                className={`h-20 w-20 items-center justify-center rounded-2xl ${levelAccents[index % levelAccents.length].tile}`}
              >
                <Text className="text-xl font-nunito-bold text-white">
                  {level.level}
                </Text>
              </View>
              <View className="ml-4 flex-1">
                <Text
                  className={`text-lg font-nunito-bold ${levelAccents[index % levelAccents.length].text}`}
                >
                  {level.title}
                </Text>
                <Text className="mt-1 font-nunito text-sm leading-5 text-ink-muted">{level.description}</Text>
              </View>
              <ChevronRight size={21} color="#94A3B8" strokeWidth={1.8} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Learn;
