import { nodeApi } from "@/lib/axios";
import { router, useLocalSearchParams } from "expo-router";
import { CircleX } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ResetResponse = { success?: boolean; message?: string };

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = Array.isArray(params.token) ? params.token[0] : params.token;
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [complete, setComplete] = React.useState(false);

  const updatePassword = async () => {
    if (!token) {
      setError("This reset link is missing its token. Request a new link.");
      return;
    }
    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await nodeApi.post<ResetResponse>("/api/reset-password", { token, password });
      if (response.status < 200 || response.status >= 300 || !response.data?.success) {
        setError(response.data?.message ?? "Unable to reset your password. Request a new link.");
        return;
      }
      setComplete(true);
    } catch {
      setError("We could not reach Polli. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas">
      <ScrollView contentContainerClassName="px-4 pb-8" keyboardShouldPersistTaps="handled">
        <Text className="mt-8 text-2xl font-nunito-bold text-ink-strong">Reset password</Text>
        <Text className="mt-2 font-nunito text-ink-muted">
          {complete ? "Your password has been updated." : "Choose a new password for your Polli account."}
        </Text>

        {error && (
          <View className="mt-6 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
            <CircleX size={22} color="#DC2626" strokeWidth={1.5} />
            <Text className="flex-1 font-nunito-medium text-danger">{error}</Text>
          </View>
        )}
        {complete ? (
          <Pressable
            className="mt-8 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong"
            onPress={() => router.replace("/(auth)")}
            accessibilityRole="button"
          >
            <Text className="text-lg font-nunito-bold text-white">Sign in</Text>
          </Pressable>
        ) : (
          <View className="mt-8 gap-4">
            <PasswordField label="New password" value={password} onChangeText={setPassword} editable={!loading} />
            <PasswordField label="Confirm new password" value={confirmPassword} onChangeText={setConfirmPassword} editable={!loading} />
            <Pressable
              className="min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
              onPress={updatePassword}
              disabled={loading}
              accessibilityRole="button"
            >
              {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text className="text-lg font-nunito-bold text-white">Update password</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const PasswordField = ({
  label,
  value,
  onChangeText,
  editable,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  editable: boolean;
}) => (
  <View className="gap-2">
    <Text className="font-nunito-semibold text-ink">{label}</Text>
    <TextInput
      className="rounded-xl border border-line bg-surface px-4 py-3 font-nunito text-base text-ink-strong"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry
      autoCapitalize="none"
      editable={editable}
      accessibilityLabel={label}
    />
  </View>
);