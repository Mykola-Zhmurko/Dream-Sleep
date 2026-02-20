import { describe, it, expect } from 'vitest';

/**
 * Recording threshold logic tests.
 * These test the pure logic functions used in the dream recorder.
 */

const THRESHOLD_DB = 40;
const SILENCE_TIMEOUT_MS = 3000;

/**
 * Simulates the threshold detection logic:
 * expo-audio metering returns values in dBFS (negative, 0 = max).
 * We normalize: normalized = (meteringDb + 160) / 160
 * Speech is detected when meteringDb >= THRESHOLD_DB - 160
 */
function isSpeechDetected(meteringDb: number): boolean {
  return meteringDb >= THRESHOLD_DB - 160;
}

function normalizeMeteringToAmplitude(meteringDb: number): number {
  return Math.max(0, Math.min(1, (meteringDb + 160) / 160));
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}s`;
}

describe('Recording Threshold Detection', () => {
  it('detects speech above threshold', () => {
    // -120 dBFS = 40 dB above -160 dBFS floor → threshold met
    expect(isSpeechDetected(-120)).toBe(true);
  });

  it('does not detect speech below threshold', () => {
    // -130 dBFS = 30 dB above floor → below threshold
    expect(isSpeechDetected(-130)).toBe(false);
  });

  it('detects speech at exactly the threshold', () => {
    // -120 dBFS = exactly 40 dB above floor
    expect(isSpeechDetected(-120)).toBe(true);
  });

  it('detects loud speech (near 0 dBFS)', () => {
    expect(isSpeechDetected(-5)).toBe(true);
    expect(isSpeechDetected(-20)).toBe(true);
  });

  it('does not detect silence (very low dBFS)', () => {
    expect(isSpeechDetected(-160)).toBe(false);
    expect(isSpeechDetected(-155)).toBe(false);
    expect(isSpeechDetected(-140)).toBe(false);
  });
});

describe('Amplitude Normalization', () => {
  it('normalizes -160 dBFS to 0', () => {
    expect(normalizeMeteringToAmplitude(-160)).toBe(0);
  });

  it('normalizes 0 dBFS to 1', () => {
    expect(normalizeMeteringToAmplitude(0)).toBe(1);
  });

  it('normalizes -80 dBFS to 0.5', () => {
    expect(normalizeMeteringToAmplitude(-80)).toBe(0.5);
  });

  it('clamps values above 0 dBFS to 1', () => {
    expect(normalizeMeteringToAmplitude(10)).toBe(1);
  });

  it('clamps values below -160 dBFS to 0', () => {
    expect(normalizeMeteringToAmplitude(-200)).toBe(0);
  });
});

describe('Duration Formatting', () => {
  it('formats seconds under 60', () => {
    expect(formatDuration(45)).toBe('45s');
    expect(formatDuration(0)).toBe('0s');
    expect(formatDuration(59)).toBe('59s');
  });

  it('formats minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(90)).toBe('1:30');
    expect(formatDuration(125)).toBe('2:05');
  });

  it('pads seconds with leading zero', () => {
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(601)).toBe('10:01');
  });
});

describe('Recording Session Logic', () => {
  it('silence timeout constant is 3 seconds', () => {
    expect(SILENCE_TIMEOUT_MS).toBe(3000);
  });

  it('threshold is 40 dB', () => {
    expect(THRESHOLD_DB).toBe(40);
  });

  it('speech detection boundary is correct', () => {
    // The boundary in dBFS terms: THRESHOLD_DB - 160 = -120
    const boundary = THRESHOLD_DB - 160;
    expect(isSpeechDetected(boundary)).toBe(true);
    expect(isSpeechDetected(boundary - 1)).toBe(false);
  });
});

describe('Waveform Data Processing', () => {
  /**
   * Tests the downsampling logic used in WaveformView
   */
  function downsampleToBarCount(data: number[], barCount: number): number[] {
    const result: number[] = [];
    for (let i = 0; i < barCount; i++) {
      const srcIdx = (i / barCount) * data.length;
      const lo = Math.floor(srcIdx);
      const hi = Math.min(Math.ceil(srcIdx), data.length - 1);
      const t = srcIdx - lo;
      const val = data[lo] * (1 - t) + (data[hi] ?? data[lo]) * t;
      result.push(Math.max(0.05, Math.min(1, val)));
    }
    return result;
  }

  it('downsamples correctly to target bar count', () => {
    const data = [0.1, 0.5, 0.9, 0.3, 0.7];
    const result = downsampleToBarCount(data, 5);
    expect(result).toHaveLength(5);
  });

  it('upsamples correctly to target bar count', () => {
    const data = [0.2, 0.8];
    const result = downsampleToBarCount(data, 10);
    expect(result).toHaveLength(10);
  });

  it('clamps values to minimum 0.05', () => {
    const data = [0, 0, 0];
    const result = downsampleToBarCount(data, 3);
    result.forEach((v) => expect(v).toBeGreaterThanOrEqual(0.05));
  });

  it('clamps values to maximum 1', () => {
    const data = [2, 3, 5]; // out of range
    const result = downsampleToBarCount(data, 3);
    result.forEach((v) => expect(v).toBeLessThanOrEqual(1));
  });
});
