// app/profile.tsx
import { router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadialGradient } from "../components/RadialGradient";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useTrips } from "../hooks/useTrips";
import { useAuth } from "../layout/AuthProvider";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { trips, deleteTrip, refresh } = useTrips();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  const handleClearAllTrips = () => {
    if (!trips || trips.length === 0) {
      Alert.alert("No trips", "You don't have any trips to delete.");
      return;
    }

    Alert.alert(
      "Clear All Trips",
      `This will permanently delete all ${trips.length} trip cards for this account. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              // Delete in parallel, but tolerate individual failures
              const deletePromises = trips.map(t => deleteTrip(t.id as string).then(() => ({ id: t.id, ok: true })).catch((err) => ({ id: t.id, ok: false, err })));
              const results = await Promise.all(deletePromises);

              const failed = results.filter(r => !r.ok);
              if (failed.length > 0) {
                console.warn("Some deletions failed:", failed);
                Alert.alert("Partial failure", `Deleted ${results.length - failed.length} trips. ${failed.length} failed to delete. Try again or check console for errors.`);
              } else {
                Alert.alert("Success", "All trips have been deleted.");
              }

              // Refresh provider (reload from backend)
              try { await refresh(); } catch (e) { /* ignore */ }

              // Navigate back to home
              router.replace("/home");
            } catch (error) {
              console.error("Error clearing trips:", error);
              Alert.alert("Error", "Failed to clear trips. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    console.log("Logout button pressed");
    
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => console.log("Logout cancelled")
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Logging out...");
              // Logout first
              await logout();
              console.log("Logout successful, navigating to login...");
              // Then navigate
              router.replace("/");
            } catch (err) {
              console.error("Logout failed:", err);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "T"}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || user?.email || "Guest"}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{trips.length}</Text>
            <Text style={styles.statLabel}>Trip Cards</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push("/trips")}>
            <Text style={styles.buttonText}>View My Trips</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={handleClearAllTrips}>
            <Text style={styles.buttonText}>Delete All Trips</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.logoutButton]} 
            onPress={() => {
              console.log("Logout button clicked!");
              handleLogout();
            }}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarInitial: {
    fontSize: 48,
    color: colors.primary,
    fontFamily: fonts.boldItalic,
  },
  name: {
    fontSize: 28,
    color: "#2c3e50",
    marginBottom: 30,
    fontFamily: fonts.boldItalic,
    textAlign: "center",
  },
  statsContainer: {
    width: "100%",
    marginBottom: 40,
    alignItems: "center",
  },
  statBox: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 48,
    color: "#2c3e50",
    fontFamily: fonts.bold,
  },
  statLabel: {
    fontSize: 16,
    color: "#2c3e50",
    marginTop: 5,
    fontFamily: fonts.regular,
  },
  button: {
    width: "90%",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  clearButton: {
    backgroundColor: "#e74c3c",
  },
  logoutButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
    textAlign: "center",
  },
});
