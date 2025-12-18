import { router } from "expo-router";
import React, { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { SafeAreaView } from "react-native-safe-area-context";
import { RadialGradient } from "../components/RadialGradient";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useTrips } from "../hooks/useTrips";
import { useAuth } from "../layout/AuthProvider";

export default function HomeScreen() {
  const { trips } = useTrips();
  const { user } = useAuth();
  const swiperRef = useRef<any>(null);
  const [allSwiped, setAllSwiped] = useState(false);

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
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Welcome, {user?.name || "Traveler"}!</Text>
            <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileBtn}>
              <Text style={styles.profileInitial}>
                {user?.name?.charAt(0).toUpperCase() || "T"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.empty}>No trips yet!</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create your first memory</Text>
          </View>

          <View style={styles.fabContainer}>
            <TouchableOpacity style={styles.fab} onPress={() => router.push("/create")}>
              <Text style={styles.fabText}>＋</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </RadialGradient>
    );
  }

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name || "Traveler"}!</Text>
            <Text style={styles.subGreeting}>✨ Your Travel Memories</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")} style={styles.profileBtn}>
            <Text style={styles.profileInitial}>
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardArea}>
          <Swiper
            ref={swiperRef}
            cards={trips}
            renderCard={(card, cardIndex) => {
              if (!card) return null;
              // Add slight rotation variety for authentic polaroid feel
              const rotations = ['1deg', '-1deg', '2deg', '-0.5deg', '1.5deg'];
              const rotation = rotations[cardIndex % rotations.length];
              
              return (
                <TouchableOpacity 
                  style={[styles.card, { transform: [{ rotate: rotation }] }]}
                  onPress={() => {
                    console.log("Card tapped, navigating to details:", card.id);
                    router.push({ pathname: "/details", params: { id: card.id } });
                  }}
                  activeOpacity={0.95}
                >
                  <Image source={{ uri: card.image || undefined }} style={styles.cardImage} />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <View style={styles.cardMetaContainer}>
                      <Text style={styles.cardMeta}>📅 {new Date(card.date).toLocaleDateString()}</Text>
                      <Text style={styles.cardMeta}>📍 {card.location}</Text>
                    </View>
                    <Text style={styles.cardNote} numberOfLines={2}>{card.note}</Text>
                    <Text style={styles.tapHint}>Tap to view details</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            onSwiped={(cardIndex) => {
              console.log("Swiped card:", cardIndex);
            }}
            onSwipedAll={() => {
              console.log("All cards swiped!");
              setAllSwiped(true);
            }}
            cardIndex={0}
            backgroundColor="transparent"
            stackSize={2}
            stackSeparation={15}
            verticalSwipe={false}
            animateCardOpacity
            containerStyle={styles.swiperContainer}
          />
        </View>

        {!allSwiped ? (
          <View style={styles.footer}>
            <Text style={styles.footerText}>Swipe left or right • Tap card for details</Text>
          </View>
        ) : (
          <View style={styles.allSwipedContainer}>
            <Text style={styles.allSwipedEmoji}>🎉</Text>
            <Text style={styles.allSwipedText}>You've seen all your trips!</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setAllSwiped(false);
                if (swiperRef.current) {
                  swiperRef.current.jumpToCardIndex(0);
                }
              }}
            >
              <Text style={styles.resetButtonText}>View Again</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.fabContainer}>
          <TouchableOpacity 
            style={styles.storyFab} 
            onPress={() => router.push("/story")}
          >
            <Text style={styles.storyFabText}>✨</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.fab} onPress={() => router.push("/create")}>
            <Text style={styles.fabText}>＋</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
    zIndex: 100,
  },
  cardArea: {
    flex: 1,
    marginTop: 10,
    marginBottom: 140, // Increase bottom margin to avoid FAB overlap
  },
  greeting: { 
    fontSize: 26, 
    color: "#2c3e50", 
    fontFamily: fonts.boldItalic,
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 14,
    color: "#34495e",
    fontFamily: fonts.medium,
  },
  profileBtn: {
    backgroundColor: "#fff",
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
    borderColor: colors.primary,
  },
  profileInitial: { 
    fontSize: 20, 
    color: colors.primary, 
    fontFamily: fonts.boldItalic 
  },
  swiperContainer: {
    flex: 1,
    paddingHorizontal: 10, // Reduced padding to move cards left
    paddingBottom: 120, // Add padding to prevent overlap with FAB buttons
    marginLeft: -20, // Move cards to the left
  },
  card: {
    // Polaroid-style card design
    backgroundColor: "#fefefe",
    borderRadius: 8,
    padding: 20,
    paddingBottom: 25, // Reduced bottom padding to fit text
    width: 300,
    height: 440, // Increased height to fit all content
    alignSelf: "center",
    // Polaroid shadow effect
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    // Subtle vintage border
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardImage: {
    width: "100%",
    height: 250, // Slightly reduced to make room for text
    borderRadius: 4,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  cardContent: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    flex: 1, // Allow content to expand
    justifyContent: "space-between", // Distribute content evenly
  },
  cardTitle: {
    fontSize: 18,
    color: "#2c3e50",
    marginBottom: 6,
    fontFamily: fonts.boldItalic,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  cardMetaContainer: {
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    fontFamily: fonts.medium,
    textAlign: "center",
  },
  cardNote: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
    lineHeight: 18,
    fontFamily: fonts.regular,
    textAlign: "center",
    flex: 1, // Allow note to take available space
  },
  tapHint: {
    fontSize: 11,
    color: "#999",
    marginTop: 6,
    textAlign: "center",
    fontFamily: fonts.italic,
    paddingBottom: 2, // Ensure it's visible at bottom
  },
  footer: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  footerText: {
    color: "#2c3e50",
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  emptyContainer: { 
    flex: 1,
    alignItems: "center", 
    justifyContent: "center",
    paddingVertical: 60 
  },
  emptyEmoji: { fontSize: 80, marginBottom: 20 },
  empty: { color: "#2c3e50", fontSize: 24, fontFamily: fonts.semiBold, textAlign: "center" },
  emptySubtext: { color: "#34495e", fontSize: 16, textAlign: "center", marginTop: 10, fontFamily: fonts.regular },
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 20,
    alignItems: "center",
    zIndex: 1000,
    elevation: 1000,
  },
  storyFab: {
    backgroundColor: colors.secondary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 1001,
  },
  storyFabText: { fontSize: 20 },
  fab: {
    backgroundColor: colors.primary,
    width: 65,
    height: 65,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: "#fff",
    zIndex: 1002,
  },
  fabText: { fontSize: 36, color: "#fff", marginTop: -3 },
  allSwipedContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  allSwipedEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  allSwipedText: {
    color: "#2c3e50",
    fontSize: 20,
    fontFamily: fonts.boldItalic,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});