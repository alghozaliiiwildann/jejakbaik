import React from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

interface AnimatedRunnerProps {
  reducedMotion?: boolean;
}

export default function AnimatedRunner({ reducedMotion = false }: AnimatedRunnerProps) {
  return (
    <LottieView
      source={require('../../assets/animations/jejakbaik-runner.json')}
      autoPlay={!reducedMotion}
      loop={!reducedMotion}
      style={styles.runner}
      resizeMode="contain"
      speed={1}
    />
  );
}

const styles = StyleSheet.create({
  runner: {
    width: 230,
    height: 230,
  },
});
