import React, { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/lib/useTheme";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useFonts, Nunito_600SemiBold, Nunito_700Bold, Nunito_400Regular } from "@expo-google-fonts/nunito";

const MIN_PASSWORD_LENGTH = 6;
const OTP_LENGTH = 6;

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  if (!hash || hash.charAt(0) === "#") hash = hash.slice(1);
  hash.split("&").forEach((pair) => {
    const [key, value] = pair.split("=");
    if (key && value) params[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return params;
}

export default function ResetPasswordScreen() {
  const { theme, palette } = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = typeof params.email === "string" ? params.email : Array.isArray(params.email) ? (params.email[0] ?? "") : "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hashHandled, setHashHandled] = useState(Platform.OS !== "web");
  const [codeEmail, setCodeEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [hasValidSession, setHasValidSession] = useState(false);
  const [fontsLoaded] = useFonts({ Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasValidSession(!!session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasValidSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" || !isSupabaseConfigured || hashHandled) return;
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    const hashParams = parseHashParams(hash);
    const access_token = hashParams.access_token;
    const refresh_token = hashParams.refresh_token;
    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token }).then(() => {
        if (typeof window !== "undefined" && window.history.replaceState) {
          window.history.replaceState(null, "", window.location.pathname);
        }
        setHashHandled(true);
      });
    } else {
      setHashHandled(true);
    }
  }, [hashHandled]);

  const handleVerifyCode = async () => {
    setCodeError("");
    const trimmedEmail = codeEmail.trim();
    const trimmedCode = code.trim().replace(/\s/g, "");
    if (!trimmedEmail) {
      setCodeError("Digite o e-mail da sua conta.");
      return;
    }
    if (trimmedCode.length !== OTP_LENGTH) {
      setCodeError(`Digite o código de ${OTP_LENGTH} dígitos do e-mail.`);
      return;
    }
    if (!isSupabaseConfigured) {
      setCodeError("Configuração indisponível.");
      return;
    }
    setCodeLoading(true);
    const { error: err } = await supabase.auth.verifyOtp({
      email: trimmedEmail,
      token: trimmedCode,
      type: "recovery",
    });
    setCodeLoading(false);
    if (err) {
      setCodeError(err.message);
    }
    // onAuthStateChange will set hasValidSession and show password form
  };

  const handleSubmit = async () => {
    setError("");
    if (!password.trim()) {
      setError("Digite a nova senha.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!isSupabaseConfigured) {
      setError("Configuração indisponível.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: password.trim() });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  if (!fontsLoaded) return null;

  const showCodeStep = !hasValidSession && (Platform.OS !== "web" || hashHandled);
  const waitingHash = Platform.OS === "web" && !hashHandled && !hasValidSession;

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
        {waitingHash ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular", textAlign: "center", marginTop: 24 }]}>
            A carregar…
          </Text>
        ) : showCodeStep ? (
          <>
            <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
              Código do e-mail
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
              Insira o e-mail da sua conta e o código de 6 dígitos que você recebeu no e-mail de recuperação.
            </Text>
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={theme.textSecondary}
              value={codeEmail}
              onChangeText={setCodeEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!codeLoading}
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
              placeholder="Código de 6 dígitos"
              placeholderTextColor={theme.textSecondary}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, OTP_LENGTH))}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              editable={!codeLoading}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
            {codeError ? (
              <Text style={[styles.error, { color: palette.coral }]}>{codeError}</Text>
            ) : null}
            <Pressable
              onPress={handleVerifyCode}
              disabled={codeLoading}
              style={[styles.button, { backgroundColor: palette.teal }]}
            >
              {codeLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: "Nunito_600SemiBold" }]}>
                  Verificar código
                </Text>
              )}
            </Pressable>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: theme.text, fontFamily: "Nunito_700Bold" }]}>
              Nova senha
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: "Nunito_400Regular" }]}>
              Digite e confirme sua nova senha (mínimo 6 caracteres).
            </Text>

            <TextInput
              placeholder="Nova senha"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor={theme.textSecondary}
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
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
                  Redefinir senha
                </Text>
              )}
            </Pressable>
          </>
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
  buttonText: { color: "#fff", fontSize: 16 },
});
