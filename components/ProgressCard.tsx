import {
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Colors, Radius, Shadow } from '../constants/Colors';
import { Fonts } from '../constants/Typography';
import CircularProgress from './CircularProgress';
import ProgressBar from './ProgressBar';

type ProgressCardProps = {
  completed: number;
  total: number;
  percentage: number;
  title?: string;
  style?: StyleProp<ViewStyle>;
};

export default function ProgressCard({
  completed,
  total,
  percentage,
  title = 'Progres Hari Ini',
  style,
}: ProgressCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.row}>
        <CircularProgress percentage={percentage} size={104} strokeWidth={10} />
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {total === 0
              ? 'Belum ada kebiasaan hari ini'
              : `${completed} dari ${total} kebiasaan selesai`}
          </Text>
        </View>
      </View>
      <ProgressBar progress={percentage} style={styles.bar} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.card,
    padding: 18,
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  bar: {
    marginTop: 18,
  },
});
