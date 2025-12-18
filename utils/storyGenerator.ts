// utils/storyGenerator.ts
import type { Trip } from "@/types/trip";

export type StoryChapter = {
  day: number;
  title: string;
  content: string;
  image: string | null;
  location: string;
  date: string;
};

export type TripStory = {
  title: string;
  subtitle: string;
  chapters: StoryChapter[];
  totalDays: number;
};

/**
 * Generate a beautiful trip story from multiple trip cards
 */
export function generateTripStory(trips: Trip[], storyTitle?: string): TripStory {
  if (trips.length === 0) {
    return {
      title: "Empty Journey",
      subtitle: "No memories to tell",
      chapters: [],
      totalDays: 0,
    };
  }

  // Sort trips by date
  const sortedTrips = [...trips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Generate story title
  const locations = [...new Set(sortedTrips.map(t => t.location))];
  const mainLocation = locations[0] || "Unknown";
  const generatedTitle = storyTitle || `Journey to ${mainLocation}${locations.length > 1 ? ` & Beyond` : ''}`;
  
  // Calculate trip duration
  const startDate = new Date(sortedTrips[0].date);
  const endDate = new Date(sortedTrips[sortedTrips.length - 1].date);
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  
  // Generate subtitle
  const subtitle = `A ${totalDays}-day adventure through ${locations.join(', ')}`;
  
  // Generate chapters
  const chapters: StoryChapter[] = sortedTrips.map((trip, index) => {
    const dayNumber = index + 1;
    const chapter = generateChapterContent(trip, dayNumber, index === 0, index === sortedTrips.length - 1);
    return chapter;
  });

  return {
    title: generatedTitle,
    subtitle,
    chapters,
    totalDays,
  };
}

/**
 * Generate content for a single chapter
 */
function generateChapterContent(trip: Trip, dayNumber: number, isFirst: boolean, isLast: boolean): StoryChapter {
  const storyTemplates = {
    beginning: [
      "The journey begins here.",
      "The adventure starts with anticipation.",
      "First steps into a new experience.",
      "The beginning of something memorable.",
    ],
    middle: [
      "The adventure continues.",
      "Each moment brings new discoveries.",
      "The journey unfolds beautifully.",
      "Another chapter in this amazing story.",
      "The experience deepens with every step.",
    ],
    ending: [
      "The journey comes to a peaceful end.",
      "A perfect conclusion to an amazing adventure.",
      "The final chapter of this beautiful story.",
      "Ending on a high note with lasting memories.",
    ],
  };

  // Choose appropriate template based on position
  let templates = storyTemplates.middle;
  if (isFirst) templates = storyTemplates.beginning;
  if (isLast) templates = storyTemplates.ending;

  // Generate narrative content
  let content = trip.note || templates[Math.floor(Math.random() * templates.length)];
  
  // Enhance the content with contextual details
  if (trip.note) {
    // If user provided notes, enhance them
    content = enhanceUserNote(trip.note, isFirst, isLast);
  } else {
    // Generate content based on title and location
    content = generateContextualContent(trip.title, trip.location, isFirst, isLast);
  }

  return {
    day: dayNumber,
    title: trip.title,
    content,
    image: trip.image,
    location: trip.location,
    date: trip.date,
  };
}

/**
 * Enhance user-provided notes with storytelling elements
 */
function enhanceUserNote(note: string, isFirst: boolean, isLast: boolean): string {
  const starters = {
    first: ["The journey began with", "It all started when", "The adventure kicked off as"],
    middle: ["Then came the moment when", "The experience continued as", "Next up was"],
    last: ["The journey concluded with", "Finally,", "The adventure ended as"],
  };

  const enders = {
    first: ["Setting the tone for what was to come.", "A promising start to the adventure.", "The perfect beginning."],
    middle: ["Adding another layer to the experience.", "Each moment building on the last.", "The story continues to unfold."],
    last: ["A fitting end to an incredible journey.", "The perfect conclusion.", "Memories to last a lifetime."],
  };

  let enhanced = note;
  
  // Add contextual beginning if note doesn't start with storytelling language
  if (!note.toLowerCase().match(/^(the|it|we|i|this|that|here|there)/)) {
    const starterArray = isFirst ? starters.first : isLast ? starters.last : starters.middle;
    const starter = starterArray[Math.floor(Math.random() * starterArray.length)];
    enhanced = `${starter} ${note.toLowerCase()}`;
  }

  // Add contextual ending if note is short
  if (note.length < 50) {
    const enderArray = isFirst ? enders.first : isLast ? enders.last : enders.middle;
    const ender = enderArray[Math.floor(Math.random() * enderArray.length)];
    enhanced += ` ${ender}`;
  }

  return enhanced;
}

/**
 * Generate contextual content when no user notes are available
 */
function generateContextualContent(title: string, location: string, isFirst: boolean, isLast: boolean): string {
  const locationWords = location.toLowerCase();
  const titleWords = title.toLowerCase();
  
  // Location-based content
  const locationContent = {
    mountain: ["The peaks stood majestically against the sky.", "Mountain air filled the lungs with freshness.", "Heights that touched the clouds."],
    beach: ["Waves crashed gently on the shore.", "The ocean stretched endlessly into the horizon.", "Sand between toes and salt in the air."],
    city: ["Urban energy buzzed all around.", "City lights painted the night.", "Streets filled with life and stories."],
    cafe: ["Warm aromas and cozy conversations.", "A perfect spot to pause and reflect.", "Simple pleasures in a busy world."],
    temple: ["Peace and serenity filled the space.", "Ancient wisdom whispered through the walls.", "A moment of spiritual connection."],
    default: ["A moment worth remembering.", "Beauty found in unexpected places.", "Life's simple pleasures revealed."],
  };

  // Detect location type
  let locationType = 'default';
  if (locationWords.includes('mountain') || locationWords.includes('hill') || locationWords.includes('peak')) locationType = 'mountain';
  else if (locationWords.includes('beach') || locationWords.includes('ocean') || locationWords.includes('sea')) locationType = 'beach';
  else if (locationWords.includes('city') || locationWords.includes('town') || locationWords.includes('street')) locationType = 'city';
  else if (titleWords.includes('cafe') || titleWords.includes('restaurant') || titleWords.includes('food')) locationType = 'cafe';
  else if (titleWords.includes('temple') || titleWords.includes('church') || titleWords.includes('shrine')) locationType = 'temple';

  const baseContent = locationContent[locationType][Math.floor(Math.random() * locationContent[locationType].length)];
  
  // Add position-specific context
  if (isFirst) {
    return `The adventure began at ${location}. ${baseContent} This was just the beginning of something special.`;
  } else if (isLast) {
    return `The journey concluded at ${location}. ${baseContent} A perfect ending to an unforgettable experience.`;
  } else {
    return `At ${location}, ${baseContent} The adventure continued to unfold with each passing moment.`;
  }
}

/**
 * Group trips by folder/category for multiple story generation
 */
export function groupTripsByFolder(trips: Trip[]): Record<string, Trip[]> {
  return trips.reduce((groups, trip) => {
    const folder = trip.folder || 'My Trips';
    if (!groups[folder]) {
      groups[folder] = [];
    }
    groups[folder].push(trip);
    return groups;
  }, {} as Record<string, Trip[]>);
}