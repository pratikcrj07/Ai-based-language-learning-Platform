import type { LanguageCode } from "@/constants/languages";
import { nodeApi } from "@/lib/axios";
import { isValidEmail } from "@/lib/validation";
import { useUserStore } from "@/store/store";
import { Link, router } from "expo-router";
import { CircleX, Eye, EyeOff } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    language?: LanguageCode[];
    level?: string;
  };
};

const AuthScreen = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const setLanguages = useUserStore((state) => state.setLanguages);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError("Enter your email and password to sign in.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address, such as name@example.com.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await nodeApi.post<LoginResponse>("/api/login", {
        email: trimmedEmail,
        password,
      });
      const body = response.data;

      if (
        response.status < 200 ||
        response.status >= 300 ||
        !body?.success ||
        !body.token ||
        !body.user
      ) {
        setError(body?.message ?? "Unable to sign in. Try again.");
        return;
      }

      setToken(body.token);
      setUser(body.user);
      if (body.user.language?.length) setLanguages(body.user.language);
      router.replace("/(tabs)");
    } catch {
      setError(
        "We could not reach Polli. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mt-8 text-center text-2xl font-nunito-bold text-ink-strong">
          Welcome to Polli
        </Text>
        <Text className="mt-2 text-center font-nunito text-ink-muted">
          Continue your language learning journey.
        </Text>

        {error && (
          <View className="mt-6 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
            <CircleX size={22} color="#DC2626" strokeWidth={1.5} />
            <Text className="flex-1 font-nunito-medium text-danger">
              {error}
            </Text>
          </View>
        )}

        <View className="mt-8 gap-4">
          <View className="gap-2">
            <Text className="font-nunito-semibold text-ink">Email</Text>
            <TextInput
              className="rounded-xl border border-line bg-surface px-4 py-3 font-nunito text-base text-ink-strong"
              placeholder="john.doe@example.com"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              editable={!loading}
              accessibilityLabel="Email"
            />
          </View>

          <View className="gap-2">
            <Text className="font-nunito-semibold text-ink">Password</Text>
            <View className="relative">
              <TextInput
                className="rounded-xl border border-line bg-surface px-4 py-3 pr-14 font-nunito text-base text-ink-strong"
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
                accessibilityLabel="Password"
              />
              <Pressable
                className="absolute right-1 top-1 h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
                onPress={() => setShowPassword((visible) => !visible)}
                accessibilityLabel={
                  showPassword ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
              >
                {showPassword ? (
                  <EyeOff size={22} color="#64748B" strokeWidth={1.5} />
                ) : (
                  <Eye size={22} color="#64748B" strokeWidth={1.5} />
                )}
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          className="mt-6 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Sign in"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-nunito-bold text-white">Sign in</Text>
          )}
        </Pressable>

        <View className="mt-5 flex-row justify-center">
          <Text className="font-nunito text-ink-muted">
            Don&apos; t have an account?{" "}
          </Text>
          <Link href="/(auth)/signup">
            <Text className="font-nunito-bold text-primary underline">
              Sign up
            </Text>
          </Link>
        </View>

        <Pressable
          className="mt-4 items-center p-2"
          onPress={() => router.push("/(auth)/forgot-password")}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
        >
          <Text className="font-nunito-medium text-primary">
            Forgot password?
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AuthScreen;
