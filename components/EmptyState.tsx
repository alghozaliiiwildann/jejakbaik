import type { LucideIcon } from 'lucide-react-native';
import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';
import { Fonts } from '../constants/Typography';
import PrimaryButton from './PrimaryButton';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  style,
}: EmptyStateProps) {
  const IconComponent = icon ?? Icons.Sprout;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <IconComponent size={44} color={Colors.primary} strokeWidth={1.8} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.softGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
  },
  description: {
    marginTop: 6,
    maxWidth: 280,
    fontFamily: Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  action: {
    width: '100%',
    maxWidth: 280,
    marginTop: 20,
  },
});
