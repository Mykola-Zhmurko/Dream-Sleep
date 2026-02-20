import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock expo-localization before importing i18n
vi.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', regionCode: 'US' }],
}));

import i18n from '../lib/i18n';

describe('i18n Language Switching', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('defaults to English translations', () => {
    expect(i18n.t('nav_home')).toBe('Home');
    expect(i18n.t('nav_recordings')).toBe('Recordings');
    expect(i18n.t('nav_tips')).toBe('Sleep Tips');
    expect(i18n.t('nav_settings')).toBe('Settings');
  });

  it('switches to German correctly', async () => {
    await i18n.changeLanguage('de');
    expect(i18n.t('nav_home')).toBe('Start');
    expect(i18n.t('nav_recordings')).toBe('Aufnahmen');
    expect(i18n.t('nav_tips')).toBe('Schlaf-Tipps');
    expect(i18n.t('nav_settings')).toBe('Einstellungen');
  });

  it('switches to Ukrainian correctly', async () => {
    await i18n.changeLanguage('uk');
    expect(i18n.t('nav_home')).toBe('Головна');
    expect(i18n.t('nav_recordings')).toBe('Записи');
    expect(i18n.t('nav_tips')).toBe('Поради');
    expect(i18n.t('nav_settings')).toBe('Налаштування');
  });

  it('falls back to English for unsupported language', async () => {
    await i18n.changeLanguage('fr');
    // Should fall back to English
    expect(i18n.t('nav_home')).toBe('Home');
  });

  it('interpolates variables correctly', async () => {
    await i18n.changeLanguage('en');
    const result = i18n.t('home_sunrise_progress', { percent: 75 });
    expect(result).toBe('Brightness: 75%');
  });

  it('interpolates German variables correctly', async () => {
    await i18n.changeLanguage('de');
    const result = i18n.t('settings_version', { version: '1.0.0' });
    expect(result).toBe('Version 1.0.0');
  });

  it('has all required keys in all languages', async () => {
    const requiredKeys = [
      'nav_home', 'nav_recordings', 'nav_tips', 'nav_settings',
      'home_title', 'home_start_recording', 'home_stop_recording',
      'recordings_title', 'recordings_empty',
      'tips_title', 'settings_title',
    ];

    for (const lang of ['en', 'de', 'uk']) {
      await i18n.changeLanguage(lang);
      for (const key of requiredKeys) {
        const value = i18n.t(key);
        expect(value, `Key "${key}" missing in language "${lang}"`).not.toBe(key);
        expect(value.length, `Key "${key}" is empty in language "${lang}"`).toBeGreaterThan(0);
      }
    }
  });
});
