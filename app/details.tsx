import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RadialGradient } from "../components/RadialGradient";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useTrips } from "../hooks/useTrips";
import { Trip } from "../types/trip";

export default function DetailsScreen() {
  const params = useLocalSearchParams();
  const { trips, deleteTrip } = useTrips();

  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;
  const trip = trips.find((t: Trip) => t.id === tripId);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "#fff", padding: 20 }}>Trip Not Found</Text>
        <Text style={{ color: "#fff", padding: 20 }}>ID: {tripId}</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      "Delete Trip",
      "Are you sure you want to delete this trip card?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("Deleting trip:", trip.id);
              await deleteTrip(trip.id);
              console.log("Trip deleted successfully");
              router.replace("/home");
              Alert.alert("Deleted", "Trip card deleted.");
            } catch (error) {
              console.error("Error deleting trip:", error);
              Alert.alert("Error", "Failed to delete trip. Please try again.");
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
      style={styles.container}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
        <Image source={{ uri: trip.image || undefined }} style={styles.image} />

        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.date}>📅 {new Date(trip.date).toLocaleDateString()}</Text>
        <Text style={styles.location}>📍 {trip.location}</Text>
        <Text style={styles.note}>{trip.note}</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.btnEdit}
            onPress={() => {
              router.push({ pathname: "/edit", params: { id: trip.id } });
            }}
          >
            <Text style={styles.btnText}>EDIT TRIP</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnDelete} onPress={handleDelete} activeOpacity={0.7}>
            <Text style={styles.btnText}>DELETE TRIP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </RadialGradient>
  );
}

// keep existing styles (same as your original)
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40, paddingTop: 10 },
  image: { width: "100%", height: 280, borderRadius: 20, marginBottom: 20 },
  title: { fontSize: 28, color: "#2c3e50", marginBottom: 10, fontFamily: fonts.boldItalic },
  date: { fontSize: 16, color: "#34495e", marginBottom: 5, fontFamily: fonts.regular },
  location: { fontSize: 16, color: "#34495e", marginBottom: 15, fontFamily: fonts.regular },
  note: { fontSize: 18, color: "#2c3e50", marginBottom: 30, lineHeight: 26, fontFamily: fonts.regular },
  buttonContainer: { 
    flexDirection: "row", 
    gap: 10, 
    marginBottom: 20,
    marginTop: 20,
  },
  btnEdit: { 
    flex: 1, 
    backgroundColor: colors.secondary, 
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  btnDelete: { 
    flex: 1, 
    backgroundColor: colors.primary, 
    padding: 20, 
    borderRadius: 12, 
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  btnText: { 
    color: "#fff", 
    fontSize: 18, 
    fontFamily: fonts.bold,
    textTransform: "uppercase",
  },
});
