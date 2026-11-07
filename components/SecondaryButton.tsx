import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius } from '../constants/Colors';
import { Fonts } from '../constants/Typography';

type SecondaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SecondaryButton({
  label,
  onPress,
  disabled = false,
  icon,
  style,
}: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={styles.label}>{label}</Text>
      </View>
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
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
  },
  pressed: {
    opacity: 0.85,
    backgroundColor: Colors.background,
  },
  disabled: {
    opacity: 0.55,
  },
});
