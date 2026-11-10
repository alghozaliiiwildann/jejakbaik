# JejakBaik

**Catat Kebiasaanmu, Lihat Perkembanganmu.**

JejakBaik adalah habit tracker mobile dengan UI modern, animasi halus, dan
penyimpanan lokal. Semua data tinggal di perangkat — tanpa login, backend,
maupun koneksi internet.

## Fitur

- **Splash animasi** — Lottie orang berjalan, wordmark, dot loader, dan
  penanganan error saat memuat data.
- **Home** — header gradient, sapaan dinamis, badge streak, kartu progres
  dengan ring & progress bar animasi, quick stats, checklist kebiasaan dengan
  animasi + haptic, FAB pulse, quote harian, dan confetti saat semua kebiasaan
  selesai (sekali per hari).
- **Tambah kebiasaan** — validasi nama, target opsional, 6 kategori, 15 ikon
  berwarna, 8 warna aksen, live preview, dan penyimpanan aman.
- **Detail kebiasaan** — header gradient sesuai warna habit, tombol selesai
  besar, streak, heatmap 30 hari, riwayat 7 hari, target, tanggal dibuat, dan
  hapus dengan konfirmasi.
- **Progres** — laporan per tanggal dengan date picker (2000–sekarang), toggle
  Minggu/Bulan, streak hero, bar chart interaktif (tap bar → bottom sheet berisi
  kebiasaan yang selesai), heatmap 30 hari, badge pencapaian, tren 7 hari, dan
  grid statistik.
- **Error & empty state** dengan tombol coba lagi, serta refresh otomatis lewat
  `useFocusEffect`.

## Menjalankan Proyek

Prasyarat: Node.js 20+ dan aplikasi **Expo Go** di ponsel (atau emulator
Android/iOS).

```bash
npm install
npx expo start
```

Pindai QR code dengan Expo Go. Perintah lain:

```bash
npm run android   # buka di emulator/perangkat Android
npm run ios       # buka di simulator iOS (macOS)
npm run web       # pratinjau di browser
npm run typecheck # TypeScript strict check
npm run lint      # ESLint (eslint-config-expo)
npx expo-doctor   # cek kompatibilitas dependency
```

Semua dependency native sudah termasuk di Expo Go SDK 58 (Reanimated,
Gesture Handler, Lottie, Blur, Haptics, SVG). Jika menambah library native
baru, buat development build dengan `npx expo run:android` atau
`eas build --profile development`.

## Penyimpanan Data

AsyncStorage menyimpan dua key:

```
jejakbaik.habits.v1        // array Habit
jejakbaik.celebration.v1   // tanggal terakhir confetti 100% dimainkan
```

Data divalidasi saat dibaca (`services/storage.ts`): kategori, warna, ikon, dan
tanggal dibersihkan, streak selalu dihitung ulang dari riwayat. JSON rusak tidak
menghapus data — pembacaan gagal menampilkan layar error dengan tombol coba
lagi. Semua mutasi diserialkan lewat antrean agar tidak saling menimpa.

## Struktur Proyek

```
app/
  _layout.tsx            root stack, font Poppins, safe area, gesture handler
  index.tsx              splash Lottie + wordmark + dot loader
  error.tsx              layar gagal memuat data
  (tabs)/
    _layout.tsx          tab Home + Progres memakai FloatingTabBar
    home.tsx
    progress.tsx
  habit/
    add.tsx              form tambah kebiasaan + live preview
    [id].tsx             detail, toggle hari ini, riwayat, hapus
components/
  achievements           AchievementsRow.tsx
  charts                 BarChart7Days, CircularProgress, HeatmapCalendar,
                         LineChartTrend, ProgressBar
  common/                AnimatedNumber, AnimatedWavingHand, DatePickerModal
  ui/                    CustomInput, GlassCard, GradientButton
  cards & states         HabitCard, ProgressCard, QuickStats, StreakHero,
                         Confetti, DayDetailSheet, EmptyState, ErrorState,
                         ConfirmDeleteDialog, CategoryChip, ColorPicker,
                         FloatingTabBar, HabitGlyph, HabitIconPicker
constants/               Colors, Icons, Typography, Quotes
hooks/                   useHabits, useHaptics
services/                storage, dateUtils, habitUtils, colorUtils
types/                   tipe domain Habit, DailyProgress, Achievement
assets/animations/       walking.json (Lottie splash)
```

## Aset Lottie Splash

Splash memakai `assets/animations/walking.json`. Untuk menggantinya:

1. Buka [lottiefiles.com](https://lottiefiles.com) dan cari **"walking person"**
   atau **"running man green"**.
2. Unduh versi **Lottie JSON** (bukan `.lottie`).
3. Timpa file `assets/animations/walking.json`, lalu jalankan ulang
   `npx expo start`.

Tidak ada perubahan kode yang diperlukan selama nama file tetap sama.

## Stack

- React Native 0.88 / Expo SDK 58 / React 19
- TypeScript strict mode (tanpa `any`)
- Expo Router (file-based routing)
- AsyncStorage
- react-native-reanimated 4 + react-native-worklets (semua animasi)
- react-native-gesture-handler & react-native-safe-area-context
- react-native-svg (ring progres, chart, heatmap)
- lucide-react-native (ikon)
- expo-linear-gradient, expo-blur, expo-haptics, expo-font
- lottie-react-native (splash)
- Poppins (400/500/600/700) via @expo-google-fonts/poppins

> Catatan SDK 58: `babel-preset-expo` sudah mengaktifkan plugin
> `react-native-worklets` (pengganti `react-native-reanimated/plugin` pada
> Reanimated 4) secara otomatis, jadi `babel.config.js` tidak perlu konfigurasi
> tambahan.
