import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import * as geofire from 'geofire-common';

type Visibility = 'public' | 'private';

export default async function saveTag(params: {
  uid: string;
  lat: number;
  lng: number;
  title?: string | null;
  visibility?: Visibility;
}): Promise<string> {
  const { uid, lat, lng, title = null, visibility = 'private' } = params;

  const geohash = geofire.geohashForLocation([lat, lng]);
  const ref = firestore().collection('tags');

  await ref.add({
    ownerId: uid,
    location: new firestore.GeoPoint(lat, lng),
    geohash,
    title,
    visibility,
    createdAt: firestore.FieldValue.serverTimestamp(),
  } as {
    ownerId: string;
    location: FirebaseFirestoreTypes.GeoPoint;
    geohash: string;
    title: string | null;
    visibility: Visibility;
    createdAt: FirebaseFirestoreTypes.FieldValue;
  });

  return ref.id;
}

