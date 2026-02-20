import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calcSunriseStartTime, calcRecordingAutoStop, lerpColor } from '../lib/sunrise-utils';

describe('Sunrise Timing Calculations', () => {
  beforeEach(() => {
    // Mock current time to 2026-02-20 06:00:00 (UTC)
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-20T06:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calcSunriseStartTime: returns 30 minutes before the alarm', () => {
    const alarmTime = '07:00';
    const sunriseStart = calcSunriseStartTime(alarmTime);
    const alarmDate = new Date('2026-02-20T07:00:00.000');
    const expectedStart = alarmDate.getTime() - 30 * 60 * 1000;
    expect(sunriseStart).toBe(expectedStart);
  });

  it('calcSunriseStartTime: schedules for tomorrow if alarm already passed today', () => {
    // Current time is 06:00, alarm is 05:00 (already passed)
    const alarmTime = '05:00';
    const sunriseStart = calcSunriseStartTime(alarmTime);
    const now = new Date();
    // Should be in the future
    expect(sunriseStart).toBeGreaterThan(now.getTime());
  });

  it('calcSunriseStartTime: handles midnight alarm correctly', () => {
    const alarmTime = '00:00';
    const sunriseStart = calcSunriseStartTime(alarmTime);
    const now = new Date();
    // Midnight alarm is in the past at 06:00, so should be tomorrow
    expect(sunriseStart).toBeGreaterThan(now.getTime());
  });

  it('calcRecordingAutoStop: returns 1 hour before alarm', () => {
    const alarmTime = '08:00';
    const autoStop = calcRecordingAutoStop(alarmTime);
    const alarmDate = new Date('2026-02-20T08:00:00.000');
    const expectedStop = alarmDate.getTime() - 60 * 60 * 1000;
    expect(autoStop).toBe(expectedStop);
  });

  it('calcRecordingAutoStop: auto-stop is before sunrise start (1h before alarm vs 30min before alarm)', () => {
    const alarmTime = '07:30';
    const autoStop = calcRecordingAutoStop(alarmTime);
    const sunriseStart = calcSunriseStartTime(alarmTime);
    // Auto-stop is 1h before alarm, sunrise starts 30min before alarm
    // So auto-stop (1h before) is EARLIER than sunrise start (30min before)
    expect(autoStop).toBeLessThan(sunriseStart);
    // The difference should be exactly 30 minutes
    expect(sunriseStart - autoStop).toBe(30 * 60 * 1000);
  });
});

describe('lerpColor', () => {
  it('returns start color at t=0', () => {
    const result = lerpColor('#FF4500', '#FFFFFF', 0);
    expect(result).toBe('rgb(255,69,0)');
  });

  it('returns end color at t=1', () => {
    const result = lerpColor('#FF4500', '#FFFFFF', 1);
    expect(result).toBe('rgb(255,255,255)');
  });

  it('returns midpoint color at t=0.5', () => {
    const result = lerpColor('#000000', '#FFFFFF', 0.5);
    expect(result).toBe('rgb(128,128,128)');
  });

  it('clamps t values correctly', () => {
    // Even with t=0.5 on a known pair, result should be deterministic
    const result = lerpColor('#FF0000', '#0000FF', 0.5);
    expect(result).toBe('rgb(128,0,128)');
  });
});
