import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
import { useTrips } from "../hooks/useTrips";

export default function EditScreen() {
  const params = useLocalSearchParams();
  const { trips, updateTrip } = useTrips();

  const tripId = Array.isArray(params.id) ? params.id[0] : params.id;
  const trip = trips.find((t) => t.id === tripId);

  const [title, setTitle] = useState(trip?.title || "");
  const [location, setLocation] = useState(trip?.location || "");
  const [note, setNote] = useState(trip?.note || "");
  const [image, setImage] = useState(trip?.image || "");
  const [folder, setFolder] = useState(trip?.folder || "My Trips");
  const [loading, setLoading] = useState(false);

  if (!trip) {
    return (
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={{ color: "#fff", fontSize: 18, marginBottom: 10 }}>Trip not found</Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>ID: {tripId}</Text>
          <Text style={{ color: "#fff", fontSize: 14, marginTop: 10 }}>Available IDs:</Text>
          {trips.map(t => (
            <Text key={t.id} style={{ color: "#fff", fontSize: 12 }}>{t.id}</Text>
          ))}
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => router.back()}>
            <Text style={styles.btnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const tempUri = result.assets[0].uri;
        console.log("Image updated:", tempUri);
        // Don't save locally - we'll upload directly to Cloudinary
        setImage(tempUri);
        Alert.alert("Success", "Photo updated!");
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Please allow access to your camera");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const tempUri = result.assets[0].uri;
        console.log("Photo captured:", tempUri);
        // Don't save locally - we'll upload directly to Cloudinary
        setImage(tempUri);
        Alert.alert("Success", "Photo captured!");
      }
    } catch (error) {
      console.error("Camera error:", error);
      Alert.alert("Error", "Failed to open camera");
    }
  };

  const saveChanges = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your trip");
      return;
    }
    if (!image) {
      Alert.alert("Missing Photo", "Please select a photo");
      return;
    }

    const updatedTrip = {
      ...trip,
      title: title.trim(),
      location: location.trim() || "Unknown",
      note: note.trim(),
      image,
      folder: folder.trim() || "My Trips",
      // keep the existing imagePublicId so provider can decide whether to upload/delete
      imagePublicId: (trip as any)?.imagePublicId ?? null,
    };

    setLoading(true);
    try {
      await updateTrip(updatedTrip);
      setLoading(false);
      router.back();
      Alert.alert("Success", "Trip updated!");
    } catch (error) {
      console.error("Error updating trip:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to update trip. Please try again.");
    }
  };

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
        <TextInput
          placeholder="Title of your trip"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Location (e.g., Paris, France)"
          placeholderTextColor="#666"
          value={location}
          onChangeText={setLocation}
          style={styles.input}
        />

        <TextInput
          placeholder="Folder (e.g., Europe 2023, Beach Vacations, Family Trips)"
          placeholderTextColor="#666"
          value={folder}
          onChangeText={setFolder}
          style={styles.input}
        />

        <View style={styles.imageSection}>
          <Image source={{ uri: image || undefined }} style={styles.preview} />

          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={pickFromGallery}>
              <Text style={styles.photoBtnText}>🖼️ Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoBtn} onPress={pickFromCamera}>
              <Text style={styles.photoBtnText}>📸 Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TextInput
          placeholder="Write a short memory..."
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
          style={styles.input}
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={saveChanges} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  // keep your existing styles
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 100, paddingTop: 20 },
  imageSection: { marginBottom: 20 },
  preview: { width: "100%", height: 250, borderRadius: 16, marginBottom: 15 },
  photoButtons: {
    flexDirection: "row",
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  photoBtnText: { color: "#333", fontSize: 16, fontFamily: fonts.semiBold },
  input: {
    backgroundColor: "rgba(255,255,255,0.7)",
    color: "#333",
    padding: 15,
    borderRadius: 12,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  btn: { backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 15 },
  cancelBtn: { backgroundColor: "#888" },
  btnText: { color: "#fff", fontSize: 18, fontFamily: fonts.semiBold },
});
