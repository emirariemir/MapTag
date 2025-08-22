import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, Text, Alert, ActivityIndicator, Switch } from 'react-native';
import MapView, { Marker, LatLng, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import saveTag, { Visibility } from '../helpers/saveTag';
import { useAuthUser } from '../state/authStore';
import { fetchTagsOnceHelper } from '../helpers/fetchTags';

type SheetMode = 'none' | 'create' | 'details';

export type TagMarker = {
  uid: string;
  title: string | null;
  visibility: Visibility;
  coordinate: LatLng;
}

export default function MapScreen() {
  // --- User & Auth ---
  const { user, initializing } = useAuthUser();

  // --- Location & Tags ---
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [markers, setMarkers] = useState<TagMarker[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);

  // --- UI State ---
  const [signingOut, setSigningOut] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Bottom Sheet: Create Tag ---
  const [sheetTitle, setSheetTitle] = useState<string>('');
  const [sheetPublic, setSheetPublic] = useState<boolean>(false);
  const [pendingCoord, setPendingCoord] = useState<LatLng | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>('none');

  // --- Bottom Sheet: Tag Details ---
  const [selectedTag, setSelectedTag] = useState<{
    uid: string;
    title: string | null;
    visibility: Visibility;
    coordinate: LatLng;
  } | null>(null);

  // --- Refs ---
  const createRef = useRef<BottomSheetModal>(null);
  const detailsRef = useRef<BottomSheetModal>(null);

  // --- Insets ---
  const insets = useSafeAreaInsets();

  const fetchTagsOnce = useCallback(async () => {
    if (!user) return;
    setLoadingTags(true);

    try {
      const markers: TagMarker[] = await fetchTagsOnceHelper();
      setMarkers(markers);
    } catch (e: any) {
      Alert.alert('Failed to fetch tags', e?.message ?? 'Please try again.');
    } finally {
      setLoadingTags(false);
    }
  }, [user]);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }
      Geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(coords);
          fetchTagsOnce();
        },
        (error) => console.warn(error.message),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };
    requestLocationPermission();
  }, [fetchTagsOnce]);

  // === Create Tag Sheet ===
  const openCreateTagSheet = useCallback((coord: LatLng) => {
    detailsRef.current?.dismiss();
    setPendingCoord(coord);
    setSheetTitle('');
    setSheetPublic(false);
    setSheetMode('create');
    requestAnimationFrame(() => createRef.current?.present());
  }, []);

  const handleSave = useCallback(async () => {
    if (!user?.uid || !pendingCoord) return;

    try {
      setSaving(true);

      await saveTag({
        uid: user.uid,
        lat: pendingCoord.latitude,
        lng: pendingCoord.longitude,
        title: sheetTitle?.trim() ? sheetTitle.trim() : null,
        visibility: sheetPublic ? 'public' : 'private',
      });

      createRef.current?.dismiss();
      setPendingCoord(null);
    } catch (e: any) {
      Alert.alert('Failed to save tag', e?.message ?? 'Please try again.');
    } finally {
      setSaving(false);
    }
  }, [user?.uid, pendingCoord, sheetTitle, sheetPublic]);

  const onTagPress = useCallback(async () => {
    if (!user) {
      Alert.alert('Not signed in', 'Please sign in to save a tag.');
      return;
    }
    if (!userLocation) {
      Alert.alert('No location', 'We could not get your current location yet.');
      return;
    }

    openCreateTagSheet(userLocation);
  }, [user, userLocation]);

  // ========================


  // === Sign out ===
  const onSignOut = async () => {
    try {
      setSigningOut(true);
      await auth().signOut();
    } catch (e: any) {
      Alert.alert('Sign out failed', e?.message ?? 'Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  // ========================

  const openDetailSheet = useCallback((tag: TagMarker) => {
    createRef.current?.dismiss();
    setPendingCoord(null);
    setSelectedTag(tag);
    setSheetMode('details');
    requestAnimationFrame(() => detailsRef.current?.present());
  }, [])

  const handleLongPress = useCallback(
    (event: any) => {
      if (initializing) return;
      if (!user?.uid) {
        Alert.alert('Not signed in', 'Please sign in to save a tag.');
        return;
      }
      const coordinate = event.nativeEvent.coordinate as LatLng;
      openCreateTagSheet(coordinate);
    },
    [initializing, user?.uid, openCreateTagSheet]
  );

  const initialRegion: Region | undefined = userLocation
    ? { ...userLocation, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : undefined;

  return (
      <View style={styles.container}>
        {initialRegion && (
          <MapView
            style={styles.map}
            showsUserLocation
            onLongPress={handleLongPress}
            initialRegion={initialRegion}
          >
            {markers.map((marker, index) => (
              <Marker key={index} coordinate={marker.coordinate} onPress={() => openDetailSheet(marker)} />
            ))}
          </MapView>
        )}

        <LinearGradient colors={['transparent', '#B6F500']} style={styles.bottomGradient} />

        <View style={styles.bottomActions}>
          <TouchableOpacity style={[styles.roundButton, loadingTags && styles.disabled]} onPress={fetchTagsOnce} disabled={loadingTags}>
            {loadingTags ? <ActivityIndicator /> : <Text style={styles.tagButtonText}>Refresh</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roundButton, saving && styles.disabled]} onPress={onTagPress} disabled={saving}>
            {saving ? <ActivityIndicator /> : <Text style={styles.tagButtonText}>Tag</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.signOutButton, { marginTop: insets.top }]} onPress={onSignOut} disabled={signingOut}>
          <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
        </TouchableOpacity>

        {/* Bottom Sheets */}
        <BottomSheetModal
          ref={createRef}
          enablePanDownToClose
          onDismiss={() => { setSheetMode('none'); setPendingCoord(null); setSelectedTag(null); }}
        >
          <BottomSheetView key={sheetMode} style={styles.sheetContent}>
              <Text style={styles.sheetTitle}>New Tag</Text>
              <Text style={styles.inputLabel}>Title (optional)</Text>
              <BottomSheetTextInput
                value={sheetTitle}
                onChangeText={setSheetTitle}
                placeholder="Give it a short title"
                style={styles.textInput}
                autoCapitalize="sentences"
                returnKeyType="done"
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Public</Text>
                <Switch value={sheetPublic} onValueChange={setSheetPublic} />
              </View>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabled]}
                onPress={handleSave}
                disabled={saving || !pendingCoord}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
              </TouchableOpacity>
            <View style={{ paddingBottom: insets.bottom }} />
          </BottomSheetView>
        </BottomSheetModal>

        <BottomSheetModal
          ref={detailsRef}
          enablePanDownToClose
          onDismiss={() => { setSheetMode('none'); setPendingCoord(null); setSelectedTag(null); }}
        >
          <BottomSheetView key={sheetMode} style={styles.sheetContent}>
            <Text style={{ fontWeight:'700', fontSize:18 }}>{selectedTag?.title ?? 'Untitled'}</Text>
            <Text>Visibility: {selectedTag?.visibility}</Text>
            <Text>Lat: {selectedTag?.coordinate.latitude.toFixed(6)}</Text>
            <Text>Lng: {selectedTag?.coordinate.longitude.toFixed(6)}</Text>
            <View style={{ paddingBottom: insets.bottom }} />
          </BottomSheetView>
        </BottomSheetModal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  bottomActions: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  roundButton: {
    borderRadius: 999,
    backgroundColor: '#4300FF',
    elevation: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 110,
    alignItems: 'center',
  },
  disabled: { opacity: 0.7 },
  tagButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 150,
  },

  signOutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Sheet
  sheetContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  textInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: '#4300FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
