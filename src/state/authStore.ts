// state/authStore.ts
import { shallow } from 'zustand/shallow';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { createWithEqualityFn } from 'zustand/traditional';

type AuthStore = {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  start: () => void;
  stop: () => void;
  _unsubscribe?: (() => void) | null;
};

export const useAuthStore = createWithEqualityFn<AuthStore>((set, get) => ({
  user: null,
  initializing: true,
  _unsubscribe: null,

  start: () => {
    if (get()._unsubscribe) return;
    const unsub = auth().onAuthStateChanged((firebaseUser) => {
      set({ user: firebaseUser, initializing: false });
    });
    set({ _unsubscribe: unsub });
  },

  stop: () => {
    const unsub = get()._unsubscribe;
    if (unsub) {
      unsub();
      set({ _unsubscribe: null });
    }
  },
}));

export const useAuthUser = () =>
  useAuthStore((s) => ({ user: s.user, initializing: s.initializing }), shallow);
