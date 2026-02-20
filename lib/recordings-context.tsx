import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { format } from 'date-fns';

export interface RecordingSegment {
  id: string;
  date: string; // YYYY-MM-DD
  filename: string;
  uri: string;
  duration: number; // seconds
  timestamp: number; // epoch ms
  amplitudeData?: number[]; // 0-1 normalized values for waveform
}

interface RecordingsContextValue {
  recordings: RecordingSegment[];
  addRecording: (segment: Omit<RecordingSegment, 'id'>) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
  refreshRecordings: () => Promise<void>;
}

const STORAGE_KEY = '@dawndream_recordings';

const RecordingsContext = createContext<RecordingsContextValue>({
  recordings: [],
  addRecording: async () => {},
  deleteRecording: async () => {},
  refreshRecordings: async () => {},
});

export function RecordingsProvider({ children }: { children: React.ReactNode }) {
  const [recordings, setRecordings] = useState<RecordingSegment[]>([]);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecordingSegment[] = JSON.parse(raw);
        setRecordings(parsed.sort((a, b) => b.timestamp - a.timestamp));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(async (list: RecordingSegment[]) => {
    setRecordings(list);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }, []);

  const addRecording = useCallback(
    async (segment: Omit<RecordingSegment, 'id'>) => {
      const id = `rec_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const newSegment: RecordingSegment = { ...segment, id };
      const next = [newSegment, ...recordings].sort((a, b) => b.timestamp - a.timestamp);
      await save(next);
    },
    [recordings, save],
  );

  const deleteRecording = useCallback(
    async (id: string) => {
      const target = recordings.find((r) => r.id === id);
      if (target) {
        try {
          const info = await FileSystem.getInfoAsync(target.uri);
          if (info.exists) {
            await FileSystem.deleteAsync(target.uri, { idempotent: true });
          }
        } catch {
          // ignore file deletion errors
        }
      }
      const next = recordings.filter((r) => r.id !== id);
      await save(next);
    },
    [recordings, save],
  );

  return (
    <RecordingsContext.Provider
      value={{ recordings, addRecording, deleteRecording, refreshRecordings: load }}
    >
      {children}
    </RecordingsContext.Provider>
  );
}

export function useRecordings() {
  return useContext(RecordingsContext);
}

export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getRecordingsDir(): string {
  return `${FileSystem.documentDirectory}recordings/`;
}

export async function ensureDateDir(date: string): Promise<string> {
  const dir = `${getRecordingsDir()}${date}/`;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  return dir;
}
