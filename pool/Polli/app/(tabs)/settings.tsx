import {
  languageNames,
  supportedLanguages,
  type LanguageCode,
} from "@/constants/languages";
import { nodeApi } from "@/lib/axios";
import { useUserStore } from "@/store/store";
import { router } from "expo-router";
import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  CircleAlert,
  Crown,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  Settings as SettingIcon,
  UserRound,
  X,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Profile = {
  name: string;
  email: string;
  nationality: string;
  language: LanguageCode[];
  level: string;
};

type ProfileResponse = {
  success?: boolean;
  message?: string;
  user?: Profile;
};

type UpdateProfileResponse = {
  success?: boolean;
  message?: string;
  user?: { name?: string; language?: LanguageCode[] };
};

type ChangePasswordResponse = { success?: boolean; message?: string };

const Settings = () => {
  const token = useUserStore(
    (state) => state.token ?? state.user?.token ?? null,
  );
  const selectedLang = useUserStore((state) => state.selectedLang);
  const setSelectedLang = useUserStore((state) => state.setSelectedLang);
  const setLanguages = useUserStore((state) => state.setLanguages);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editError, setEditError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(null);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = React.useState(false);
  const [savingLanguage, setSavingLanguage] =
    React.useState<LanguageCode | null>(null);
  const [languageError, setLanguageError] = React.useState<string | null>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [settingsExpanded, setSettingsExpanded] = React.useState(false);
  const [dailyReminder, setDailyReminder] = React.useState(true);
  const [soundEffects, setSoundEffects] = React.useState(true);

  const fetchProfile = React.useCallback(async () => {
    if (!token) {
      setProfile(null);
      setError("Sign in to view your profile.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await nodeApi.get<ProfileResponse>(
        "/api/fetch-profile",
        {
          headers: {
            Accept: "application/json",
            Authorization: token,
          },
        },
      );
      const body = response.data;

      if (
        response.status < 200 ||
        response.status >= 300 ||
        !body?.success ||
        !body.user
      ) {
        setError(body?.message ?? "Unable to load your profile.");
        return;
      }

      const profileLanguage: LanguageCode[] = Array.isArray(body.user.language)
        ? body.user.language
        : ["de"];
      setProfile({ ...body.user, language: profileLanguage });
      setLanguages(profileLanguage);
      if (!profileLanguage.includes(selectedLang as LanguageCode)) {
        setSelectedLang(profileLanguage[0]);
      }
    } catch {
      setError(
        "We could not reach Polli. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedLang, setLanguages, setSelectedLang, token]);

  React.useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const openEditProfile = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditError(null);
    setIsEditOpen(true);
  };

  const openChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
    setPasswordMessage(null);
    setIsPasswordOpen(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();

    if (!token) {
      setEditError("Sign in to edit your profile.");
      return;
    }

    if (!trimmedName) {
      setEditError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    setEditError(null);

    try {
      const response = await nodeApi.put<UpdateProfileResponse>(
        "/api/profile",
        { name: trimmedName },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );
      const body = response.data;

      if (response.status < 200 || response.status >= 300 || !body?.success) {
        setEditError(body?.message ?? "Unable to update your profile.");
        return;
      }

      setProfile((currentProfile) =>
        currentProfile
          ? { ...currentProfile, name: body.user?.name ?? trimmedName }
          : currentProfile,
      );
      setIsEditOpen(false);
    } catch {
      setEditError(
        "We could not reach Polli. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!token) {
      setPasswordError("Sign in again before changing your password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Your new password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Your new passwords do not match.");
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);
    try {
      const response = await nodeApi.put<ChangePasswordResponse>(
        "/api/change-password",
        { currentPassword, newPassword },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );
      const body = response.data;
      if (response.status < 200 || response.status >= 300 || !body?.success) {
        setPasswordError(body?.message ?? "Unable to update your password.");
        return;
      }

      setIsPasswordOpen(false);
      setPasswordMessage("Password updated successfully.");
    } catch {
      setPasswordError("We could not reach Polli. Check your connection and try again.");
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleLanguage = async (language: LanguageCode) => {
    if (!profile || !token || savingLanguage) return;

    const hasLanguage = profile.language.includes(language);
    if (hasLanguage && profile.language.length === 1) {
      setLanguageError("Keep at least one language in your profile.");
      return;
    }

    const nextLanguages = hasLanguage
      ? profile.language.filter((item) => item !== language)
      : [...profile.language, language];

    setSavingLanguage(language);
    setLanguageError(null);

    try {
      const response = await nodeApi.put<UpdateProfileResponse>(
        "/api/profile",
        { language: nextLanguages },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: token,
          },
        },
      );
      const body = response.data;

      if (response.status < 200 || response.status >= 300 || !body?.success) {
        setLanguageError(body?.message ?? "Unable to update your languages.");
        return;
      }

      const savedLanguages = body.user?.language ?? nextLanguages;
      setProfile((currentProfile) =>
        currentProfile
          ? { ...currentProfile, language: savedLanguages }
          : currentProfile,
      );
      setLanguages(savedLanguages);
      if (selectedLang === language && !savedLanguages.includes(language)) {
        setSelectedLang(savedLanguages[0]);
      }
    } catch {
      setLanguageError(
        "We could not reach Polli. Check your connection and try again.",
      );
    } finally {
      setSavingLanguage(null);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await nodeApi.post("/api/logout", undefined, {
        headers: token ? { Authorization: token } : undefined,
      });
    } catch {
      // Clear local authentication even if the server cannot be reached.
    } finally {
      useUserStore.getState().setToken(null);
      useUserStore.getState().setUser(null);
      setLanguages(["de"]);
      setSelectedLang("de");
      setLoggingOut(false);
      router.replace("/(auth)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-canvas px-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View className="mb-2 mt-6">
          <Text className="text-xs font-nunito-bold tracking-widest text-primary">
            YOUR SPACE
          </Text>
          <Text className="mt-1 text-3xl font-nunito-bold text-ink-strong">
            Profile & settings
          </Text>
          <Text className="mt-2 text-sm font-nunito text-ink-muted">
            Your profile, languages, and learning preferences.
          </Text>
        </View>

        <View className="mt-5 rounded-3xl bg-slate-900 p-5">
          <View className="flex-row items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary">
              {profile?.name ? (
                <Text className="text-2xl font-nunito-bold text-white">
                  {profile.name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()}
                </Text>
              ) : (
                <UserRound size={30} color="#FFFFFF" strokeWidth={1.5} />
              )}
            </View>
            <View className="ml-4 flex-1">
              {loading ? (
                <ActivityIndicator color="#5E5CE6" />
              ) : profile ? (
                <>
                  <Text className="text-xl font-nunito-bold text-white">
                    {profile.name}
                  </Text>
                  <Text
                    className="mt-1 text-sm font-nunito text-slate-300"
                    numberOfLines={1}
                  >
                    {profile.email}
                  </Text>
                </>
              ) : (
                <Text className="font-nunito-semibold text-slate-300">
                  Profile unavailable
                </Text>
              )}
            </View>
            <Pressable
              className="ml-2 h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 active:bg-slate-700"
              onPress={openEditProfile}
              disabled={loading || !profile}
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
            >
              <Pencil size={18} color="#C7D2FE" strokeWidth={1.8} />
            </Pressable>
          </View>

          {error && !token ? (
            <Pressable
              className="mt-4 flex-row items-center gap-2 rounded-xl border border-brand bg-brand-soft p-3 active:opacity-70"
              onPress={() => router.push("/(auth)")}
              accessibilityRole="button"
              accessibilityLabel="Sign in to view your profile"
            >
              <CircleAlert size={20} color="#5E5CE6" strokeWidth={1.5} />
              <Text className="flex-1 font-nunito-semibold text-sm text-primary">
                Sign in to view your profile.
              </Text>
            </Pressable>
          ) : error ? (
            <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
              <CircleAlert size={20} color="#DC2626" strokeWidth={1.5} />
              <Text className="flex-1 font-nunito text-sm text-danger">
                {error}
              </Text>
            </View>
          ) : null}

          {profile && (
            <View className="mt-5 gap-3 border-t border-slate-700 pt-4">
              <ProfileRow label="Nationality" value={profile.nationality} />
              <ProfileRow
                label="Learning language"
                value={profile.language
                  .map((language) => languageNames[language] ?? language)
                  .join(", ")}
              />
              <ProfileRow label="Level" value={profile.level} />
              <Pressable
                className="mt-2 flex-row items-center justify-center gap-2 rounded-xl border border-slate-600 px-4 py-3 active:bg-slate-800"
                onPress={openChangePassword}
                accessibilityRole="button"
                accessibilityLabel="Change password"
              >
                <KeyRound size={18} color="#C7D2FE" strokeWidth={1.8} />
                <Text className="font-nunito-semibold text-white">Change password</Text>
              </Pressable>
            </View>
          )}
        </View>

        {passwordMessage && (
          <View className="mt-3 rounded-xl border border-success-line bg-success-soft p-3">
            <Text className="font-nunito-medium text-success">{passwordMessage}</Text>
          </View>
        )}

        {profile && (
          <View className="mt-5 rounded-3xl border border-line-subtle bg-surface p-5">
            <Text className="text-lg font-nunito-bold text-ink-strong">
              My languages
            </Text>
            <Text className="mt-1 font-nunito text-ink-muted">
              A world of conversations awaits.
            </Text>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {profile.language.map((language) => (
                <View
                  key={language}
                  className="flex-row items-center gap-2 rounded-2xl bg-surface-canvas px-3 py-3"
                >
                  <Text className="text-xl">
                    {
                      supportedLanguages.find((item) => item.code === language)
                        ?.flag
                    }
                  </Text>
                  <Text className="font-nunito-semibold text-ink-strong">
                    {languageNames[language] ?? language}
                  </Text>
                </View>
              ))}
            </View>
            {languageError && (
              <Text className="mt-3 font-nunito text-sm text-danger">
                {languageError}
              </Text>
            )}
            <Pressable
              className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-soft px-4 py-3 active:opacity-70"
              onPress={() => setIsLanguagePickerOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Add a language"
            >
              <Plus size={18} color="#5E5CE6" />
              <Text className="font-nunito-bold text-primary">
                Add languages
              </Text>
            </Pressable>
          </View>
        )}

        <Pressable
          className="mt-5 overflow-hidden rounded-3xl bg-primary p-5 active:opacity-80"
          onPress={() => router.push("/premium")}
          accessibilityRole="button"
          accessibilityLabel="View Polli Premium"
        >
          <View className="flex-row items-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Crown size={24} color="#FDE68A" strokeWidth={1.8} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-xs font-nunito-bold tracking-widest text-indigo-100">
                POLLI PREMIUM
              </Text>
              <Text className="mt-1 text-xl font-nunito-bold text-white">
                More ways to grow.
              </Text>
            </View>
          </View>
          <Text className="mt-4 text-sm leading-5 font-nunito text-indigo-100">
            Explore interactive videos, streak rewards, and deeper learning
            insights.
          </Text>
          <View className="mt-5 flex-row items-center justify-between border-t border-indigo-400 pt-4">
            <Text className="font-nunito-bold text-white">
              Discover Premium
            </Text>
            <View className="h-8 w-8 items-center justify-center rounded-full bg-white">
              <ArrowUpRight size={19} color="#5E5CE6" />
            </View>
          </View>
        </Pressable>

        <Text className="ml-1 mt-7 text-xs font-nunito-bold uppercase tracking-widest text-ink-muted">
          Preferences
        </Text>
        <View className="mt-3 overflow-hidden rounded-3xl border border-line-subtle bg-surface">
          <View className="flex-row items-center gap-4 border-b border-line-subtle p-4">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Bell size={21} color="#B45309" strokeWidth={1.8} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-nunito-bold text-ink-strong">
                Notifications
              </Text>
              <Text className="mt-1 text-xs font-nunito text-ink-muted">
                {notificationsEnabled ? "On" : "Off"}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#CBD5E1", true: "#A5B4FC" }}
              thumbColor={notificationsEnabled ? "#5E5CE6" : "#F8FAFC"}
              accessibilityLabel="Toggle notifications"
            />
          </View>
          <Pressable
            className="flex-row items-center gap-4 p-4 active:bg-surface-muted"
            onPress={() => setSettingsExpanded((expanded) => !expanded)}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityState={{ expanded: settingsExpanded }}
          >
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <SettingIcon size={21} color="#5E5CE6" strokeWidth={1.8} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-nunito-bold text-ink-strong">
                Learning preferences
              </Text>
              <Text className="mt-1 text-xs font-nunito text-ink-muted">
                Reminders & sound
              </Text>
            </View>
            <ChevronDown
              size={21}
              color="#64748B"
              style={{
                transform: [{ rotate: settingsExpanded ? "180deg" : "0deg" }],
              }}
            />
          </Pressable>
          {settingsExpanded && (
            <View className="border-t border-line-subtle bg-surface-canvas px-4 py-2">
              <ToggleSetting
                label="Daily practice reminder"
                value={dailyReminder}
                onValueChange={setDailyReminder}
              />
              <ToggleSetting
                label="Sound effects"
                value={soundEffects}
                onValueChange={setSoundEffects}
              />
              <Text className="pb-3 pt-1 font-nunito text-xs text-ink-muted">
                Personalize your learning experience.
              </Text>
            </View>
          )}
        </View>

        <Pressable
          className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl p-4 active:bg-danger-soft"
          onPress={() => void handleLogout()}
          disabled={loggingOut}
          accessibilityRole="button"
          accessibilityLabel="Log out"
        >
          <LogOut size={19} color="#DC2626" strokeWidth={1.8} />
          {loggingOut ? (
            <ActivityIndicator color="#DC2626" />
          ) : (
            <Text className="text-base font-nunito-bold text-danger">
              Log out
            </Text>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={isEditOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !saving && setIsEditOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-2xl bg-surface px-4 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-nunito-bold text-ink-strong">
                Edit profile
              </Text>
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
                onPress={() => setIsEditOpen(false)}
                disabled={saving}
                accessibilityLabel="Close edit profile"
                accessibilityRole="button"
              >
                <X size={24} color="#64748B" strokeWidth={1.5} />
              </Pressable>
            </View>

            {editError && (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
                <CircleAlert size={20} color="#DC2626" strokeWidth={1.5} />
                <Text className="flex-1 font-nunito text-sm text-danger">
                  {editError}
                </Text>
              </View>
            )}

            <View className="mt-5 gap-4">
              <EditField
                label="Name"
                value={editName}
                onChangeText={setEditName}
                editable={!saving}
              />
            </View>

            <Pressable
              className="mt-6 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
              onPress={() => void handleSaveProfile()}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-lg font-nunito-bold text-white">
                  Save changes
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isPasswordOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !changingPassword && setIsPasswordOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-2xl bg-surface px-4 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-nunito-bold text-ink-strong">Change password</Text>
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
                onPress={() => setIsPasswordOpen(false)}
                disabled={changingPassword}
                accessibilityLabel="Close change password"
                accessibilityRole="button"
              >
                <X size={24} color="#64748B" strokeWidth={1.5} />
              </Pressable>
            </View>

            {passwordError && (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl border border-danger-line bg-danger-soft p-3">
                <CircleAlert size={20} color="#DC2626" strokeWidth={1.5} />
                <Text className="flex-1 font-nunito text-sm text-danger">{passwordError}</Text>
              </View>
            )}

            <View className="mt-5 gap-4">
              <EditField
                label="Current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                editable={!changingPassword}
              />
              <EditField
                label="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                editable={!changingPassword}
              />
              <EditField
                label="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!changingPassword}
              />
            </View>

            <Pressable
              className="mt-6 min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 active:bg-brand-strong disabled:bg-surface-muted"
              onPress={() => void handleChangePassword()}
              disabled={changingPassword}
              accessibilityRole="button"
              accessibilityLabel="Update password"
            >
              {changingPassword ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-lg font-nunito-bold text-white">Update password</Text>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isLanguagePickerOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !savingLanguage && setIsLanguagePickerOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[85%] rounded-t-2xl bg-surface px-4 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-nunito-bold text-ink-strong">
                Add a language
              </Text>
              <Pressable
                className="h-11 w-11 items-center justify-center rounded-full active:bg-surface-muted"
                onPress={() => setIsLanguagePickerOpen(false)}
                disabled={Boolean(savingLanguage)}
                accessibilityLabel="Close language picker"
                accessibilityRole="button"
              >
                <X size={24} color="#64748B" strokeWidth={1.5} />
              </Pressable>
            </View>
            <Text className="mt-1 font-nunito text-ink-muted">
              Added languages show a Remove action.
            </Text>
            <ScrollView className="mt-3" showsVerticalScrollIndicator={false}>
              {supportedLanguages.map(({ code, name, flag }) => {
                const isAdded = profile?.language.includes(code);
                const isAvailable = code === "de" || code === "fr";
                const isSaving = savingLanguage === code;

                return (
                  <View
                    key={code}
                    className="flex-row items-center border-b border-line-subtle py-3"
                  >
                    <Text className="mr-3 text-2xl">{flag}</Text>
                    <Text className="flex-1 font-nunito-semibold text-ink-strong">
                      {name}
                    </Text>
                    <Pressable
                      className={`rounded-lg px-3 py-2 ${
                        !isAvailable
                          ? "bg-surface-muted"
                          : isAdded
                            ? "bg-danger-soft"
                            : "bg-brand-soft"
                      }`}
                      onPress={() => void toggleLanguage(code)}
                      disabled={!isAvailable || Boolean(savingLanguage)}
                      accessibilityRole="button"
                      accessibilityState={{
                        disabled: !isAvailable,
                        selected: Boolean(isAdded),
                      }}
                      accessibilityLabel={`${isAdded ? "Remove" : "Add"} ${name}`}
                    >
                      {isSaving ? (
                        <ActivityIndicator
                          color={isAdded ? "#DC2626" : "#5E5CE6"}
                        />
                      ) : (
                        <Text
                          className={`font-nunito-semibold ${
                            !isAvailable
                              ? "text-ink-disabled"
                              : isAdded
                                ? "text-danger"
                                : "text-primary"
                          }`}
                        >
                          {isAvailable
                            ? isAdded
                              ? "Remove"
                              : "Add"
                            : "Coming soon"}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const ProfileRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row items-center justify-between gap-4">
    <Text className="text-sm font-nunito text-slate-400">{label}</Text>
    <Text className="flex-1 text-right text-sm font-nunito-semibold text-slate-100">
      {value}
    </Text>
  </View>
);

const ToggleSetting = ({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) => (
  <View className="flex-row items-center justify-between border-b border-line-subtle py-3">
    <Text className="font-nunito-medium text-ink">{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: "#CBD5E1", true: "#A5B4FC" }}
      thumbColor={value ? "#5E5CE6" : "#F8FAFC"}
      accessibilityLabel={label}
    />
  </View>
);

const EditField = ({
  label,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) => (
  <View className="gap-2">
    <Text className="font-nunito-semibold text-ink">{label}</Text>
    <TextInput
      className="rounded-xl border border-line bg-surface px-4 py-3 font-nunito text-base text-ink-strong"
      placeholderTextColor="#94A3B8"
      accessibilityLabel={label}
      {...props}
    />
  </View>
);

export default Settings;
