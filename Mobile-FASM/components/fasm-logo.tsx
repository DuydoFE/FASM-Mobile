import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

interface FASmLogoProps {
  width?: number;
  height?: number;
}

export function FASmLogo({ width = 100, height = 100 }: FASmLogoProps) {
  const aspectRatio = width / height;

  return (
    <View style={styles.container}>
      <Svg
        width={width}
        height={height}
        viewBox="0 0 1000 300"
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF9500" stopOpacity="1" />
            <Stop offset="50%" stopColor="#0EA5E9" stopOpacity="1" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* F */}
        <Path
          d="M 80 250 Q 60 180 100 100 Q 140 80 180 90 L 180 120 Q 140 110 120 150 L 170 150 L 170 180 L 120 180 L 120 200 L 180 200 L 180 230 L 100 230 Z"
          fill="url(#grad1)"
        />

        {/* A */}
        <Path
          d="M 250 250 L 280 80 L 350 80 L 380 250 L 340 250 L 330 200 L 300 200 L 290 250 Z M 305 170 L 325 120 L 345 170 Z"
          fill="url(#grad1)"
        />

        {/* S */}
        <Path
          d="M 430 100 Q 390 80 420 110 Q 400 130 440 140 Q 420 150 450 170 Q 430 190 460 200 Q 440 220 410 230 Q 380 240 430 250 Q 460 255 480 240 L 460 210 Q 440 220 420 220 Q 450 210 440 190 Q 460 170 420 160 Q 440 150 410 140 Q 430 130 400 120 Q 420 110 450 100 Z"
          fill="url(#grad1)"
        />

        {/* M */}
        <Path
          d="M 550 250 L 550 100 L 610 170 L 670 100 L 670 250 L 630 250 L 630 150 L 610 180 L 590 150 L 590 250 Z"
          fill="url(#grad1)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
