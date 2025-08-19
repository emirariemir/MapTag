import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker, LatLng, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import auth from '@react-native-firebase/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MapScreen() {
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const insets = useSafeAreaInsets();

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
        },
        (error) => {
          console.warn(error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    requestLocationPermission();
  }, []);

  const handleLongPress = (event: any) => {
    const coordinate = event.nativeEvent.coordinate;
    setMarkers((prev) => [...prev, coordinate]);
  };

  const onSignOut = async () => {
    try {
      setSigningOut(true);
      await auth().signOut();
      // onAuthStateChanged -> user becomes null -> RootNavigator switches to AuthStack
    } catch (e: any) {
      Alert.alert('Sign out failed', e?.message ?? 'Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

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
            <Marker key={index} coordinate={marker} />
          ))}
          {userLocation && <Marker coordinate={userLocation} pinColor="blue" />}
        </MapView>
      )}

      <LinearGradient colors={['transparent', '#B6F500']} style={styles.bottomGradient} />

      <TouchableOpacity style={styles.tagButton} onPress={() => {}}>
        <Text style={styles.tagButtonText}>Tag</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.signOutButton, {marginTop: insets.top}]} onPress={onSignOut} disabled={signingOut}>
        <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign out'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  // Existing Tag button
  tagButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 999,
    backgroundColor: '#4300FF',
    elevation: 4,
  },
  tagButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 40,
    marginVertical: 12,
  },

  // Bottom gradient
  bottomGradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 150,
  },

  // Sign out button (top-right)
  signOutButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    // elevation Android
    elevation: 3,
  },
  signOutText: {
    color: '#fff',
    fontWeight: '700',
  },
});
