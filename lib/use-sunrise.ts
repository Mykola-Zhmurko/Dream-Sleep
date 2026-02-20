import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Brightness from 'expo-brightness';
import { useKeepAwake } from 'expo-keep-awake';
import { calcSunriseStartTime, lerpColor } from './sunrise-utils';

export { calcSunriseStartTime, calcRecordingAutoStop, lerpColor } from './sunrise-utils';

export type SunriseState = 'idle' | 'waiting' | 'active' | 'done';

const SUNRISE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface SunriseStatus {
  state: SunriseState;
  progress: number; // 0-1
  minutesUntilStart: number | null;
  startTime: number | null;
  endTime: number | null;
}

export function useSunrise(alarmTime: string | null) {
  const [status, setStatus] = useState<SunriseStatus>({
    state: 'idle',
    progress: 0,
    minutesUntilStart: null,
    startTime: null,
    endTime: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalBrightnessRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  // Keep screen awake during active sunrise
  useKeepAwake(isActiveRef.current ? 'sunrise' : undefined);

  const stopSunrise = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isActiveRef.current = false;
    // Restore original brightness
    if (Platform.OS !== 'web' && originalBrightnessRef.current !== null) {
      try {
        await Brightness.setBrightnessAsync(originalBrightnessRef.current);
      } catch {
        // ignore
      }
      originalBrightnessRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!alarmTime) {
      setStatus({ state: 'idle', progress: 0, minutesUntilStart: null, startTime: null, endTime: null });
      return;
    }

    const startTime = calcSunriseStartTime(alarmTime);
    const endTime = startTime + SUNRISE_DURATION_MS;

    const tick = async () => {
      const now = Date.now();

      if (now < startTime) {
        const minsLeft = Math.ceil((startTime - now) / 60000);
        setStatus({ state: 'waiting', progress: 0, minutesUntilStart: minsLeft, startTime, endTime });
        return;
      }

      if (now >= startTime && now < endTime) {
        const progress = Math.min((now - startTime) / SUNRISE_DURATION_MS, 1);

        if (!isActiveRef.current) {
          isActiveRef.current = true;
          // Save original brightness
          if (Platform.OS !== 'web') {
            try {
              const { status: permStatus } = await Brightness.requestPermissionsAsync();
              if (permStatus === 'granted') {
                originalBrightnessRef.current = await Brightness.getBrightnessAsync();
              }
            } catch {
              // ignore
            }
          }
        }

        // Set brightness
        if (Platform.OS !== 'web') {
          try {
            await Brightness.setBrightnessAsync(progress);
          } catch {
            // ignore
          }
        }

        setStatus({ state: 'active', progress, minutesUntilStart: 0, startTime, endTime });
        return;
      }

      // Done
      if (now >= endTime) {
        if (Platform.OS !== 'web') {
          try {
            await Brightness.setBrightnessAsync(1);
          } catch {
            // ignore
          }
        }
        isActiveRef.current = false;
        setStatus({ state: 'done', progress: 1, minutesUntilStart: null, startTime, endTime });
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    tick();
    intervalRef.current = setInterval(tick, 10000); // update every 10 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [alarmTime]);

  return { status, stopSunrise };
}
