import React from "react";
import { Pressable, Text, View } from "react-native";

interface LessonCardProps {
  lessonId?: string;
  title: string;
  description: string;
  onPress?: () => void;
}

const LessonCard = ({
  lessonId,
  title,
  description,
  onPress,
}: LessonCardProps) => {
  return (
    <View className="bg-slate-50 p-4 rounded-xl border border-slate-200">
      <View>
        <Text className="text-slate-900 text-2xl font-nunito-bold">
          {title}
        </Text>
      </View>
      <View className="mt-4">
        <Text className="text-slate-500 text-base font-nunito-regular">
          {description}
        </Text>
        <Pressable
          className="mt-2 bg-primary p-2 rounded-xl items-center active:opacity-70"
          onPress={onPress}
        >
          <Text className="text-white font-nunito-bold text-lg">
            Start Lesson
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default LessonCard;
