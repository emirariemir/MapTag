// screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import { AuthStackParamList } from '../../navigation/stacks/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation, route }) => {
  const [email, setEmail] = useState(route.params?.email ?? '');
  const [loading, setLoading] = useState(false);

  const reset = async () => {
    if (!email) return Alert.alert('Missing email', 'Please enter your email.');
    try {
      setLoading(true);
      await auth().sendPasswordResetEmail(email.trim());
      Alert.alert('Email sent', 'Check your inbox for a password reset link.');
      navigation.replace('SignIn', { email });
    } catch (e: any) {
      const code = e?.code ?? '';
      if (code.includes('invalid-email')) return Alert.alert('Invalid email', 'Please check the email address.');
      Alert.alert('Failed to send reset email', e?.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset your password</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        textContentType="emailAddress"
      />
      <Button title={loading ? 'Sending…' : 'Send reset link'} onPress={reset} disabled={loading} />
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.replace('SignIn', { email })}>
          <Text style={styles.link}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12 },
  row: { alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  link: { color: '#007AFF', fontWeight: '600' },
});
