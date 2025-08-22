// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/state/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const { start, stop } = useAuthStore.getState();
    start();
    return () => stop();
  }, []);

  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <RootNavigator />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
export default App;
