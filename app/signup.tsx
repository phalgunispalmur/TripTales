// app/signup.tsx
import RotatingLogo from "@/components/rotateLogo";
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
import { RadialGradient } from "../components/RadialGradient";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useAuth } from "../layout/AuthProvider";

export default function SignupScreen() {
  const { register, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect to home if already logged in
  React.useEffect(() => {
    if (user) {
      router.replace("/home");
    }
  }, [user]);

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    // simple email format check
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    try {
      await register(email.trim(), password, name.trim());
      Alert.alert("Success", "Account created — you are now logged in.");
      router.push("/home");
    } catch (err: any) {
      console.error("Signup error:", err);
      // firebase error messages are useful but keep friendly
      const message = err?.message || "Failed to create account. Try again.";
      Alert.alert("Signup failed", message);
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
            <Text style={styles.title}>Create Account</Text>

            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
            />

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
              placeholder="Create a password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Confirm password"
              placeholderTextColor="#666"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/")}>
              <Text style={styles.link}>Already have an account? Login</Text>
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
    marginBottom: 5,
    width: "100%",
  },
  logo: {
    width: 350,
    height: 250,
    marginBottom: 0,
    marginRight:10,
  },
  appName: {
    fontSize: 42,
    color: "#0b0b0bff",
    fontFamily: fonts.boldItalic,
    marginBottom: 2,
  },
  tagline: {
    fontSize: 14,
    color: "#34495e",
    letterSpacing: 1,
    marginBottom:2,
    fontFamily: fonts.regular,
  },
  title: {
    fontSize: 24,
    color: "#2c3e50",
    marginBottom: 5,
    fontFamily: fonts.boldItalic,
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
    fontSize: 16,
    textDecorationLine: "underline",
    fontFamily: fonts.regular,
  },
});
