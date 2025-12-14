import React, { useRef, useEffect } from "react";
import { Animated, StyleProp, ImageStyle } from "react-native";

type RotatingLogoProps = {
  style?: StyleProp<ImageStyle>;
};

export default function RotatingLogo({ style }: RotatingLogoProps) {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = Animated.sequence([
      Animated.timing(rotation, {
        toValue: 1, // -30 → 30
        duration: 5000,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0, // 30 → -30
        duration: 5000,
        useNativeDriver: true,
      }),
    ]);

    Animated.loop(swing).start();
  }, []);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["-30deg", "30deg"],
  });

  return (
    <Animated.Image
      source={require("../assets/images/logo.png")}
      style={[
        style,
        { transform: [{ rotate: rotateInterpolation }] }
      ]}
      resizeMode="contain"
    />
  );
}
