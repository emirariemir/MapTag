import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../../components/MapScreen';

export type AppStackParamList = {
  Map: undefined;
  // Later: Profile: undefined; Settings: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Map' }} />
  </Stack.Navigator>
);
