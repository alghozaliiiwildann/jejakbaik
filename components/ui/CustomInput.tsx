import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Radius } from '../../constants/Colors';
import { Fonts } from '../../constants/Typography';

type CustomInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon: LucideIcon;
  placeholder?: string;
  error?: string | null;
  style?: StyleProp<ViewStyle>;
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  onSubmitEditing?: TextInputProps['onSubmitEditing'];
  editable?: boolean;
  autoFocus?: boolean;
};

export default function CustomInput({
  label,
  value,
  onChangeText,
  leftIcon: IconComponent,
  placeholder,
  error,
  style,
  maxLength,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
  editable = true,
  autoFocus = false,
}: CustomInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const isFloating = isFocused || value.length > 0;

  useEffect(() => {
    focusProgress.value = withTiming(isFloating ? 1 : 0, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFloating, focusProgress]);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [Colors.border, Colors.primary],
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    top: interpolate(focusProgress.value, [0, 1], [20, 7]),
    fontSize: interpolate(focusProgress.value, [0, 1], [14, 10]),
    letterSpacing: interpolate(focusProgress.value, [0, 1], [0, 0.3]),
  }));

  const iconColor = isFocused ? Colors.primary : Colors.textSecondary;

  return (
    <View style={style}>
      <Animated.View
        style={[
          styles.container,
          borderStyle,
          error ? styles.containerError : null,
          isFocused ? styles.containerFocused : null,
          !editable ? styles.disabled : null,
        ]}
      >
        <View style={styles.iconWrap} pointerEvents="none">
          <IconComponent size={20} color={iconColor} strokeWidth={2} />
        </View>

        <Animated.Text
          pointerEvents="none"
          numberOfLines={1}
          style={[
            styles.floatingLabel,
            labelStyle,
            isFocused ? styles.floatingLabelFocused : null,
          ]}
        >
          {label}
        </Animated.Text>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          placeholderTextColor={Colors.placeholder}
          selectionColor={Colors.primary}
          cursorColor={Colors.primary}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          autoFocus={autoFocus}
          accessibilityLabel={label}
          style={styles.input}
        />
      </Animated.View>

      {error ? (
        <Animated.Text style={styles.errorText}>{error}</Animated.Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 62,
    borderRadius: Radius.input,
    borderWidth: 1.5,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  containerFocused: {
    shadowColor: Colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  containerError: {
    borderColor: Colors.error,
  },
  disabled: {
    opacity: 0.65,
  },
  iconWrap: {
    position: 'absolute',
    left: 16,
    top: 21,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 47,
    right: 16,
    fontFamily: Fonts.medium,
    color: Colors.placeholder,
  },
  floatingLabelFocused: {
    color: Colors.primary,
  },
  input: {
    minHeight: 62,
    paddingLeft: 47,
    paddingRight: 16,
    paddingTop: 23,
    paddingBottom: 8,
    margin: 0,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
  },
  errorText: {
    marginTop: 6,
    marginLeft: 4,
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.error,
  },
});
