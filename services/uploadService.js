import { supabase } from '../config/supabase';
import { getCurrentUser } from './authService';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

/**
 * File Upload Service
 * Handles file uploads to Supabase Storage
 */

// Storage bucket names
const BUCKETS = {
  AVATARS: 'avatars',
  AUDIO: 'audio',
  IMAGES: 'images',
  DOCUMENTS: 'documents'
};

// File size limits (in bytes)
const SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  AVATAR: 2 * 1024 * 1024, // 2MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024 // 10MB
};

/**
 * Pick an image from gallery or camera
 * @param {boolean} allowsEditing - Allow image editing
 * @param {number} quality - Image quality (0-1)
 * @returns {Promise<{success: boolean, uri: string, error: any}>}
 */
export async function pickImage(allowsEditing = true, quality = 0.8) {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Permission to access media library denied' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing,
      quality,
      aspect: [1, 1], // Square aspect ratio
    });

    if (result.canceled) {
      return { success: false, error: 'Image picking canceled' };
    }

    return {
      success: true,
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Take a photo with camera
 * @returns {Promise<{success: boolean, uri: string, error: any}>}
 */
export async function takePhoto() {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { success: false, error: 'Permission to access camera denied' };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      aspect: [1, 1],
    });

    if (result.canceled) {
      return { success: false, error: 'Photo taking canceled' };
    }

    return {
      success: true,
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Pick an audio file
 * @returns {Promise<{success: boolean, uri: string, name: string, size: number, error: any}>}
 */
export async function pickAudio() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true
    });

    if (result.canceled) {
      return { success: false, error: 'Audio picking canceled' };
    }

    const file = result.assets[0];

    // Check file size
    if (file.size > SIZE_LIMITS.AUDIO) {
      return { success: false, error: `Audio file too large. Maximum size is ${SIZE_LIMITS.AUDIO / 1024 / 1024}MB` };
    }

    return {
      success: true,
      uri: file.uri,
      name: file.name,
      size: file.size,
      mimeType: file.mimeType
    };
  } catch (error) {
    console.error('Error picking audio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload a file to Supabase Storage
 * @param {string} uri - Local file URI
 * @param {string} bucket - Storage bucket name
 * @param {string} fileName - Destination file name
 * @returns {Promise<{success: boolean, url: string, path: string, error: any}>}
 */
async function uploadFileToStorage(uri, bucket, fileName) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Fetch the file as a blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create array buffer from blob
    const arrayBuffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });

    // Upload to Supabase Storage
    const filePath = `${user.id}/${Date.now()}_${fileName}`;
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        contentType: blob.type,
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload avatar image
 * @param {string} uri - Local image URI
 * @returns {Promise<{success: boolean, url: string, error: any}>}
 */
export async function uploadAvatar(uri) {
  try {
    // Validate file size (rough estimate)
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > SIZE_LIMITS.AVATAR) {
      return {
        success: false,
        error: `Image too large. Maximum size is ${SIZE_LIMITS.AVATAR / 1024 / 1024}MB`
      };
    }

    // Upload to avatars bucket
    const fileName = `avatar_${Date.now()}.jpg`;
    const result = await uploadFileToStorage(uri, BUCKETS.AVATARS, fileName);

    if (!result.success) {
      return result;
    }

    // Update user profile with new avatar URL
    const user = await getCurrentUser();
    if (user) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: result.url })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile avatar:', updateError);
      }
    }

    return {
      success: true,
      url: result.url,
      path: result.path
    };
  } catch (error) {
    console.error('Error in uploadAvatar:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload post image
 * @param {string} uri - Local image URI
 * @returns {Promise<{success: boolean, url: string, error: any}>}
 */
export async function uploadPostImage(uri) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > SIZE_LIMITS.IMAGE) {
      return {
        success: false,
        error: `Image too large. Maximum size is ${SIZE_LIMITS.IMAGE / 1024 / 1024}MB`
      };
    }

    const fileName = `post_${Date.now()}.jpg`;
    return await uploadFileToStorage(uri, BUCKETS.IMAGES, fileName);
  } catch (error) {
    console.error('Error in uploadPostImage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload post audio
 * @param {string} uri - Local audio URI
 * @param {string} originalName - Original file name
 * @returns {Promise<{success: boolean, url: string, error: any}>}
 */
export async function uploadPostAudio(uri, originalName) {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    if (blob.size > SIZE_LIMITS.AUDIO) {
      return {
        success: false,
        error: `Audio file too large. Maximum size is ${SIZE_LIMITS.AUDIO / 1024 / 1024}MB`
      };
    }

    // Preserve original extension
    const extension = originalName ? originalName.split('.').pop() : 'mp3';
    const fileName = `audio_${Date.now()}.${extension}`;

    return await uploadFileToStorage(uri, BUCKETS.AUDIO, fileName);
  } catch (error) {
    console.error('Error in uploadPostAudio:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a file from storage
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - File path in storage
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function deleteFile(bucket, filePath) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get file URL from storage
 * @param {string} bucket - Storage bucket name
 * @param {string} filePath - File path in storage
 * @returns {string} Public URL
 */
export function getFileUrl(bucket, filePath) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export default {
  pickImage,
  takePhoto,
  pickAudio,
  uploadAvatar,
  uploadPostImage,
  uploadPostAudio,
  deleteFile,
  getFileUrl,
  BUCKETS,
  SIZE_LIMITS
};
