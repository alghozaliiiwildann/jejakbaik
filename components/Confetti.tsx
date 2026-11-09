import { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const CONFETTI_COLORS = [
  '#16A34A',
  '#4ADE80',
  '#FBBF24',
  '#FB923C',
  '#38BDF8',
  '#EC4899',
  '#A78BFA',
];

type Piece = {
  id: number;
  left: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  spin: number;
  drift: number;
  round: boolean;
};

type PieceProps = {
  piece: Piece;
  screenHeight: number;
};

function seededRandom(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function ConfettiPiece({ piece, screenHeight }: PieceProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withTiming(1, { duration: piece.duration, easing: Easing.linear }),
    );
  }, [piece.delay, piece.duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [-30, screenHeight + 40]) },
      { translateX: interpolate(progress.value, [0, 1], [0, piece.drift]) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, piece.spin])}deg` },
      { scaleX: interpolate(progress.value, [0, 0.5, 1], [1, 0.55, 1]) },
    ],
    opacity: interpolate(progress.value, [0, 0.82, 1], [1, 1, 0]),
  }));

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.left,
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 0.55,
          borderRadius: piece.round ? piece.size / 2 : 3,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}

type ConfettiProps = {
  active: boolean;
};

export default function Confetti({ active }: ConfettiProps) {
  const { width, height } = useWindowDimensions();

  const pieces = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: seededRandom(width + index * 7) * Math.max(1, width - 16),
        size: 6 + seededRandom(width + index * 7 + 1) * 7,
        color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        delay: seededRandom(width + index * 7 + 2) * 500,
        duration: 1500 + seededRandom(width + index * 7 + 3) * 1100,
        spin: 220 + seededRandom(width + index * 7 + 4) * 520,
        drift: -60 + seededRandom(width + index * 7 + 5) * 120,
        round: index % 4 === 0,
      })),
    [width],
  );

  if (!active) {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} piece={piece} screenHeight={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
    elevation: 999,
  },
  piece: {
    position: 'absolute',
    top: 0,
  },
});
