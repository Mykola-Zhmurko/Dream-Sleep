/**
 * Pure utility functions for sunrise simulation.
 * These are extracted from use-sunrise.ts to be easily testable without React Native dependencies.
 */

const SUNRISE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Calculates the sunrise start time: 30 minutes before the given alarm time.
 * @param alarmTimeStr "HH:MM" string
 * @returns epoch ms of the next occurrence of that alarm time minus 30 min
 */
export function calcSunriseStartTime(alarmTimeStr: string): number {
  const [hours, minutes] = alarmTimeStr.split(':').map(Number);
  const now = new Date();
  const alarm = new Date(now);
  alarm.setHours(hours, minutes, 0, 0);

  // If alarm is in the past today, schedule for tomorrow
  if (alarm.getTime() <= now.getTime()) {
    alarm.setDate(alarm.getDate() + 1);
  }

  return alarm.getTime() - SUNRISE_DURATION_MS;
}

/**
 * Calculates the auto-stop time for dream recording: 1 hour before alarm.
 */
export function calcRecordingAutoStop(alarmTimeStr: string): number {
  const [hours, minutes] = alarmTimeStr.split(':').map(Number);
  const now = new Date();
  const alarm = new Date(now);
  alarm.setHours(hours, minutes, 0, 0);
  if (alarm.getTime() <= now.getTime()) {
    alarm.setDate(alarm.getDate() + 1);
  }
  return alarm.getTime() - 60 * 60 * 1000;
}

/**
 * Linearly interpolates between two hex colors.
 * @param from hex color string e.g. "#FF4500"
 * @param to hex color string e.g. "#FFFFFF"
 * @param t 0-1 progress
 */
export function lerpColor(from: string, to: string, t: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(from);
  const [r2, g2, b2] = parse(to);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}
