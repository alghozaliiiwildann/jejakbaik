# JejakBaik

**Catat Kebiasaanmu, Lihat Perkembanganmu.**

JejakBaik adalah aplikasi habit tracker sederhana berbasis React Native + Expo.
Semua data disimpan lokal di perangkat, tanpa login, backend, atau koneksi internet.

## Fitur

- Splash screen dengan pemuatan data dan penanganan error.
- Home: sapaan dinamis, tanggal Indonesia, progres hari ini, daftar kebiasaan, dan FAB tambah.
- Tambah kebiasaan: validasi nama, target opsional, 6 kategori, dan pemilih ikon.
- Detail kebiasaan: tandai selesai hari ini, riwayat 7 hari, dan hapus dengan konfirmasi.
- Progress: kartu penyelesaian hari ini, grafik batang 7 hari, dan statistik.
- Empty state dan error state yang bisa dicoba ulang.

## Menjalankan Proyek

Prasyarat: Node.js 20+ dan aplikasi **Expo Go** di ponsel (atau emulator Android/iOS).

```bash
npm install
npx expo start
```

Pindai QR code yang muncul dengan Expo Go. Kamera Expo Go dapat membuka proyek
langsung dari perangkat pada jaringan yang sama.

Perintah lain:

```bash
npm run android   # buka di emulator/perangkat Android
npm run ios       # buka di simulator iOS (macOS)
npm run web       # pratinjau di browser
npm run typecheck # TypeScript strict check
```

## Penyimpanan Data

Data disimpan dengan `AsyncStorage` pada key:

```
jejakbaik.habits.v1
```

Formatnya array `Habit` sesuai `types/habit.ts`. JSON yang rusak tidak akan
menghapus data: pembacaan gagal akan menampilkan layar error dan tombol coba lagi.

## Struktur Proyek

```
app/
  _layout.tsx          root stack, font Poppins, safe area
  index.tsx            splash / loading
  error.tsx            layar gagal memuat data
  (tabs)/
    _layout.tsx        bottom tab Home + Progress
    home.tsx
    progress.tsx
  habit/
    add.tsx
    [id].tsx
components/            11 komponen UI reusable
constants/             Colors, Icons, Typography
services/              storage, dateUtils, habitUtils
types/                 tipe domain Habit
assets/                ikon & splash bawaan Expo
```

## Catatan Aset Logo

Splash menggunakan placeholder tiga ikon daun (`Leaf` dari lucide) sesuai
ketentuan fallback, karena `assets/logo.png` belum tersedia di repositori ini.
Untuk memakai logo asli, taruh file di `assets/logo.png`, lalu ganti blok
`logoMark` di `app/index.tsx` dengan komponen `Image`:

```tsx
<Image
  source={require('../assets/logo.png')}
  style={{ width: 160, height: 160 }}
  resizeMode="contain"
/>
```

## Stack

- React Native 0.88 / Expo SDK 58
- TypeScript strict mode
- Expo Router (file-based routing)
- AsyncStorage
- lucide-react-native + react-native-svg
- Poppins via expo-font dan @expo-google-fonts/poppins
