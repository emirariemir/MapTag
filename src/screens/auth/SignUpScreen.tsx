// screens/auth/SignUpScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../navigation/stacks/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export const SignUpScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    if (!email || !password) return Alert.alert('Missing fields', 'Please enter email and password.');
    if (password.length < 6) return Alert.alert('Weak password', 'Password must be at least 6 characters.');
    if (password !== confirm) return Alert.alert('Mismatch', 'Passwords do not match.');

    try {
      setLoading(true);
      const cred = await auth().createUserWithEmailAndPassword(email.trim(), password);
      // Optional: send email verification
      await cred.user.sendEmailVerification().catch(() => {});
      Alert.alert('Account created', 'Please check your email for verification.');
      // Optionally navigate back to SignIn prefilled
      navigation.replace('SignIn', { email });
    } catch (e: any) {
      Alert.alert('Sign up failed', mapAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create your account</Text>

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
        placeholder="Password (min 6 chars)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        textContentType="newPassword"
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        textContentType="newPassword"
      />

      <Button title={loading ? 'Creating…' : 'Create account'} onPress={signUp} disabled={loading} />

      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('SignIn', { email })}>
          <Text style={styles.link}>Sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const mapAuthError = (e: any) => {
  const code = e?.code ?? '';
  if (code.includes('email-already-in-use')) return 'This email is already in use.';
  if (code.includes('invalid-email')) return 'The email address is invalid.';
  if (code.includes('weak-password')) return 'Password is too weak.';
  return e?.message ?? 'Something went wrong.';
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  link: { color: '#007AFF', fontWeight: '600' },
});
