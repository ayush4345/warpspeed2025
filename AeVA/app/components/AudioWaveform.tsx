import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface AudioWaveformProps {
  isPlaying: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isPlaying }) => {
  const waveformValues = Array(15).fill(0).map(() => useRef(new Animated.Value(1)).current);

  useEffect(() => {
    if (isPlaying) {
      const animations = waveformValues.map((value, index) => {
        return Animated.sequence([
          Animated.timing(value, {
            toValue: Math.random() * 1.5 + 0.5, // Random height between 0.5-2
            duration: 300 + Math.random() * 300, // Slower animation for audio visualization
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 300 + Math.random() * 300,
            useNativeDriver: true,
          }),
        ]);
      });

      const loopAnimation = Animated.stagger(50, animations);
      const loop = Animated.loop(loopAnimation);
      loop.start();

      return () => {
        loop.stop();
        waveformValues.forEach(value => {
          value.setValue(1);
        });
      };
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      {waveformValues.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              transform: [{ scaleY: value }],
              backgroundColor: isPlaying ? '#007AFF' : 'rgba(0, 122, 255, 0.3)',
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
    height: 20,
    width: 60,
    gap: 2,
  },
  bar: {
    width: 2,
    height: 12,
    borderRadius: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.3)',
  },
});

export default AudioWaveform; 