import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
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
import { useAuth } from "../layout/AuthProvider";

export default function TripsScreen() {
  const { trips, updateTrip, refresh } = useTrips();
  const { user } = useAuth();
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedTrips, setSelectedTrips] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Update dimensions on screen resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Group trips by folder
  const groupedTrips = React.useMemo(() => {
    const groups: { [key: string]: typeof trips } = {};
    
    trips.forEach(trip => {
      const folderName = trip.folder || "My Trips";
      if (!groups[folderName]) {
        groups[folderName] = [];
      }
      groups[folderName].push(trip);
    });

    // Sort trips within each folder by date (newest first)
    Object.keys(groups).forEach(folder => {
      groups[folder].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return groups;
  }, [trips]);

  // Expand first folder by default
  useEffect(() => {
    const folderNames = Object.keys(groupedTrips);
    if (folderNames.length > 0 && expandedFolders.size === 0) {
      setExpandedFolders(new Set([folderNames[0]]));
    }
  }, [groupedTrips]);

  const toggleFolder = (folderName: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleTripSelection = (tripId: string) => {
    const newSelected = new Set(selectedTrips);
    if (newSelected.has(tripId)) {
      newSelected.delete(tripId);
    } else {
      newSelected.add(tripId);
    }
    setSelectedTrips(newSelected);
  };

  const enterSelectionMode = () => {
    setIsSelectionMode(true);
    setSelectedTrips(new Set());
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedTrips(new Set());
  };

  const moveSelectedTrips = async (targetFolder: string) => {
    try {
      const selectedTripObjects = trips.filter(trip => selectedTrips.has(trip.id));
      console.log("Moving trips to folder:", targetFolder);
      console.log("Selected trips:", selectedTripObjects.map(t => ({ id: t.id, title: t.title, currentFolder: t.folder })));
      
      for (const trip of selectedTripObjects) {
        console.log(`Updating trip ${trip.id} from folder "${trip.folder}" to "${targetFolder}"`);
        await updateTrip({
          ...trip,
          folder: targetFolder
        });
      }
      
      // Refresh the trips to ensure UI is updated
      await refresh();
      
      // Expand the target folder to show the moved trips
      setExpandedFolders(prev => new Set([...prev, targetFolder]));
      
      Alert.alert("Success", `Moved ${selectedTrips.size} trip(s) to "${targetFolder}"`);
      exitSelectionMode();
      setShowMoveModal(false);
    } catch (error) {
      console.error("Error moving trips:", error);
      Alert.alert("Error", "Failed to move trips. Please try again.");
    }
  };

  const createNewFolder = () => {
    setShowMoveModal(false);
    setShowNewFolderModal(true);
    setNewFolderName("");
  };

  const confirmNewFolder = () => {
    const trimmedName = newFolderName.trim();
    if (!trimmedName) {
      Alert.alert("Error", "Please enter a folder name");
      return;
    }
    
    // Check if folder already exists
    if (Object.keys(groupedTrips).includes(trimmedName)) {
      Alert.alert("Folder Exists", `The folder "${trimmedName}" already exists. Trips will be moved to the existing folder.`);
    }
    
    moveSelectedTrips(trimmedName);
    setShowNewFolderModal(false);
    setNewFolderName("");
  };

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  if (trips.length === 0) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={styles.container}
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>No Trips Yet!</Text>
          <Text style={styles.emptySubtext}>
            Start creating your travel memories by adding your first trip card.
          </Text>
          
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => router.push("/create")}
          >
            <Text style={styles.createButtonText}>Create First Trip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back to Profile</Text>
          </TouchableOpacity>
        </View>
      </RadialGradient>
    );
  }

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            {isSelectionMode ? `${selectedTrips.size} Selected` : "My Trip Cards"}
          </Text>
          <Text style={styles.subtitle}>
            {isSelectionMode 
              ? "Tap trips to select/deselect" 
              : `${trips.length} ${trips.length === 1 ? 'trip' : 'trips'} collected`
            }
          </Text>
        </View>
        
        {isSelectionMode ? (
          <View style={styles.selectionControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={exitSelectionMode}
            >
              <Text style={styles.controlButtonText}>Cancel</Text>
            </TouchableOpacity>
            {selectedTrips.size > 0 && (
              <TouchableOpacity 
                style={[styles.controlButton, styles.moveButton]} 
                onPress={() => setShowMoveModal(true)}
              >
                <Text style={styles.controlButtonText}>Move</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.selectButton} 
              onPress={enterSelectionMode}
            >
              <Text style={styles.selectButtonText}>Select</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedTrips).map(([folderName, folderTrips]) => (
          <View key={folderName} style={styles.folderContainer}>
            <TouchableOpacity
              style={styles.folderHeader}
              onPress={() => toggleFolder(folderName)}
              activeOpacity={0.7}
            >
              <View style={styles.folderHeaderLeft}>
                <Text style={styles.folderIcon}>
                  {expandedFolders.has(folderName) ? "📂" : "📁"}
                </Text>
                <View>
                  <Text style={styles.folderName}>{folderName}</Text>
                  <Text style={styles.folderCount}>
                    {folderTrips.length} {folderTrips.length === 1 ? 'trip' : 'trips'}
                  </Text>
                </View>
              </View>
              <Text style={styles.expandIcon}>
                {expandedFolders.has(folderName) ? "▼" : "▶"}
              </Text>
            </TouchableOpacity>

            {expandedFolders.has(folderName) && (
              <View style={styles.folderContent}>
                {folderTrips.map((trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={[
                      styles.tripCard,
                      { 
                        marginBottom: 12,
                        maxHeight: dimensions.height * 0.35 
                      },
                      selectedTrips.has(trip.id) && styles.selectedCard
                    ]}
                    onPress={() => {
                      if (isSelectionMode) {
                        toggleTripSelection(trip.id);
                      } else {
                        console.log("Trip card tapped, navigating to details:", trip.id);
                        router.push({ pathname: "/details", params: { id: trip.id } });
                      }
                    }}
                    onLongPress={() => {
                      if (!isSelectionMode) {
                        enterSelectionMode();
                        toggleTripSelection(trip.id);
                      }
                    }}
                    activeOpacity={0.9}
                  >
                    <Image 
                      source={{ uri: trip.image || undefined }} 
                      style={styles.tripImage} 
                    />
                    <View style={styles.tripContent}>
                      {isSelectionMode && (
                        <View style={styles.selectionIndicator}>
                          <Text style={styles.selectionIcon}>
                            {selectedTrips.has(trip.id) ? "✓" : "○"}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.tripTitle}>{trip.title}</Text>
                      <Text style={styles.tripMeta}>📅 {new Date(trip.date).toLocaleDateString()}</Text>
                      <Text style={styles.tripMeta}>📍 {trip.location}</Text>
                      {trip.note && (
                        <Text style={styles.tripNote} numberOfLines={2}>
                          {trip.note}
                        </Text>
                      )}
                      <Text style={styles.tapHint}>
                        {isSelectionMode ? "Tap to select/deselect" : "Tap to view details"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.storyButton} 
          onPress={() => router.push("/story")}
        >
          <Text style={styles.storyButtonText}>✨</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fabPrimary} 
          onPress={() => router.push("/create")}
        >
          <Text style={styles.fabPrimaryText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* Move Modal */}
      <Modal
        visible={showMoveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Move {selectedTrips.size} trip(s) to:</Text>
            
            <ScrollView style={styles.folderList}>
              {Object.keys(groupedTrips).map((folderName) => (
                <TouchableOpacity
                  key={folderName}
                  style={styles.folderOption}
                  onPress={() => moveSelectedTrips(folderName)}
                >
                  <Text style={styles.folderOptionIcon}>📁</Text>
                  <Text style={styles.folderOptionText}>{folderName}</Text>
                  <Text style={styles.folderOptionCount}>
                    ({groupedTrips[folderName].length})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.newFolderButton}
                onPress={createNewFolder}
              >
                <Text style={styles.newFolderButtonText}>+ New Folder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowMoveModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Folder Modal */}
      <Modal
        visible={showNewFolderModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNewFolderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Folder</Text>
            
            <TextInput
              style={styles.folderInput}
              placeholder="Enter folder name"
              placeholderTextColor="#666"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus={true}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewFolderModal(false);
                  setShowMoveModal(true);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.newFolderButton}
                onPress={confirmNewFolder}
              >
                <Text style={styles.newFolderButtonText}>Create & Move</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    zIndex: 100,
  },
  title: {
    fontSize: 28,
    color: "#2c3e50",
    fontFamily: fonts.boldItalic,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#34495e",
    fontFamily: fonts.medium,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  addButtonText: {
    fontSize: 28,
    color: "#fff",
    marginTop: -2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  folderContainer: {
    marginBottom: 20,
  },
  folderHeader: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 15,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },

  folderHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  folderIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  folderName: {
    fontSize: 20,
    color: "#2c3e50",
    fontFamily: fonts.boldItalic,
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 14,
    color: "#666",
    fontFamily: fonts.medium,
  },
  expandIcon: {
    fontSize: 16,
    color: "#666",
    fontFamily: fonts.semiBold,
  },
  tripCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  tripImage: {
    width: "100%",
    height: 180,
  },
  tripContent: {
    padding: 16,
  },
  tripTitle: {
    fontSize: 20,
    color: "#333",
    marginBottom: 6,
    fontFamily: fonts.boldItalic,
  },
  tripMeta: {
    fontSize: 13,
    color: "#666",
    marginBottom: 3,
    fontFamily: fonts.regular,
  },
  tripNote: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  tapHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    fontFamily: fonts.italic,
  },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
  },
  storyButton: {
    backgroundColor: colors.secondary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyButtonText: {
    fontSize: 20,
  },
  homeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  homeButtonText: {
    fontSize: 18,
  },
  fabPrimary: {
    backgroundColor: colors.primary,
    width: 65,
    height: 65,
    borderRadius: 32.5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: "#fff",
  },
  fabPrimaryText: {
    fontSize: 36,
    color: "#fff",
    marginTop: -3,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 28,
    color: "#2c3e50",
    fontFamily: fonts.boldItalic,
    marginBottom: 15,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#34495e",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    fontFamily: fonts.regular,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
  },
  backButtonText: {
    color: "#2c3e50",
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  folderContent: {
    paddingLeft: 8,
  },
  // Selection Mode Styles
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  selectionControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: "#666",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  moveButton: {
    backgroundColor: colors.primary,
  },
  controlButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 3,
    backgroundColor: "rgba(161, 140, 209, 0.1)",
  },
  selectionIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  selectionIcon: {
    fontSize: 16,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: fonts.boldItalic,
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  folderList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  folderOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    marginBottom: 8,
  },
  folderOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  folderOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: "#2c3e50",
  },
  folderOptionCount: {
    fontSize: 14,
    color: "#666",
  },
  folderInput: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#e9ecef",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  newFolderButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginRight: 10,
  },
  newFolderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
    textAlign: "center",
  },
  cancelButton: {
    backgroundColor: "#666",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
    textAlign: "center",
  },
});