import { useCallback, useEffect, useRef, useState } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { format } from 'date-fns';
import { ensureDateDir, getTodayDateString } from './recordings-context';

export type DreamRecorderState = 'idle' | 'waiting' | 'listening' | 'recording_segment' | 'stopped';

const WAIT_BEFORE_LISTEN_MS = 30 * 60 * 1000; // 30 minutes
const THRESHOLD_DB = 40; // dB threshold for speech detection
const SILENCE_TIMEOUT_MS = 3000; // stop segment after 3s of silence
const METER_INTERVAL_MS = 500; // check meter every 500ms

interface DreamRecorderStatus {
  state: DreamRecorderState;
  waitSecondsLeft: number;
  segmentCount: number;
  currentSegmentDuration: number;
  autoStopTime: number | null;
}

interface SavedSegment {
  uri: string;
  duration: number;
  amplitudeData: number[];
  date: string;
  filename: string;
  timestamp: number;
}

interface DreamRecorderHook {
  status: DreamRecorderStatus;
  startDreamRecording: (autoStopTime?: number) => Promise<void>;
  stopDreamRecording: () => Promise<SavedSegment[]>;
  savedSegments: SavedSegment[];
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
}

export function useDreamRecorder(): DreamRecorderHook {
  const [state, setState] = useState<DreamRecorderState>('idle');
  const [waitSecondsLeft, setWaitSecondsLeft] = useState(0);
  const [segmentCount, setSegmentCount] = useState(0);
  const [currentSegmentDuration, setCurrentSegmentDuration] = useState(0);
  const [autoStopTime, setAutoStopTime] = useState<number | null>(null);
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const waitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meterIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isListeningRef = useRef(false);
  const isRecordingSegmentRef = useRef(false);
  const segmentStartTimeRef = useRef<number>(0);
  const amplitudeDataRef = useRef<number[]>([]);
  const savedSegmentsRef = useRef<SavedSegment[]>([]);
  const stateRef = useRef<DreamRecorderState>('idle');

  const updateState = useCallback((s: DreamRecorderState) => {
    stateRef.current = s;
    setState(s);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      setHasPermission(granted);
      if (granted) {
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      }
      return granted;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  const stopCurrentSegment = useCallback(async () => {
    if (!isRecordingSegmentRef.current) return;
    isRecordingSegmentRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        const duration = (Date.now() - segmentStartTimeRef.current) / 1000;
        const date = getTodayDateString();
        const dir = await ensureDateDir(date);
        const filename = `dream_${Date.now()}.m4a`;
        const destUri = `${dir}${filename}`;

        try {
          await FileSystem.moveAsync({ from: uri, to: destUri });
        } catch {
          // If move fails, keep original URI
        }

        const segment: SavedSegment = {
          uri: destUri,
          duration,
          amplitudeData: [...amplitudeDataRef.current],
          date,
          filename,
          timestamp: Date.now(),
        };

        savedSegmentsRef.current = [...savedSegmentsRef.current, segment];
        setSavedSegments([...savedSegmentsRef.current]);
        setSegmentCount((c) => c + 1);
        amplitudeDataRef.current = [];
      }
    } catch {
      // ignore recording errors
    }
  }, [audioRecorder]);

  const startSegment = useCallback(async () => {
    if (isRecordingSegmentRef.current) return;
    isRecordingSegmentRef.current = true;
    segmentStartTimeRef.current = Date.now();
    amplitudeDataRef.current = [];
    updateState('recording_segment');

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch {
      isRecordingSegmentRef.current = false;
      updateState('listening');
    }
  }, [audioRecorder, updateState]);

  const startListening = useCallback(() => {
    if (isListeningRef.current) return;
    isListeningRef.current = true;
    updateState('listening');

    meterIntervalRef.current = setInterval(async () => {
      if (!isListeningRef.current) return;

      // Check auto-stop
      if (autoStopTime && Date.now() >= autoStopTime) {
        stopDreamRecording();
        return;
      }

      // Get current metering level
      const currentState = recorderState;
      const meteringDb = currentState.metering ?? -160;

      // Normalize to 0-1 for waveform
      const normalized = Math.max(0, Math.min(1, (meteringDb + 160) / 160));

      if (isRecordingSegmentRef.current) {
        amplitudeDataRef.current.push(normalized);
        setCurrentSegmentDuration((Date.now() - segmentStartTimeRef.current) / 1000);

        if (meteringDb < THRESHOLD_DB - 160) {
          // Below threshold — start silence timer
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              stopCurrentSegment();
              updateState('listening');
            }, SILENCE_TIMEOUT_MS);
          }
        } else {
          // Above threshold — cancel silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        }
      } else {
        // Not currently recording a segment
        if (meteringDb >= THRESHOLD_DB - 160) {
          startSegment();
        }
      }
    }, METER_INTERVAL_MS);
  }, [autoStopTime, recorderState, startSegment, stopCurrentSegment, updateState]);

  const startDreamRecording = useCallback(
    async (autoStop?: number) => {
      if (stateRef.current !== 'idle' && stateRef.current !== 'stopped') return;

      const granted = await requestPermission();
      if (!granted) return;

      savedSegmentsRef.current = [];
      setSavedSegments([]);
      setSegmentCount(0);
      setAutoStopTime(autoStop ?? null);
      updateState('waiting');

      const waitSeconds = WAIT_BEFORE_LISTEN_MS / 1000;
      setWaitSecondsLeft(waitSeconds);

      // Countdown
      waitIntervalRef.current = setInterval(() => {
        setWaitSecondsLeft((s) => {
          if (s <= 1) {
            if (waitIntervalRef.current) {
              clearInterval(waitIntervalRef.current);
              waitIntervalRef.current = null;
            }
            return 0;
          }
          return s - 1;
        });
      }, 1000);

      // After 30 min, start listening
      waitTimerRef.current = setTimeout(() => {
        startListening();
      }, WAIT_BEFORE_LISTEN_MS);

      // Auto-stop timer
      if (autoStop) {
        const msUntilStop = autoStop - Date.now();
        if (msUntilStop > 0) {
          autoStopTimerRef.current = setTimeout(() => {
            stopDreamRecording();
          }, msUntilStop);
        }
      }
    },
    [requestPermission, startListening, updateState],
  );

  const stopDreamRecording = useCallback(async (): Promise<SavedSegment[]> => {
    // Clear all timers
    if (waitTimerRef.current) { clearTimeout(waitTimerRef.current); waitTimerRef.current = null; }
    if (waitIntervalRef.current) { clearInterval(waitIntervalRef.current); waitIntervalRef.current = null; }
    if (meterIntervalRef.current) { clearInterval(meterIntervalRef.current); meterIntervalRef.current = null; }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (autoStopTimerRef.current) { clearTimeout(autoStopTimerRef.current); autoStopTimerRef.current = null; }

    isListeningRef.current = false;

    if (isRecordingSegmentRef.current) {
      await stopCurrentSegment();
    }

    updateState('stopped');
    setWaitSecondsLeft(0);

    return savedSegmentsRef.current;
  }, [stopCurrentSegment, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (waitTimerRef.current) clearTimeout(waitTimerRef.current);
      if (waitIntervalRef.current) clearInterval(waitIntervalRef.current);
      if (meterIntervalRef.current) clearInterval(meterIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
    };
  }, []);

  return {
    status: {
      state,
      waitSecondsLeft,
      segmentCount,
      currentSegmentDuration,
      autoStopTime,
    },
    startDreamRecording,
    stopDreamRecording,
    savedSegments,
    hasPermission,
    requestPermission,
  };
}
