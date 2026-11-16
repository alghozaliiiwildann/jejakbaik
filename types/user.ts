/** Sumber akun user yang saat ini aktif di perangkat. */
export type AuthProvider = 'guest' | 'google';

/** Data profil user yang disimpan secara lokal. */
export type AppUser = {
  name: string;
  email: string | null;
  photoUri: string | null;
  provider: AuthProvider;
};

export const DEFAULT_USER: AppUser = {
  name: 'Teman',
  email: null,
  photoUri: null,
  provider: 'guest',
};
