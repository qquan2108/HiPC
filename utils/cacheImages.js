import { Asset } from 'expo-asset';
import { Image } from 'expo-image';

/**
 * Prefetch an array of images into the disk cache.
 * Each item can be a local require() or a remote URL string.
 * Returns a Promise that resolves when all images are cached.
 */
export async function cacheImages(images = []) {
  const tasks = images.map((img) => {
    if (typeof img === 'string') {
      return Image.prefetch(img);
    }
    return Asset.loadAsync(img);
  });
  await Promise.all(tasks);
}
