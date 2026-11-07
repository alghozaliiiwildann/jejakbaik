import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ErrorState from '../components/ErrorState';
import { Colors } from '../constants/Colors';
import { getHabits } from '../services/storage';

export default function ErrorScreen() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await getHabits();
      router.replace('/(tabs)/home');
    } catch {
      setIsRetrying(false);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ErrorState
        onRetry={() => {
          void handleRetry();
        }}
        onGoHome={() => router.replace('/(tabs)/home')}
        retrying={isRetrying}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
