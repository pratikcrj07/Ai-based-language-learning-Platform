import { nodeApi } from "@/lib/axios";
import { isValidEmail } from "@/lib/validation";
import { router } from "expo-router";
import { ArrowLeft, CircleX } from "lucide-react-native";
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

type ResetResponse = { success?: boolean; message?: string };

export default function ForgotPasswordScreen() {
  const [email, setEmail] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [codeSent, setCodeSent] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  const requestCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError("Enter a valid email address, such as name@example.com.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await nodeApi.post<ResetResponse>("/api/forgot-password", {
        email: normalizedEmail,
      });
      if (response.status < 200 || response.status >= 300 || !response.data?.success) {
        setError(response.data?.message ?? "Unable to request a reset code. Try again.");
        return;
      }
      setEmail(normalizedEmail);
      setCodeSent(true);
    } catch {
      setError("We could not reach Polli. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the six-digit code from your email.");
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
      const response = await nodeApi.post<ResetResponse>("/api/reset-password", {
        email: email.trim().toLowerCase(),
        code,
        password,
      });
      if (response.status < 200 || response.status >= 300 || !response.data?.success) {
        setError(response.data?.message ?? "Unable to reset your password. Request a new code.");
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
        <Pressable
          className="mt-4 h-11 w-11 items-center justify-center rounded-full border border-line active:bg-surface-muted"
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ArrowLeft size={24} color="#334155" strokeWidth={1.5} />
        </Pressable>
        <Text className="mt-8 text-2xl font-nunito-bold text-ink-strong">
          {complete ? "Password reset" : "Forgot password?"}
        </Text>
        <Text className="mt-2 font-nunito text-ink-muted">
          {complete
            ? "Your password has been updated."
            : codeSent
              ? "If an account exists for this email, a six-digit code has been sent. Enter it below; it expires in 10 minutes."
              : "Enter your account email and we’ll send a one-time reset code."}
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
            <Text className="text-lg font-nunito-bold text-white">Return to sign in</Text>
          </Pressable>
        ) : !codeSent ? (
          <View className="mt-8 gap-4">
            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            <ActionButton label="Send reset code" loading={loading} onPress={requestCode} />
          </View>
        ) : (
          <View className="mt-8 gap-4">
            <Text className="font-nunito-medium text-ink-strong">{email}</Text>
            <FormField
              label="Six-digit code"
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              keyboardType="number-pad"
              autoCapitalize="none"
              editable={!loading}
              maxLength={6}
            />
            <FormField
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            <FormField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Enter your new password again"
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
            <ActionButton label="Update password" loading={loading} onPress={resetPassword} />
            <Pressable
              className="min-h-11 items-center justify-center"
              onPress={requestCode}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text className="font-nunito-semibold text-primary">Resend code</Text>
            </Pressable>
            <Pressable
              className="min-h-11 items-center justify-center"
              onPress={() => {
                setCodeSent(false);
                setCode("");
                setError(null);
              }}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text className="font-nunito-semibold text-ink-muted">Use a different email</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type FormFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
};

const FormField = ({ label, ...inputProps }: FormFieldProps) => (
  <View className="gap-2">
    <Text className="font-nunito-semibold text-ink">{label}</Text>
    <TextInput
      className="rounded-xl border border-line bg-surface px-4 py-3 font-nunito text-base text-ink-strong"
      placeholderTextColor="#94A3B8"
      accessibilityLabel={label}
      {...inputProps}
    />
  </View>
);

const ActionButton = ({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) => (
  <Pressable
    className="min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
    onPress={onPress}
    disabled={loading}
    accessibilityRole="button"
  >
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text className="text-lg font-nunito-bold text-white">{label}</Text>
    )}
  </Pressable>
);
