// screens/auth/SignInScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../navigation/stacks/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Please enter email and password.');
    try {
      setLoading(true);
      await auth().signInWithEmailAndPassword(email.trim(), password);
      // RootNavigator will switch stacks based on `user`
    } catch (e: any) {
      Alert.alert('Sign in failed', mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        textContentType="emailAddress"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        textContentType="password"
      />

      <Button title={loading ? 'Signing in…' : 'Sign in'} onPress={signIn} disabled={loading} />

      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { email })}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Text>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp', { email })}>
          <Text style={styles.link}>Create one</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapAuthError = (e: any) => {
  const code = e?.code ?? '';
  if (code.includes('invalid-email')) return 'The email address is invalid.';
  if (code.includes('user-not-found') || code.includes('wrong-password')) return 'Email or password is incorrect.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Please try again later.';
  return e?.message ?? 'Something went wrong.';
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  link: { color: '#007AFF', fontWeight: '600' },
});
