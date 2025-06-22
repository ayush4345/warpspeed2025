import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface WaveformAnimationProps {
  isRecording: boolean;
}

const WaveformAnimation: React.FC<WaveformAnimationProps> = ({ isRecording }) => {
  const waveformValues = Array(30).fill(0).map(() => useRef(new Animated.Value(1)).current);

  useEffect(() => {
    if (isRecording) {
      const animations = waveformValues.map((value, index) => {
        return Animated.sequence([
          Animated.timing(value, {
            toValue: Math.random() * 1.2 + 0.5, // Random height between 0.5-1.7
            duration: 200 + Math.random() * 200, // Faster animation
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 200 + Math.random() * 200,
            useNativeDriver: true,
          }),
        ]);
      });

      const loopAnimation = Animated.stagger(40, animations);

      const loop = Animated.loop(loopAnimation);
      loop.start();

      return () => {
        loop.stop();
        waveformValues.forEach(value => {
          value.setValue(1);
        });
      };
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {waveformValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [{ scaleY: value }],
              backgroundColor: isRecording ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.3)',
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 15,
    width: 80,
    gap: 1,
  },
  bar: {
    width: 1.5,
    height: 6,
    borderRadius: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
});

export default WaveformAnimation; 