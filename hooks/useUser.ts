import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { CELEBRATION_STORAGE_KEY, HABITS_STORAGE_KEY } from '../services/storage';
import { DEFAULT_USER, type AppUser } from '../types/user';

export const USER_NAME_KEY = 'jejakbaik.user.name.v1';
export const USER_EMAIL_KEY = 'jejakbaik.user.email.v1';
export const USER_PHOTO_KEY = 'jejakbaik.user.photo.v1';
export const USER_PROVIDER_KEY = 'jejakbaik.user.provider.v1';

type UseUserResult = {
  user: AppUser;
  isLoading: boolean;
  reload: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updatePhoto: (uri: string | null) => Promise<void>;
  connectGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAllData: () => Promise<void>;
  resetData: () => Promise<void>;
};

async function readUser(): Promise<AppUser> {
  const [name, email, photo, provider] = await Promise.all([
    AsyncStorage.getItem(USER_NAME_KEY),
    AsyncStorage.getItem(USER_EMAIL_KEY),
    AsyncStorage.getItem(USER_PHOTO_KEY),
    AsyncStorage.getItem(USER_PROVIDER_KEY),
  ]);

  return {
    name: name?.trim() || DEFAULT_USER.name,
    email,
    photoUri: photo,
    provider: provider === 'google' ? 'google' : 'guest',
  };
}

async function persistUser(user: AppUser): Promise<void> {
  const entries: [string, string][] = [
    [USER_NAME_KEY, user.name],
    [USER_PROVIDER_KEY, user.provider],
  ];

  if (user.email) {
    entries.push([USER_EMAIL_KEY, user.email]);
  } else {
    await AsyncStorage.removeItem(USER_EMAIL_KEY);
  }

  if (user.photoUri) {
    entries.push([USER_PHOTO_KEY, user.photoUri]);
  } else {
    await AsyncStorage.removeItem(USER_PHOTO_KEY);
  }

  await AsyncStorage.multiSet(entries);
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<AppUser>(DEFAULT_USER);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextUser = await readUser();
      setUser(nextUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const updateName = useCallback(async (name: string) => {
    const trimmedName = name.trim() || DEFAULT_USER.name;
    const nextUser: AppUser = { ...user, name: trimmedName };
    await persistUser(nextUser);
    setUser(nextUser);
  }, [user]);

  const updatePhoto = useCallback(async (uri: string | null) => {
    const nextUser: AppUser = { ...user, photoUri: uri };
    await persistUser(nextUser);
    setUser(nextUser);
  }, [user]);

  // Logic OAuth Google bisa diganti dengan expo-auth-session nanti.
  // Untuk saat ini tombol profil sudah tersedia dan state user diperbarui.
  const connectGoogle = useCallback(async () => {
    const nextUser: AppUser = {
      name: 'Pengguna Google',
      email: 'user@gmail.com',
      photoUri: null,
      provider: 'google',
    };
    await persistUser(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    const guestUser: AppUser = { ...DEFAULT_USER };
    await persistUser(guestUser);
    setUser(guestUser);
  }, []);

  const deleteAllData = useCallback(async () => {
    await AsyncStorage.multiRemove([
      HABITS_STORAGE_KEY,
      CELEBRATION_STORAGE_KEY,
      USER_NAME_KEY,
      USER_EMAIL_KEY,
      USER_PHOTO_KEY,
      USER_PROVIDER_KEY,
    ]);
    setUser({ ...DEFAULT_USER });
  }, []);

  return {
    user,
    isLoading,
    reload,
    updateName,
    updatePhoto,
    connectGoogle,
    logout,
    deleteAllData,
    // Alias sesuai permintaan fitur: reset semua data lokal.
    resetData: deleteAllData,
  };
}

// Alias agar mudah dipakai dengan nama useAuth maupun useUser.
export { useUser as useAuth };
