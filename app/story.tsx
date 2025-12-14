// app/story.tsx
import { RadialGradient } from '@/components/RadialGradient';
import { StoryBook } from '@/components/StoryBook';
import colors from '@/constants/colors';
import fonts from '@/constants/fonts';
import { useAuth } from '@/layout/AuthProvider';
import { useTrips } from '@/layout/TripsProvider';
import { generateTripStory, groupTripsByFolder, type TripStory } from '@/utils/storyGenerator';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function StoryScreen() {
  const { trips } = useTrips();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [story, setStory] = useState<TripStory | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);

  const folderGroups = groupTripsByFolder(trips);
  const folders = Object.keys(folderGroups).filter(folder => folderGroups[folder].length > 0);
  
  console.log('StoryScreen - User:', user?.name);
  console.log('StoryScreen - Trips count:', trips.length);
  console.log('StoryScreen - Params:', params);
  console.log('StoryScreen - Folders:', folders);
  console.log('StoryScreen - Loading:', loading);
  console.log('StoryScreen - Story:', story ? 'exists' : 'null');
  console.log('FolderGroups:', folderGroups);
  console.log('Folders array:', folders);

  const generateStoryForFolder = async (folder: string) => {
    setLoading(true);
    try {
      const folderTrips = folderGroups[folder] || [];
      if (folderTrips.length === 0) {
        Alert.alert('No Trips', 'This folder has no trips to create a story from.');
        return;
      }

      // Simulate AI processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedStory = generateTripStory(folderTrips, folder !== 'My Trips' ? folder : undefined);
      setStory(generatedStory);
      setSelectedFolder(folder);
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert('Error', 'Failed to generate story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFolderSelect = (folder: string) => {
    generateStoryForFolder(folder);
  };

  const handleBackToSelection = () => {
    setStory(null);
    setSelectedFolder(null);
  };

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
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

  // Get folder from params if provided
  useEffect(() => {
    if (params.folder && typeof params.folder === 'string') {
      setSelectedFolder(params.folder);
      generateStoryForFolder(params.folder);
    }
  }, [params.folder, trips]);

  // Simple auth check without redirect
  if (!user) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Story Mode</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingTitle}>Please log in to use Story Mode</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.createButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </RadialGradient>
    );
  }

  if (loading) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/home')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Story Mode</Text>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingTitle}>✨ Creating Your Story ✨</Text>
          <Text style={styles.loadingText}>
            Weaving your memories into a beautiful narrative...
          </Text>
        </View>
      </RadialGradient>
    );
  }

  if (story) {
    return (
      <RadialGradient
        colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToSelection} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2c3e50" />
          </TouchableOpacity>
          <Text style={styles.title}>{story.title}</Text>
        </View>
        
        <StoryBook story={story} onBack={handleBackToSelection} />
      </RadialGradient>
    );
  }

  return (
    <RadialGradient
      colors={[colors.bgGradientStart, colors.bgGradientMid, colors.bgGradientEnd]}
      style={styles.container}
    >


      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {folders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>No Trips Yet</Text>
              <Text style={styles.emptyText}>
                Create some trip cards first, then come back to generate your story!
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/create')}
              >
                <Text style={styles.createButtonText}>Create Your First Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📚 Choose Your Adventure</Text>
                <Text style={styles.sectionSubtitle}>
                  Select a folder to generate your story
                </Text>
              </View>

              <View style={styles.foldersContainer}>
                {folders.map((folder, index) => {
                  const folderTrips = folderGroups[folder];
                  const tripCount = folderTrips.length;
                  const hasImages = folderTrips.some(trip => trip.image);
                  
                  return (
                    <View
                      key={folder}
                      style={styles.folderCard}
                    >
                      <TouchableOpacity
                        style={styles.folderContent}
                        onPress={() => handleFolderSelect(folder)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.folderHeader}>
                          <Text style={styles.folderIcon}>📁</Text>
                          <View style={styles.folderBadge}>
                            <Text style={styles.folderBadgeText}>{tripCount}</Text>
                          </View>
                        </View>
                        
                        <Text style={styles.folderName}>{folder}</Text>
                        
                        <View style={styles.folderStats}>
                          <Text style={styles.folderStatText}>
                            {tripCount} {tripCount === 1 ? 'trip' : 'trips'}
                          </Text>
                          {hasImages && <Text style={styles.folderStatText}> • Photos</Text>}
                        </View>
                        
                        <View style={styles.generateButton}>
                          <Text style={styles.generateButtonText}>✨ Generate Story</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoIcon}>ℹ️</Text>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoTitle}>How it works</Text>
                    <Text style={styles.infoText}>
                      Analyzes your trip cards and creates a personalized travel story with chapters for each day.
                    </Text>
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </RadialGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    color: '#2c3e50',
    fontFamily: fonts.boldItalic,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: fonts.boldItalic,
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: fonts.regular,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: fonts.boldItalic,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  foldersContainer: {
    gap: 15,
    marginBottom: 25,
  },
  folderCard: {
    borderRadius: 20,
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
  folderContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  folderIcon: {
    fontSize: 24,
  },
  folderBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  folderBadgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  folderName: {
    fontSize: 20,
    color: '#2c3e50',
    marginBottom: 8,
    fontFamily: fonts.boldItalic,
  },
  folderStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  folderStatText: {
    fontSize: 14,
    color: '#666',
    fontFamily: fonts.medium,
  },
  generateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
  infoSection: {
    marginTop: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
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
  infoIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: '#2c3e50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    color: '#2c3e50',
    marginBottom: 15,
    fontFamily: fonts.boldItalic,
  },
  emptyText: {
    fontSize: 16,
    color: '#34495e',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    fontFamily: fonts.regular,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.semiBold,
  },
});