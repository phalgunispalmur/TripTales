import { Slot } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { RadialGradient } from "./components/RadialGradient";
import colors from "./constants/colors";
import { useFonts } from "./hooks/useFonts";
import { AuthProvider } from "./layout/AuthProvider";
import { TripsProvider } from "./layout/TripsProvider";

export default function App() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={{ flex: 1 }}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          <Image 
            source={require("./assets/images/logo.png")}
            style={{
              width: 200,
              height: 150,
              marginBottom: 30,
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            fontSize: 32, 
            color: "#2c3e50", 
            fontFamily: fonts.boldItalic,
            marginBottom: 10,
          }}>
            TripTales
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: "#34495e", 
            fontFamily: fonts.regular,
            marginBottom: 30,
            letterSpacing: 1,
          }}>
            Capture Your Journey
          </Text>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </RadialGradient>
    );
  }

  return (
    <AuthProvider>
      <TripsProvider>
        <Slot />
      </TripsProvider>
    </AuthProvider>
  );
}
