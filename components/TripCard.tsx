import { Trip } from "@/types/trip";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  trip: Trip;
  onPress?: () => void;
};

export default function TripCard({ trip, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: trip.image || undefined }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {trip.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.meta}>📅 {new Date(trip.date).toLocaleDateString()}</Text>
          <Text style={styles.meta}>📍 {trip.location}</Text>
        </View>

        <Text style={styles.note} numberOfLines={2}>
          {trip.note}
        </Text>
        
        <Text style={styles.tapHint}>Tap for more details →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
    fontFamily: "cursive",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  meta: {
    fontSize: 14,
    color: "#666",
  },
  note: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 10,
  },
  tapHint: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
});
