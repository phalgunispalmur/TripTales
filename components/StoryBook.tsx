// components/StoryBook.tsx
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';
import type { TripStory } from '@/utils/storyGenerator';
import React, { useEffect } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface StoryBookProps {
  story: TripStory;
  onBack?: () => void;
}

export function StoryBook({ story, onBack }: StoryBookProps) {
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  useEffect(() => {
    Animated.stagger(200, [
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Story Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.subtitle}>{story.subtitle}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{story.totalDays}</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{story.chapters.length}</Text>
            <Text style={styles.statLabel}>Moments</Text>
          </View>
        </View>
      </Animated.View>

      {/* Story Chapters */}
      <View style={styles.chaptersContainer}>
        {story.chapters.map((chapter, index) => (
          <Animated.View 
            key={index} 
            style={[
              styles.chapter,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 30],
                      outputRange: [0, 30 + index * 10],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Chapter Header */}
            <View style={styles.chapterHeader}>
              <View style={styles.dayBadge}>
                <Text style={styles.dayText}>Day {chapter.day}</Text>
              </View>
              <View style={styles.chapterInfo}>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
                <Text style={styles.chapterLocation}>{chapter.location}</Text>
                <Text style={styles.chapterDate}>
                  {new Date(chapter.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Chapter Image */}
            {chapter.image && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: chapter.image }} style={styles.chapterImage} />
              </View>
            )}

            {/* Chapter Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.chapterContent}>{chapter.content}</Text>
            </View>

            {/* Chapter Divider */}
            {index < story.chapters.length - 1 && (
              <View style={styles.chapterDivider}>
                <View style={styles.dividerLine} />
                <View style={styles.dividerDot} />
                <View style={styles.dividerLine} />
              </View>
            )}
          </Animated.View>
        ))}

        {/* Story Footer */}
        <Animated.View 
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.footerContent}>
            <Text style={styles.footerText}>✨ The End ✨</Text>
            <Text style={styles.footerSubtext}>
              Created from your travel memories
            </Text>
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 25,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: fonts.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 40,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: fonts.semiBold,
  },
  chaptersContainer: {
    padding: 20,
  },
  chapter: {
    marginBottom: 30,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  dayBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 15,
  },
  dayText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  chapterInfo: {
    flex: 1,
  },
  chapterTitle: {
    fontSize: 20,
    color: '#2c3e50',
    marginBottom: 4,
    fontFamily: fonts.boldItalic,
  },
  chapterLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: fonts.regular,
  },
  chapterDate: {
    fontSize: 12,
    color: '#999',
    fontFamily: fonts.regular,
  },
  imageContainer: {
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  chapterImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  contentContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chapterContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
    textAlign: 'justify',
  },
  chapterDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(44, 62, 80, 0.2)',
  },
  dividerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginHorizontal: 10,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
  },
  footerContent: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  footerText: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.primary,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
});