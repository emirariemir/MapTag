// helpers/fetchTags.ts
import firestore from '@react-native-firebase/firestore';
import { TagMarker } from '../components/MapScreen';

export async function fetchTagsOnceHelper(): Promise<TagMarker[]> {
  try {
    const tagsSnapshot = await firestore().collection('tags').get();
    const fetchedMarkers: TagMarker[] = [];

    tagsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.location) {
        fetchedMarkers.push({
          uid: data.ownerId,
          title: data.title ?? null,
          coordinate: {
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          },
          visibility: data.visibility,
        });
      }
    });

    return fetchedMarkers;
  } catch (e: any) {
    console.warn('fetchTagsOnceHelper error:', e);
    throw new Error(e?.message ?? 'Failed to fetch tags');
  }
}
