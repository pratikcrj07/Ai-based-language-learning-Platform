import icons from "@/constants/icons";
import { useUserStore } from "@/store/store";
import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LanguageOption = {
  code: "fr" | "de";
  name: string;
  description: string;
  flag: number;
};

const languageOptions: LanguageOption[] = [
  {
    code: "fr",
    name: "French",
    description: "Learn everyday French for real conversations.",
    flag: icons.flag_fr,
  },
  {
    code: "de",
    name: "German",
    description: "Learn everyday German for real conversations.",
    flag: icons.flag_de,
  },
];

const Preference = () => {
  const { selectedLang, setSelectedLang, setLanguages } = useUserStore();
  const [selectedLanguage, setSelectedLanguage] = React.useState<"fr" | "de">(
    selectedLang === "fr" ? "fr" : "de",
  );

  const handleGetStarted = () => {
    setSelectedLang(selectedLanguage);
    setLanguages([selectedLanguage]);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <View className="flex-row items-center px-4 pt-4">
        <Pressable
          className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={28} color="#64748B" strokeWidth={1.5} />
        </Pressable>
      </View>

      <View className="flex-1 px-4 pt-8">
        <Text className="text-2xl font-nunito-bold text-ink-strong">
          Choose a language
        </Text>
        <Text className="mt-2 text-base font-nunito text-ink-muted">
          Select the language you want to start learning. You can change it
          later.
        </Text>

        <View className="mt-8 gap-4">
          {languageOptions.map((language) => {
            const isSelected = selectedLanguage === language.code;

            return (
              <Pressable
                key={language.code}
                className={`flex-row items-center rounded-2xl border p-4 active:opacity-70 ${
                  isSelected
                    ? "border-brand bg-brand-soft"
                    : "border-line-subtle bg-surface"
                }`}
                onPress={() => setSelectedLanguage(language.code)}
                accessibilityLabel={`Learn ${language.name}`}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Image
                  source={language.flag}
                  className="h-14 w-14 rounded-full"
                  accessibilityIgnoresInvertColors
                />
                <View className="ml-4 flex-1">
                  <Text className="text-lg font-nunito-bold text-ink-strong">
                    {language.name}
                  </Text>
                  <Text className="mt-1 text-sm font-nunito text-ink-muted">
                    {language.description}
                  </Text>
                </View>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border ${
                    isSelected
                      ? "border-brand bg-primary"
                      : "border-line-strong bg-surface"
                  }`}
                >
                  {isSelected && (
                    <Check size={16} color="#FFFFFF" strokeWidth={3} />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="border-t border-line-subtle bg-surface px-4 py-4">
        <Pressable
          className="items-center rounded-xl bg-primary p-4 active:bg-brand-strong"
          onPress={handleGetStarted}
          accessibilityLabel={`Get started with ${
            selectedLanguage === "fr" ? "French" : "German"
          }`}
          accessibilityRole="button"
        >
          <Text className="text-lg font-nunito-bold text-white">
            Get started
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Preference;
