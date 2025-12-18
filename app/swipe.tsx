import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Swiper from "react-native-deck-swiper";
import { RadialGradient } from "../components/RadialGradient";
import colors from "../constants/colors";
import fonts from "../constants/fonts";
import { useTrips } from "../hooks/useTrips";

export default function SwipeScreen() {
  const { trips } = useTrips();
  const swiperRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  // Update dimensions on screen resize
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  if (trips.length === 0) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={styles.emptyContainer}
      >
        <Text style={styles.emptyEmoji}>🗺️</Text>
        <Text style={styles.emptyText}>No trips to swipe through!</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push("/create")}>
          <Text style={styles.buttonText}>Create Your First Trip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </RadialGradient>
    );
  }

  return (
    <RadialGradient
          colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
          style={styles.container}
    >

      <Swiper
        ref={swiperRef}
        cards={trips}
        renderCard={(card) => {
          if (!card) return null;
          return (
            <TouchableOpacity 
              style={[styles.card, { height: dimensions.height * 0.70 }]}
              onPress={() => {
                console.log("Card tapped, navigating to details:", card.id);
                router.push({ pathname: "/details", params: { id: card.id } });
              }}
              activeOpacity={0.9}
            >
              <Image source={{ uri: card.image || undefined }} style={styles.cardImage} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardMeta}>📅 {new Date(card.date).toLocaleDateString()}</Text>
                <Text style={styles.cardMeta}>📍 {card.location}</Text>
                <Text style={styles.cardNote} numberOfLines={3}>{card.note}</Text>
                <Text style={styles.tapHint}>Tap to view details</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        onSwiped={(cardIndex) => {
          console.log("Swiped card:", cardIndex);
        }}
        cardIndex={0}
        backgroundColor={colors.bgGradientStart}
        stackSize={3}
        stackSeparation={15}
        verticalSwipe={false}
        animateCardOpacity
        overlayLabels={{
          left: {
            title: "SKIP",
            style: {
              label: {
                backgroundColor: colors.primary,
                color: "white",
                fontSize: 24,
                fontFamily: fonts.bold,
                padding: 10,
                borderRadius: 10,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: -30,
              },
            },
          },
          right: {
            title: "LOVE",
            style: {
              label: {
                backgroundColor: colors.secondary,
                color: "white",
                fontSize: 24,
                fontFamily: fonts.bold,
                padding: 10,
                borderRadius: 10,
              },
              wrapper: {
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                marginTop: 30,
                marginLeft: 30,
              },
            },
          },
        }}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Swipe left or right • Tap card for details</Text>
      </View>

      {/* Fixed Back Button at Bottom */}
      <TouchableOpacity 
        onPress={() => {
          console.log("Back button pressed, going to home");
          router.push("/home");
        }}
        style={styles.fixedBackButton}
        activeOpacity={1}
      >
        <Text style={styles.fixedBackText}>← BACK TO HOME</Text>
      </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButtonContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backText: {
    color: "#A18CD1",
    fontSize: 18,
    fontFamily: fonts.bold,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontFamily: fonts.bold,
  },
  card: {
    // height is set dynamically in the component
    borderRadius: 20,
    backgroundColor: "#fff",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  cardImage: {
    width: "100%",
    height: "60%",
  },
  cardContent: {
    padding: 20,
    flex: 1,
  },
  cardTitle: {
    fontSize: 28,
    color: "#333",
    marginBottom: 10,
    fontFamily: fonts.boldItalic,
  },
  cardMeta: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
    fontFamily: fonts.regular,
  },
  cardNote: {
    fontSize: 18,
    color: "#555",
    marginTop: 15,
    lineHeight: 26,
    fontFamily: fonts.regular,
  },
  tapHint: {
    fontSize: 14,
    color: "#999",
    marginTop: 15,
    textAlign: "center",
    fontFamily: fonts.italic,
  },
  footer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  footerText: {
    color: "#2c3e50",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  fixedBackButton: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  fixedBackText: {
    color: "#2c3e50",
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: colors.bgGradientStart,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    color: "#2c3e50",
    fontSize: 24,
    fontFamily: fonts.semiBold,
    textAlign: "center",
    marginBottom: 30,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: colors.secondary,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: fonts.semiBold,
  },
});
