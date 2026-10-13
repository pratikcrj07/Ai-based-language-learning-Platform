import { router } from "expo-router";
import { Check, Crown, MoveLeft, PlayCircle, ShieldCheck, Trophy } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const benefits = [
  { icon: PlayCircle, title: "Interactive video learning", text: "Learn with practical, guided video lessons." },
  { icon: Trophy, title: "Rewards for your streak", text: "Stay consistent and earn rewards as you progress." },
  { icon: ShieldCheck, title: "Track every milestone", text: "See your level, accuracy, and learning history." },
];

const Premium = () => (
  <SafeAreaView className="flex-1 bg-surface-canvas">
    <ScrollView contentContainerClassName="px-5 pb-10" showsVerticalScrollIndicator={false}>
      <Pressable className="mt-4 h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted" onPress={() => router.back()}>
        <MoveLeft size={26} color="#64748B" strokeWidth={1.8} />
      </Pressable>
      <View className="mt-6 items-center rounded-3xl bg-primary px-6 py-8">
        <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Crown size={34} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
        </View>
        <Text className="mt-4 text-center text-3xl font-nunito-bold text-white">Polli Premium</Text>
        <Text className="mt-2 text-center font-nunito text-indigo-100">A focused path to confident communication.</Text>
        <View className="mt-6 flex-row items-end">
          <Text className="text-4xl font-nunito-bold text-white">$6.99</Text>
          <Text className="mb-1 ml-1 font-nunito text-indigo-100">/ month</Text>
        </View>
      </View>
      <Text className="mt-8 text-xl font-nunito-bold text-ink-strong">Everything you need to keep growing</Text>
      <View className="mt-3 gap-3">
        {benefits.map(({ icon: Icon, title, text }) => (
          <View key={title} className="flex-row items-center rounded-2xl border border-line-subtle bg-surface p-4">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
              <Icon size={22} color="#5E5CE6" strokeWidth={1.7} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-nunito-bold text-base text-ink-strong">{title}</Text>
              <Text className="mt-1 font-nunito text-sm text-ink-muted">{text}</Text>
            </View>
            <Check size={20} color="#16A34A" strokeWidth={2} />
          </View>
        ))}
      </View>
      <Pressable
        className="mt-8 items-center rounded-2xl bg-primary py-4 active:opacity-80"
        onPress={() => Alert.alert("Premium checkout", "Payment setup will be connected here soon.")}
      >
        <Text className="font-nunito-bold text-lg text-white">Continue to payment</Text>
      </Pressable>
      <Text className="mt-3 text-center font-nunito text-xs text-ink-muted">Cancel anytime · Secure checkout</Text>
    </ScrollView>
  </SafeAreaView>
);

export default Premium;
