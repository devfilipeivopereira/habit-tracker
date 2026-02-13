import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { useAuth } from "@/lib/AuthContext";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from "@expo-google-fonts/nunito";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { theme, palette } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const handleLogin = async () => {
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Preencha e-mail e senha.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    const { error: err } = await signIn(trimmedEmail, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.replace("/(tabs)");
    }
  };

  if (!fontsLoaded) return null;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
          HabitFlow
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
          Entre para acessar seus hábitos
        </Text>

        <TextInput
          placeholder="E-mail"
          placeholderTextColor={theme.textSecondary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />
        <TextInput
          placeholder="Senha"
          placeholderTextColor={theme.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
        />

        {error ? (
          <Text style={[styles.error, { color: palette.coral }]}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={[styles.button, { backgroundColor: palette.teal }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
              Entrar
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push("/(auth)/forgot-password")}
          style={styles.linkWrap}
        >
          <Text style={[styles.link, { color: palette.teal, fontFamily: "Nunito_600SemiBold" }]}>
            Esqueci a senha
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/(auth)/signup")}
          style={styles.linkWrap}
        >
          <Text style={[styles.link, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
            Não tem conta?{" "}
            <Text style={[styles.linkBold, { color: palette.teal, fontFamily: "Nunito_600SemiBold" }]}>
              Cadastre-se
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    minHeight: 400,
  },
  title: { fontSize: 32, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: "center", marginBottom: 32 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, marginBottom: 8, textAlign: "center" },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  linkWrap: { marginTop: 24, alignItems: "center" },
  link: { fontSize: 14 },
  linkBold: { fontSize: 14 },
});
