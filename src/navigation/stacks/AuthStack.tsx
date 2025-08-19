// navigators/stacks/AuthStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ForgotPasswordScreen } from '../../screens/auth/ForgotPasswordScreen';
import { SignInScreen } from '../../screens/auth/SignInScreen';
import { SignUpScreen } from '../../screens/auth/SignUpScreen';

export type AuthStackParamList = {
  SignIn: { email?: string } | undefined;
  SignUp: { email?: string } | undefined;
  ForgotPassword: { email?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="SignIn" component={SignInScreen} options={{ title: 'Sign in' }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create account' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset password' }} />
  </Stack.Navigator>
);
