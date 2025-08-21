// helpers/fetchNearbyTags.ts
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import * as geofire from 'geofire-common';

export type NearbyTag = {
  id: string;
  ownerId: string;
  latitude: number;
  longitude: number;
  title?: string | null;
  visibility: 'public' | 'private';
  createdAt?: FirebaseFirestoreTypes.Timestamp | null;
};

type Options = {
  onlyPublic?: boolean;        // default true
  excludeOwnerId?: string;     // e.g. exclude my own tags
};

export default async function fetchNearbyTags(
  center: { latitude: number; longitude: number },
  radiusInMeters: number,
  opts: Options = {}
): Promise<NearbyTag[]> {
  const { onlyPublic = true, excludeOwnerId } = opts;

  const centerArr: [number, number] = [center.latitude, center.longitude];
  const bounds = geofire.geohashQueryBounds(centerArr, radiusInMeters);

  // Run multiple range queries on 'geohash'
  const queries = bounds.map(([start, end]) =>
    firestore()
      .collection('tags')
      .orderBy('geohash')
      .startAt(start)
      .endAt(end)
      .get()
  );

  const snaps = await Promise.all(queries);

  // Merge + filter by exact distance because boxes are coarse
  const candidates: NearbyTag[] = [];
  for (const snap of snaps) {
    for (const doc of snap.docs) {
      const data = doc.data() as any;
      if (!data?.location) continue;

      if (onlyPublic && data.visibility !== 'public') continue;
      if (excludeOwnerId && data.ownerId === excludeOwnerId) continue;

      const lat = data.location.latitude;
      const lng = data.location.longitude;

      const distanceInM = geofire.distanceBetween(centerArr, [lat, lng]) * 1000;
      if (distanceInM <= radiusInMeters) {
        candidates.push({
          id: doc.id,
          ownerId: data.ownerId,
          latitude: lat,
          longitude: lng,
          title: data.title ?? null,
          visibility: data.visibility,
          createdAt: data.createdAt ?? null,
        });
      }
    }
  }

  // De‑dupe by id (ranges can overlap)
  const byId = new Map<string, NearbyTag>();
  for (const t of candidates) byId.set(t.id, t);
  return Array.from(byId.values());
}
