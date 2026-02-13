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

export default function ForgotPasswordScreen() {
  const { theme, palette } = useTheme();
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  const handleSubmit = async () => {
    setError("");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Digite seu e-mail.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError("Digite um e-mail válido.");
      return;
    }
    setLoading(true);
    const { error: err } = await resetPasswordForEmail(trimmedEmail);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSent(true);
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
        <Pressable onPress={() => router.back()} style={styles.backWrap}>
          <Text style={[styles.back, { color: palette.teal, fontFamily: "Nunito_600SemiBold" }]}>
            ← Voltar
          </Text>
        </Pressable>

        <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
          Recuperar senha
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
          {sent
            ? "Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha. Verifique a caixa de entrada e o spam."
            : "Digite o e-mail da sua conta e enviaremos um link para redefinir a senha."}
        </Text>

        {!sent && (
          <>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
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
              onPress={handleSubmit}
              disabled={loading}
              style={[styles.button, { backgroundColor: palette.teal }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
                  Enviar link
                </Text>
              )}
            </Pressable>
          </>
        )}

        {sent && (
          <Pressable
            onPress={() => router.replace("/(auth)")}
            style={[styles.button, styles.buttonSecondary, { borderColor: palette.teal }]}
          >
            <Text style={[styles.buttonTextSecondary, { color: palette.teal, fontFamily: "Nunito_600SemiBold" }]}>
              Voltar ao login
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  backWrap: { marginBottom: 24 },
  back: { fontSize: 16 },
  title: { fontSize: 28, marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 24 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  error: { fontSize: 14, marginBottom: 8 },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  buttonTextSecondary: { fontSize: 16 },
});
