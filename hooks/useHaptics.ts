import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function isSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function tapFeedback(): void {
  if (!isSupported()) {
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function pressFeedback(): void {
  if (!isSupported()) {
    return;
  }
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
}

export function selectFeedback(): void {
  if (!isSupported()) {
    return;
  }
  void Haptics.selectionAsync().catch(() => undefined);
}

export function successFeedback(): void {
  if (!isSupported()) {
    return;
  }
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => undefined);
}

export function warningFeedback(): void {
  if (!isSupported()) {
    return;
  }
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning,
  ).catch(() => undefined);
}
