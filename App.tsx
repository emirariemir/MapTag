// App.tsx
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { useAuthStore } from './src/state/authStore';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const { start, stop } = useAuthStore.getState();
    start();
    return () => stop();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <RootNavigator />
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
export default App;
