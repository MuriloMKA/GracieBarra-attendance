import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { COLORS, SIZES } from "../constants/theme";
import Button from "../components/Button";
import Input from "../components/Input";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result.success) {
        Alert.alert("Erro", "Email ou senha incorretos");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>GRACIE BARRA</Text>
          </View>
          <Text style={styles.subtitle}>Sistema de Presença</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu.email@exemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="Digite sua senha"
            secureTextEntry
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Demo Buttons */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Ou teste com:</Text>
            <Button
              title="Login como Aluno"
              onPress={() => {
                setEmail("aluno@gb.com");
                setPassword("123456");
              }}
              variant="outline"
              style={styles.demoButton}
            />
            <Button
              title="Login como Admin"
              onPress={() => {
                setEmail("admin@gb.com");
                setPassword("123456");
              }}
              variant="outline"
              style={styles.demoButton}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Gracie Barra. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SIZES.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: SIZES.xxl,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.md,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    fontSize: SIZES.h4,
    color: COLORS.text,
    fontWeight: "600",
  },
  form: {
    width: "100%",
  },
  loginButton: {
    marginTop: SIZES.md,
  },
  demoContainer: {
    marginTop: SIZES.xl,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  demoTitle: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.md,
  },
  demoButton: {
    marginTop: SIZES.sm,
  },
  footer: {
    marginTop: SIZES.xl,
    alignItems: "center",
  },
  footerText: {
    fontSize: SIZES.small,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});

export default LoginScreen;
