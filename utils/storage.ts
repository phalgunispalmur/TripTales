import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trip } from "@/types/trip";

const STORAGE_KEY = "TRIP_DATA";

export const saveTrips = async (trips: Trip[]) => {
  try {
    console.log("Storage: Saving trips", trips.length);
    const json = JSON.stringify(trips);
    await AsyncStorage.setItem(STORAGE_KEY, json);
    console.log("Storage: Trips saved successfully");
  } catch (error) {
    console.error("Storage: Error saving trips:", error);
    throw error;
  }
};

export const loadTrips = async (): Promise<Trip[]> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.log("Error loading trips:", error);
    return [];
  }
};
