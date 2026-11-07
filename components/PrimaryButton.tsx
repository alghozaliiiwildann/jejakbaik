import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius } from '../constants/Colors';
import { Fonts } from '../constants/Typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  variant?: 'primary' | 'success';
  style?: StyleProp<ViewStyle>;
};

export default function PrimaryButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  const isSuccess = variant === 'success';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSuccess ? styles.successButton : styles.primaryButton,
        pressed && !isDisabled ? styles.pressed : null,
        isDisabled ? styles.disabled : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isSuccess ? Colors.success : Colors.white}
        />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[styles.label, isSuccess ? styles.successLabel : null]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  successButton: {
    backgroundColor: Colors.softGreen,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.white,
  },
  successLabel: {
    color: Colors.success,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.55,
  },
});
