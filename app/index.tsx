// app/index.tsx (Login)
import { RadialGradient } from "@/components/RadialGradient";
import RotatingLogo from "@/components/rotateLogo";
import fonts from "@/constants/fonts";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import colors from "../constants/colors";
import { useAuth } from "../layout/AuthProvider";

export default function LoginScreen() {
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect to home if already logged in
  React.useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      await login(email.trim(), password);
      router.push("/home");
    } catch (err: any) {
      console.error("Login failed:", err);
      const message = err?.message || "Login failed. Please check your credentials and try again.";
      Alert.alert("Login failed", message);
    }
  };

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={{ flex: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <RotatingLogo style={styles.logo} />
            <Text style={styles.appName}>TripTales</Text>
            <Text style={styles.tagline}>Capture Your Journey</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Welcome Back!</Text>

            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.link}>Don't have an account? Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100%",
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    width: "100%",
  },
  logo: {
    width: 300,
    height: 200,
    marginBottom: 10,
    alignSelf: "center",
  },
  appName: {
    fontSize: 48,
    color: "#2c3e50",
    fontFamily: fonts.boldItalic,
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#34495e",
    fontFamily: fonts.mediumItalic,
    letterSpacing: 1,
    textAlign: "center",
  },
  title: {
    fontSize: 28,
    color: "#2c3e50",
    marginBottom: 32,
    fontFamily: fonts.bold,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.7)",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  link: {
    color: "#2c3e50",
    fontSize: 14,
    textDecorationLine: "underline",
    fontFamily: fonts.regular,
  },
});
