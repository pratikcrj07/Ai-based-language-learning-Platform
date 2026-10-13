import type { LanguageCode } from "@/constants/languages";
import { nodeApi } from "@/lib/axios";
import { isValidEmail, isValidName } from "@/lib/validation";
import { useUserStore } from "@/store/store";
import { Link, router } from "expo-router";
import { ArrowLeft, Check, ChevronDown, CircleX, X } from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type RegisterResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    language?: LanguageCode[];
  };
};

const nationalityOptions = [
  "Afghan",
  "American",
  "Australian",
  "Bangladeshi",
  "Brazilian",
  "British",
  "Canadian",
  "Chinese",
  "French",
  "German",
  "Indian",
  "Indonesian",
  "Italian",
  "Japanese",
  "Kenyan",
  "Mexican",
  "Nepali",
  "Nigerian",
  "Pakistani",
  "Philippine",
  "South African",
  "South Korean",
  "Spanish",
  "Sri Lankan",
  "Vietnamese",
] as const;

const Signup = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const setLanguages = useUserStore((state) => state.setLanguages);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [nationality, setNationality] = React.useState("");
  const [isNationalityPickerOpen, setIsNationalityPickerOpen] =
    React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedNationality = nationality.trim();

    if (!trimmedName || !trimmedEmail || !password || !trimmedNationality) {
      setError("Complete all fields to create your account.");
      return;
    }

    if (trimmedName.length > 20 || !isValidName(trimmedName)) {
      setError("Enter a valid name using letters, spaces, hyphens, or apostrophes (up to 20 characters).");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address, such as name@example.com. Check for typos in the domain.");
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
      const response = await nodeApi.post<RegisterResponse>("/api/register", {
        name: trimmedName,
        email: trimmedEmail,
        password,
        nationality: trimmedNationality,
      });
      const body = response.data;

      if (
        response.status < 200 ||
        response.status >= 300 ||
        !body?.success ||
        !body.token ||
        !body.user
      ) {
        setError(body?.message ?? "Unable to create your account. Try again.");
        return;
      }

      setToken(body.token);
      setUser(body.user);
      if (body.user.language?.length) setLanguages(body.user.language);
      router.push("/preference");
    } catch (caughtError: unknown) {
      const responseMessage =
        typeof caughtError === "object" &&
        caughtError !== null &&
        "response" in caughtError &&
        typeof caughtError.response === "object" &&
        caughtError.response !== null &&
        "data" in caughtError.response &&
        typeof caughtError.response.data === "object" &&
        caughtError.response.data !== null &&
        "message" in caughtError.response.data &&
        typeof caughtError.response.data.message === "string"
          ? caughtError.response.data.message
          : null;

      if (responseMessage?.toLowerCase().includes("email")) {
        setError("Enter a valid email address, such as name@example.com. Check for typos in the domain.");
      } else if (responseMessage?.toLowerCase().includes("name")) {
        setError("Enter a valid name using letters, spaces, hyphens, or apostrophes (up to 20 characters).");
      } else if (responseMessage) {
        setError(responseMessage);
      } else {
        setError("We could not reach Polli. Check your connection and try again.");
      }
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
        <View className="mt-4 flex-row items-center gap-4">
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full border border-line active:bg-surface-muted"
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color="#334155" strokeWidth={1.5} />
          </Pressable>
          <Text className="text-2xl font-nunito-bold text-ink-strong">
            Create account
          </Text>
        </View>

        <Text className="mt-6 text-base font-nunito text-ink-muted">
          Start learning with short, practical language exercises.
        </Text>

        {error && (
          <View className="mt-6 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
            <CircleX size={22} color="#DC2626" strokeWidth={1.5} />
            <Text className="flex-1 font-nunito-medium text-danger">
              {error}
            </Text>
          </View>
        )}

        <View className="mt-6 gap-4">
          <FormField
            label="Name"
            value={name}
            onChangeText={(value) => {
              setName(value);
              setError(null);
            }}
            placeholder="John Doe"
            autoCapitalize="words"
            editable={!loading}
          />
          <FormField
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setError(null);
            }}
            placeholder="john.doe@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />
          <FormField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setError(null);
            }}
            placeholder="At least 6 characters"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
          <FormField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setError(null);
            }}
            placeholder="Enter your password again"
            secureTextEntry
            autoCapitalize="none"
            editable={!loading}
          />
          <NationalitySelect
            value={nationality}
            onPress={() => setIsNationalityPickerOpen(true)}
            disabled={loading}
          />
        </View>

        <Text className="mt-5 text-center text-sm font-nunito text-ink-muted">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy.
        </Text>

        <Pressable
          className="mt-5 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
          onPress={handleSignup}
          disabled={loading}
          accessibilityLabel="Create account"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-lg font-nunito-bold text-white">
              Create account
            </Text>
          )}
        </Pressable>

        <View className="mt-5 flex-row justify-center">
          <Text className="font-nunito text-ink-muted">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)">
            <Text className="font-nunito-bold text-primary underline">
              Sign in
            </Text>
          </Link>
        </View>
      </ScrollView>

      <NationalityPicker
        visible={isNationalityPickerOpen}
        selectedNationality={nationality}
        onClose={() => setIsNationalityPickerOpen(false)}
        onSelect={(selectedNationality) => {
          setNationality(selectedNationality);
          setError(null);
          setIsNationalityPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
};

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

const NationalitySelect = ({
  value,
  onPress,
  disabled,
}: {
  value: string;
  onPress: () => void;
  disabled: boolean;
}) => (
  <View className="gap-2">
    <Text className="font-nunito-semibold text-ink">Nationality</Text>
    <Pressable
      className="min-h-12 flex-row items-center rounded-xl border border-line bg-surface px-4 py-3 active:bg-surface-muted disabled:bg-surface-muted"
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel="Choose nationality"
      accessibilityRole="button"
      accessibilityValue={{ text: value || "No nationality selected" }}
    >
      <Text
        className={`flex-1 font-nunito text-base ${
          value ? "text-ink-strong" : "text-ink-disabled"
        }`}
      >
        {value || "Choose your nationality"}
      </Text>
      <ChevronDown size={22} color="#64748B" strokeWidth={1.5} />
    </Pressable>
  </View>
);

const NationalityPicker = ({
  visible,
  selectedNationality,
  onClose,
  onSelect,
}: {
  visible: boolean;
  selectedNationality: string;
  onClose: () => void;
  onSelect: (nationality: string) => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-end bg-black/40">
      <View className="max-h-[80%] rounded-t-2xl bg-surface px-4 pb-8 pt-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-nunito-bold text-ink-strong">
            Choose nationality
          </Text>
          <Pressable
            className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
            onPress={onClose}
            accessibilityLabel="Close nationality picker"
            accessibilityRole="button"
          >
            <X size={24} color="#64748B" strokeWidth={1.5} />
          </Pressable>
        </View>
        <ScrollView
          className="mt-3"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-4"
        >
          {nationalityOptions.map((option) => {
            const isSelected = option === selectedNationality;

            return (
              <Pressable
                key={option}
                className={`min-h-12 flex-row items-center rounded-xl px-4 py-3 active:opacity-70 ${
                  isSelected ? "bg-brand-soft" : "bg-surface"
                }`}
                onPress={() => onSelect(option)}
                accessibilityLabel={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  className={`flex-1 font-nunito-medium text-base ${
                    isSelected ? "text-primary" : "text-ink"
                  }`}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Check size={20} color="#5E5CE6" strokeWidth={2.5} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default Signup;
