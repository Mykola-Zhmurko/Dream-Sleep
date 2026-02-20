import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useColors } from '@/hooks/use-colors';

interface WaveformViewProps {
  amplitudeData?: number[]; // values 0-1
  width?: number;
  height?: number;
  barCount?: number;
  color?: string;
  activeColor?: string;
  progress?: number; // 0-1 playback progress
}

export function WaveformView({
  amplitudeData,
  width = 200,
  height = 40,
  barCount = 40,
  color,
  activeColor,
  progress = 0,
}: WaveformViewProps) {
  const colors = useColors();
  const barColor = color ?? colors.muted;
  const playedColor = activeColor ?? colors.primary;

  const bars = useMemo(() => {
    if (!amplitudeData || amplitudeData.length === 0) {
      // Generate a default waveform shape if no data
      return Array.from({ length: barCount }, (_, i) => {
        const x = i / barCount;
        // Bell-curve-like shape with deterministic variation
        const amp = 0.15 + 0.5 * Math.exp(-Math.pow((x - 0.5) * 4, 2));
        const pseudoRandom = Math.sin(i * 127.1 + 311.7) * 0.5 + 0.5; // 0-1 deterministic
        return amp + (pseudoRandom * 0.1 - 0.05);
      });
    }

    // Downsample or upsample to barCount
    const result: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const srcIdx = (i / barCount) * amplitudeData.length;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(Math.ceil(srcIdx), amplitudeData.length - 1);
      const t = srcIdx - lo;
      const val = amplitudeData[lo] * (1 - t) + (amplitudeData[hi] ?? amplitudeData[lo]) * t;
      result.push(Math.max(0.05, Math.min(1, val)));
    }
    return result;
  }, [amplitudeData, barCount]);

  const barWidth = (width / barCount) * 0.6;
  const gap = (width / barCount) * 0.4;
  const minBarHeight = 3;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {bars.map((amp, i) => {
          const barH = Math.max(minBarHeight, amp * height);
          const x = i * (barWidth + gap);
          const y = (height - barH) / 2;
          const isPlayed = i / barCount < progress;
          return (
            <Rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barWidth / 2}
              fill={isPlayed ? playedColor : barColor}
              opacity={isPlayed ? 1 : 0.6}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
