import * as FileSystem from 'expo-file-system';

/**
 * Copy an image from a temporary location to permanent storage
 * @param uri - The temporary URI from image picker
 * @returns The permanent URI
 */
export const saveImagePermanently = async (uri: string): Promise<string> => {
  try {
    // If it's already a file:// URI in our directory, return it
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      return uri;
    }

    // Create a unique filename
    const filename = `trip_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const destination = `${FileSystem.documentDirectory}${filename}`;

    // Copy the file to permanent storage
    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });

    console.log('Image saved permanently:', destination);
    return destination;
  } catch (error) {
    console.error('Error saving image:', error);
    // If copy fails, return original URI (fallback)
    return uri;
  }
};

/**
 * Delete an image from permanent storage
 * @param uri - The URI to delete
 */
export const deleteImage = async (uri: string): Promise<void> => {
  try {
    // Only delete if it's in our document directory
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        console.log('Image deleted:', uri);
      }
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
