import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
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

export default function CreateScreen() {
  const { addTrip } = useTrips();

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [image, setImage] = useState("");
  const [folder, setFolder] = useState("My Trips");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted") {
        console.log("Camera permission not granted");
      }
      if (mediaStatus !== "granted") {
        console.log("Media library permission not granted");
      }
    })();
  }, []);

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
        console.log("Image selected:", tempUri);
        // Don't save locally - we'll upload directly to Cloudinary
        setImage(tempUri);
        Alert.alert("Success", "Photo added!");
      }
    } catch (error) {
      console.error("Gallery error:", error);
      Alert.alert("Error", "Failed to open gallery. Please try again.");
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
      Alert.alert("Error", "Failed to open camera. Please try again.");
    }
  };

  const saveTrip = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a title for your trip");
      return;
    }
    if (!image) {
      Alert.alert("Missing Photo", "Please select a photo for your trip");
      return;
    }

    const newTrip = {
      title: title.trim(),
      note: note.trim(),
      date: new Date().toISOString(),
      location: location.trim() || "Unknown",
      image,
      folder: folder.trim() || "My Trips",
      // imagePublicId will be set by TripsProvider after uploading to Cloudinary
    };

    setLoading(true);
    try {
      const created = await addTrip(newTrip);
      console.log("Trip added successfully", created);
      setLoading(false);
      router.push("/home");
      Alert.alert("Success", "Trip card created!");
    } catch (error) {
      console.error("Error adding trip:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to save trip. Please try again.");
    }
  };

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={styles.container}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentContainer}>
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
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image || undefined }} style={styles.preview} />
              <TouchableOpacity style={styles.changePhotoBtn} onPress={() => setImage("")}>
                <Text style={styles.changePhotoText}>✕ Remove Photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>📷</Text>
              <Text style={styles.placeholderSubtext}>Add a photo to your trip</Text>
            </View>
          )}

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

        <TouchableOpacity style={[styles.btn, loading && { opacity: 0.7 }]} onPress={saveTrip} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Trip</Text>}
        </TouchableOpacity>
      </ScrollView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  // keep same styles you already have
  container: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40, paddingTop: 20 },
  imageSection: { marginBottom: 20 },
  imageContainer: { marginBottom: 15, position: "relative" },
  preview: { width: "100%", height: 250, borderRadius: 16 },
  changePhotoBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: { color: "#fff", fontSize: 14, fontFamily: fonts.semiBold },
  placeholder: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  placeholderText: { fontSize: 60, marginBottom: 10 },
  placeholderSubtext: { color: "#333", fontSize: 16 },
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
  btn: { backgroundColor: colors.primary, padding: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  btnText: { color: "#fff", fontSize: 18, fontFamily: fonts.semiBold },
});
