import VideoSplash from "@/components/VideoSplash";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useCallback, useState } from "react";
import { View } from "react-native";
import "./global.css";

// Hold the native launch screen until the video's first frame is available.
void SplashScreen.preventAutoHideAsync().catch(() => {});

const hideNativeSplash = () => {
  void SplashScreen.hideAsync().catch(() => {});
};

export default function RootLayout() {
  const [splashFinished, setSplashFinished] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    "Nunito-Regular": require("../assets/fonts/Nunito-Regular.ttf"),
    "Nunito-Bold": require("../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-Italic": require("../assets/fonts/Nunito-Italic.ttf"),
    "Nunito-Light": require("../assets/fonts/Nunito-Light.ttf"),
    "Nunito-Medium": require("../assets/fonts/Nunito-Medium.ttf"),
    "Nunito-SemiBold": require("../assets/fonts/Nunito-SemiBold.ttf"),
    "Nunito-ExtraBold": require("../assets/fonts/Nunito-ExtraBold.ttf"),
  });

  const finishSplash = useCallback(() => {
    setSplashFinished(true);
    hideNativeSplash();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1 }}
        pointerEvents={splashFinished ? "auto" : "none"}
        accessibilityElementsHidden={!splashFinished}
        importantForAccessibility={
          splashFinished ? "auto" : "no-hide-descendants"
        }
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="preference" options={{ headerShown: false }} />
        </Stack>
      </View>
      {!splashFinished && (
        <VideoSplash onReady={hideNativeSplash} onFinish={finishSplash} />
      )}
    </View>
  );
}
