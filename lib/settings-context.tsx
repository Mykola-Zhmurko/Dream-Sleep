import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from './i18n';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'de' | 'uk';

interface AppSettings {
  themeMode: ThemeMode;
  language: Language;
  alarmTime: string | null; // "HH:MM" or null
}

interface SettingsContextValue extends AppSettings {
  setThemeMode: (mode: ThemeMode) => void;
  setLanguage: (lang: Language) => void;
  setAlarmTime: (time: string | null) => void;
}

const STORAGE_KEY = '@dawndream_settings';

const defaultSettings: AppSettings = {
  themeMode: 'system',
  language: 'en',
  alarmTime: null,
};

const SettingsContext = createContext<SettingsContextValue>({
  ...defaultSettings,
  setThemeMode: () => {},
  setLanguage: () => {},
  setAlarmTime: () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed: AppSettings = JSON.parse(raw);
          setSettings(parsed);
          if (parsed.language) {
            i18n.changeLanguage(parsed.language);
          }
        } catch {
          // ignore parse errors
        }
      }
    });
  }, []);

  const save = useCallback((next: AppSettings) => {
    setSettings(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const setThemeMode = useCallback(
    (mode: ThemeMode) => save({ ...settings, themeMode: mode }),
    [settings, save],
  );

  const setLanguage = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      save({ ...settings, language: lang });
    },
    [settings, save],
  );

  const setAlarmTime = useCallback(
    (time: string | null) => save({ ...settings, alarmTime: time }),
    [settings, save],
  );

  return (
    <SettingsContext.Provider
      value={{ ...settings, setThemeMode, setLanguage, setAlarmTime }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
