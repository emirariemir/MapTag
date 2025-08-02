import React, { useEffect, useState } from 'react';
import { View, StyleSheet, PermissionsAndroid, Platform, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, LatLng, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';

export default function MapScreen() {
  const [markers, setMarkers] = useState<LatLng[]>([]);
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
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

  const initialRegion: Region | undefined = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
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
      
      <LinearGradient
        colors={['transparent', '#B6F500']}
        style={styles.bottomGradient}
      />

      <TouchableOpacity onPress={() => {}}>
        <LinearGradient
            colors={['#0065F8', '#4300FF']}
            style={styles.tagButton}
        >
            <Text style={styles.tagButtonText}>Tag</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  tagButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    borderRadius: 999,
    elevation: 4,
  },
  tagButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 40,
    marginVertical: 12,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
});
