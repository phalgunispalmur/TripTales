// layout/TripsProvider.tsx
import { db } from "@/firebase/firebaseConfig";
import { useAuth } from "@/layout/AuthProvider";
import type { Trip } from "@/types/trip";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type TripsContextType = {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id">) => Promise<Trip>;
  updateTrip: (trip: Trip) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const TripsContext = createContext<TripsContextType | null>(null);

function userTripsCollectionRef(uid: string) {
  // subcollection path: users/{uid}/trips
  return collection(db, "users", uid, "trips");
}

/**
 * Upload a local file URI (or Blob/File) to Cloudinary using the unsigned preset.
 * Returns { url: secure_url, publicId: public_id }
 */
async function uploadImageToCloudinary(fileOrUri: string | Blob | File): Promise<{ url: string; publicId: string }> {
  // Cloudinary details (from environment variables or fallback)
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "dlzqcjksx";
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "triptales";

  console.log("uploadImageToCloudinary called with:", typeof fileOrUri, fileOrUri);
  console.log("Platform detection - User agent:", typeof navigator !== 'undefined' ? navigator.userAgent : 'Not available');

  // If already a remote URL, return it (no upload)
  if (typeof fileOrUri === "string" && (fileOrUri.startsWith("http") || fileOrUri.startsWith("https"))) {
    console.log("Already a remote URL, skipping upload");
    return { url: fileOrUri, publicId: "" };
  }

  const formData = new FormData();
  
  // Handle different input types based on platform
  if (typeof fileOrUri === "string") {
    console.log("Processing file URI:", fileOrUri);
    
    // Check if it's a blob URL (web platform)
    if (fileOrUri.startsWith("blob:")) {
      console.log("Converting blob URL to file for web");
      try {
        const response = await fetch(fileOrUri);
        const blob = await response.blob();
        const filename = 'photo.jpg';
        const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
        formData.append("file", file);
      } catch (error) {
        console.error("Failed to convert blob URL:", error);
        throw new Error("Failed to process image file");
      }
    } else {
      // Mobile: file URI (file://, content://, etc.)
      console.log("Processing file URI for mobile:", fileOrUri);
      
      const filename = fileOrUri.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Create proper file object for React Native
      const fileObject = {
        uri: fileOrUri,
        type: type,
        name: filename,
      };
      
      console.log("File object created:", fileObject);
      formData.append("file", fileObject as any);
    }
  } else if (fileOrUri instanceof File || fileOrUri instanceof Blob) {
    // Web: Blob or File object
    console.log("Processing Blob/File for web");
    formData.append("file", fileOrUri);
  } else {
    console.error("Invalid file type:", typeof fileOrUri, fileOrUri);
    throw new Error("Invalid file type provided to upload function");
  }
  
  formData.append("upload_preset", UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  console.log("Uploading to Cloudinary...");
  console.log("FormData prepared with upload_preset:", UPLOAD_PRESET);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log("Cloudinary response status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Cloudinary error response:", text);
      throw new Error("Cloudinary upload failed: " + text);
    }

    const data = await res.json();
    console.log("Upload successful:", data.secure_url);
    return { url: data.secure_url, publicId: data.public_id };
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error("Failed to upload image: " + (error.message || "Unknown error"));
  }
}

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  // load trips when user changes
  useEffect(() => {
    if (!uid) {
      setTrips([]);
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const colRef = userTripsCollectionRef(uid);
        const q = query(colRef, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        const loaded: Trip[] = [];
        snap.forEach((d) => {
          const data = d.data() as DocumentData;
          loaded.push({ id: d.id, ...(data as any) } as Trip);
        });
        // filter blob: local object urls
        const valid = loaded.filter(t => !(typeof t.image === "string" && t.image.startsWith("blob:")));
        if (!mounted) return;
        setTrips(valid);
      } catch (err) {
        console.error("TripsProvider: load failed", err);
      }
    })();
    return () => { mounted = false; };
  }, [uid]);

  const addTrip = async (trip: Omit<Trip, "id">): Promise<Trip> => {
    if (!uid) throw new Error("Not authenticated");
    // upload image if it's a local uri
    let imageUrl = trip.image as string | undefined;
    let imagePublicId: string | null = null;

    try {
      if (imageUrl && !(imageUrl.startsWith("http") || imageUrl.startsWith("https"))) {
        console.log("Uploading image to Cloudinary...");
        const { url, publicId } = await uploadImageToCloudinary(imageUrl);
        console.log("Image uploaded successfully:", url);
        imageUrl = url;
        imagePublicId = publicId;
      } else if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("https"))) {
        // already remote URL — keep as-is, publicId unknown
        imagePublicId = (trip as any).imagePublicId ?? null;
      }
    } catch (err: any) {
      console.error("addTrip: image upload failed", err);
      // Provide user-friendly error message
      if (err.message?.includes("Network request failed") || err.message?.includes("Failed to fetch")) {
        throw new Error("Image upload failed. Please check your internet connection or disable ad blocker and try again.");
      }
      throw new Error("Failed to upload image: " + (err.message || "Unknown error"));
    }

    const payload: any = {
      ...trip,
      image: imageUrl ?? null,
      imagePublicId: imagePublicId ?? null,
      userId: uid,
      createdAt: Date.now(),
    };

    const colRef = userTripsCollectionRef(uid);
    const docRef = await addDoc(colRef, payload);
    const created: Trip = { id: docRef.id, ...(payload as any) };
    setTrips(prev => [created, ...prev]);
    return created;
  };

  const updateTrip = async (trip: Trip): Promise<void> => {
    if (!uid) throw new Error("Not authenticated");
    if (!trip.id) throw new Error("Trip id required for update");

    const prev = trips.find(t => t.id === trip.id);
    const prevPublicId = (prev as any)?.imagePublicId ?? null;

    let imageUrl = trip.image as string | undefined;
    let imagePublicId: string | null = (trip as any)?.imagePublicId ?? null;

    // If new image is a local uri (not http), upload and keep previous publicId (for backend deletion if implemented)
    try {
      if (imageUrl && !(imageUrl.startsWith("http") || imageUrl.startsWith("https"))) {
        const { url, publicId } = await uploadImageToCloudinary(imageUrl);
        imageUrl = url;
        imagePublicId = publicId;

        // We don't delete previous Cloudinary image here (client shouldn't hold API secret).
        // If you want to clean up old images, implement a secure backend endpoint that accepts prevPublicId.
        if (prevPublicId) {
          console.log("Previously uploaded publicId (consider backend deletion):", prevPublicId);
        }
      } else if (imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("https"))) {
        // keep provided publicId if present
        imagePublicId = (trip as any).imagePublicId ?? imagePublicId;
      }
    } catch (err) {
      console.error("updateTrip: image handling failed", err);
      throw err;
    }

    const docRef = doc(db, "users", uid, "trips", trip.id);
    const payload: any = {
      title: trip.title ?? "",
      note: trip.note ?? "",
      location: trip.location ?? "Unknown",
      date: trip.date ?? new Date().toISOString(),
      image: imageUrl ?? null,
      imagePublicId: imagePublicId ?? null,
      folder: trip.folder ?? "My Trips",
      userId: uid,
      // keep createdAt untouched
    };
    // ensure no id field in payload
    console.log("Updating trip in Firebase with payload:", payload);
    await updateDoc(docRef, payload);
    console.log("Firebase update successful, updating local state");
    setTrips(prevArr => prevArr.map(t => (t.id === trip.id ? { ...t, ...payload } as Trip : t)));
  };

  const deleteTrip = async (id: string): Promise<void> => {
    if (!uid) throw new Error("Not authenticated");
    const target = trips.find(t => t.id === id);
    const imagePublicId = (target as any)?.imagePublicId ?? null;

    try {
      const docRef = doc(db, "users", uid, "trips", id);
      await deleteDoc(docRef);
    } catch (err) {
      console.error("deleteTrip: failed deleting doc", err);
      throw err;
    }

    // update local state
    setTrips(prev => prev.filter(t => t.id !== id));

    // We intentionally do not delete the Cloudinary image from the client-side (requires server-side API key).
    if (imagePublicId) {
      console.log("Image publicId (for optional backend deletion):", imagePublicId);
    }
  };

  const refresh = async (): Promise<void> => {
    if (!uid) return;
    try {
      const colRef = userTripsCollectionRef(uid);
      const q = query(colRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const loaded: Trip[] = [];
      snap.forEach((d) => {
        const data = d.data() as DocumentData;
        loaded.push({ id: d.id, ...(data as any) } as Trip);
      });
      setTrips(loaded.filter(t => !(typeof t.image === "string" && t.image.startsWith("blob:"))));
    } catch (err) {
      console.error("TripsProvider: refresh failed", err);
    }
  };

  return (
    <TripsContext.Provider value={{ trips, addTrip, updateTrip, deleteTrip, refresh }}>
      {children}
    </TripsContext.Provider>
  );
}

export const useTripsCtx = () => {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error("useTripsCtx must be used inside a TripsProvider");
  return ctx;
};

/** Backwards compatible hook name your files use */
export const useTrips = useTripsCtx;
