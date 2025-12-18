// components/RadialGradient.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface RadialGradientProps {
  colors: string[];
  style?: any;
  children?: React.ReactNode;
}

export function RadialGradient({ colors, style, children }: RadialGradientProps) {
  return (
    <View style={[styles.container, style]}>
      {/* Create multiple overlapping gradients to simulate radial effect */}
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={[colors[0] + '80', 'transparent', colors[colors.length - 1] + '40']}
        style={[styles.overlay, { transform: [{ rotate: '45deg' }] }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['transparent', colors[1] + '60', 'transparent']}
        style={[styles.overlay, { transform: [{ rotate: '-45deg' }] }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    top: -height * 0.2,
    left: -width * 0.2,
    right: -width * 0.2,
    bottom: -height * 0.2,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});