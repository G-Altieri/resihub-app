'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number;
  min: number;
  max: number;
  centerText?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  size,
  strokeWidth,
  progress,
  min,
  max,
  centerText,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = max - min !== 0 ? (progress - min) / (max - min) : 0;
  const progressNormalized = Math.max(0, Math.min(1, normalized));
  const strokeDashoffset = circumference - progressNormalized * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke="#3E4C59"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke="#BAFF29"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={StyleSheet.absoluteFill}>
        <Text style={styles.progressText}>
          {centerText ? centerText : `${Math.round(progressNormalized * 100)}%`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressText: {
    fontSize: 18,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProgressRing;
