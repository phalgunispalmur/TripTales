// app/_layout.tsx
import { Stack } from "expo-router";
import React from "react";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { AuthProvider } from "../layout/AuthProvider";
import { TripsProvider } from "../layout/TripsProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <TripsProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.bgGradientStart,
            },
            headerTintColor: "#2c3e50",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: fonts.boldItalic,
              color: "#2c3e50",
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="signup" 
            options={{ 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="home" 
            options={{ 
              headerShown: false,
              gestureEnabled: false,
            }} 
          />
          <Stack.Screen 
            name="create" 
            options={{ 
              title: "New Trip Card",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="edit" 
            options={{ 
              title: "Edit Trip",
              presentation: "modal",
            }} 
          />
          <Stack.Screen 
            name="details" 
            options={{ 
              title: "Trip Details",
            }} 
          />
          <Stack.Screen 
            name="profile" 
            options={{ 
              title: "Profile",
            }} 
          />
          <Stack.Screen 
            name="swipe" 
            options={{ 
              title: "Swipe View",
              presentation: "fullScreenModal",
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="trips" 
            options={{ 
              title: "My Trips",
              headerShown: false,
            }} 
          />
        </Stack>
      </TripsProvider>
    </AuthProvider>
  );
}
