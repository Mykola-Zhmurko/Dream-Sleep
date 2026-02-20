import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    translation: {
      // Navigation
      nav_home: 'Home',
      nav_recordings: 'Recordings',
      nav_tips: 'Sleep Tips',
      nav_settings: 'Settings',

      // Home Screen
      home_title: 'DawnDream Waker',
      home_next_alarm: 'Next Alarm',
      home_no_alarm: 'No alarm set',
      home_sunrise_in: 'Sunrise simulation in',
      home_sunrise_active: 'Sunrise simulation active',
      home_sunrise_done: 'Sunrise complete',
      home_sunrise_progress: 'Brightness: {{percent}}%',
      home_start_recording: 'Start Dream Recording',
      home_stop_recording: 'Stop Recording',
      home_recording_waiting: 'Waiting {{minutes}} min…',
      home_recording_active: 'Recording dreams…',
      home_recording_auto_stop: 'Auto-stop at {{time}}',
      home_alarm_set_manually: 'Alarm set manually',
      home_tap_to_set_alarm: 'Tap to set alarm time',

      // Recordings Screen
      recordings_title: 'Dream Recordings',
      recordings_empty: 'No recordings yet.\nStart your first dream recording tonight.',
      recordings_delete: 'Delete',
      recordings_play: 'Play',
      recordings_pause: 'Pause',
      recordings_duration: '{{duration}}',
      recordings_segment: 'Segment {{n}}',

      // Sleep Tips Screen
      tips_title: 'Sleep Tips',
      tips_watch_video: 'Watch Video',
      tip1_title: 'Keep a Consistent Sleep Schedule',
      tip1_body: 'Going to bed and waking up at the same time every day — even on weekends — helps regulate your body\'s internal clock and improves sleep quality.',
      tip1_source: 'Source: CDC, Harvard Health',
      tip2_title: 'Avoid Caffeine After Noon',
      tip2_body: 'Caffeine can stay in your system for 6–8 hours. Avoid coffee, tea, and energy drinks in the afternoon to prevent sleep disruption.',
      tip2_source: 'Source: Mayo Clinic',
      tip3_title: 'Exercise Regularly',
      tip3_body: 'Regular physical activity helps you fall asleep faster and enjoy deeper sleep — but avoid vigorous exercise within 2–3 hours of bedtime.',
      tip3_source: 'Source: UC Davis Health',
      tip4_title: 'Keep Your Bedroom Cool, Dark & Quiet',
      tip4_body: 'The ideal sleep temperature is 60–67°F (15–19°C). Use blackout curtains and white noise if needed to create an optimal sleep environment.',
      tip4_source: 'Source: Sleep Foundation',
      tip5_title: 'Avoid Screens Before Bed',
      tip5_body: 'Blue light from phones and tablets suppresses melatonin production. Put devices away at least 1 hour before bed for better sleep.',
      tip5_source: 'Source: Johns Hopkins Medicine',

      // Settings Screen
      settings_title: 'Settings',
      settings_appearance: 'Appearance',
      settings_theme_light: 'Light',
      settings_theme_dark: 'Dark',
      settings_theme_system: 'System',
      settings_language: 'Language',
      settings_alarm: 'Alarm',
      settings_alarm_time: 'Alarm Time',
      settings_alarm_manual: 'Set manually',
      settings_permissions: 'Permissions',
      settings_permission_mic: 'Microphone',
      settings_permission_notif: 'Notifications',
      settings_permission_granted: 'Granted',
      settings_permission_denied: 'Denied',
      settings_permission_request: 'Request',
      settings_about: 'About',
      settings_version: 'Version {{version}}',
      settings_privacy: 'All data stays on your device. Nothing is uploaded.',

      // Common
      common_cancel: 'Cancel',
      common_ok: 'OK',
      common_save: 'Save',
      common_delete: 'Delete',
      common_minutes: '{{count}} min',
      common_hours: '{{count}} h',
      common_seconds: '{{count}} s',
    },
  },
  de: {
    translation: {
      // Navigation
      nav_home: 'Start',
      nav_recordings: 'Aufnahmen',
      nav_tips: 'Schlaf-Tipps',
      nav_settings: 'Einstellungen',

      // Home Screen
      home_title: 'DawnDream Waker',
      home_next_alarm: 'Nächster Alarm',
      home_no_alarm: 'Kein Alarm gesetzt',
      home_sunrise_in: 'Sonnenaufgang-Simulation in',
      home_sunrise_active: 'Sonnenaufgang-Simulation aktiv',
      home_sunrise_done: 'Sonnenaufgang abgeschlossen',
      home_sunrise_progress: 'Helligkeit: {{percent}}%',
      home_start_recording: 'Traumaufnahme starten',
      home_stop_recording: 'Aufnahme stoppen',
      home_recording_waiting: 'Warte {{minutes}} Min…',
      home_recording_active: 'Träume werden aufgenommen…',
      home_recording_auto_stop: 'Automatischer Stopp um {{time}}',
      home_alarm_set_manually: 'Alarm manuell gesetzt',
      home_tap_to_set_alarm: 'Tippen zum Alarm setzen',

      // Recordings Screen
      recordings_title: 'Traumaufnahmen',
      recordings_empty: 'Noch keine Aufnahmen.\nStarte heute Nacht deine erste Traumaufnahme.',
      recordings_delete: 'Löschen',
      recordings_play: 'Abspielen',
      recordings_pause: 'Pause',
      recordings_duration: '{{duration}}',
      recordings_segment: 'Segment {{n}}',

      // Sleep Tips Screen
      tips_title: 'Schlaf-Tipps',
      tips_watch_video: 'Video ansehen',
      tip1_title: 'Regelmäßiger Schlafrhythmus',
      tip1_body: 'Jeden Tag zur gleichen Zeit ins Bett gehen und aufstehen – auch am Wochenende – reguliert die innere Uhr und verbessert die Schlafqualität.',
      tip1_source: 'Quelle: CDC, Harvard Health',
      tip2_title: 'Kein Koffein nach dem Mittag',
      tip2_body: 'Koffein bleibt 6–8 Stunden im Körper. Verzichte nachmittags auf Kaffee, Tee und Energy-Drinks, um den Schlaf nicht zu stören.',
      tip2_source: 'Quelle: Mayo Clinic',
      tip3_title: 'Regelmäßige Bewegung',
      tip3_body: 'Regelmäßige körperliche Aktivität hilft, schneller einzuschlafen und tiefer zu schlafen – aber vermeide intensiven Sport 2–3 Stunden vor dem Schlafengehen.',
      tip3_source: 'Quelle: UC Davis Health',
      tip4_title: 'Schlafzimmer kühl, dunkel und ruhig halten',
      tip4_body: 'Die ideale Schlaftemperatur liegt bei 15–19°C. Verdunkelungsvorhänge und weißes Rauschen helfen, eine optimale Schlafumgebung zu schaffen.',
      tip4_source: 'Quelle: Sleep Foundation',
      tip5_title: 'Keine Bildschirme vor dem Schlafen',
      tip5_body: 'Blaues Licht von Smartphones und Tablets hemmt die Melatoninproduktion. Lege Geräte mindestens 1 Stunde vor dem Schlafengehen weg.',
      tip5_source: 'Quelle: Johns Hopkins Medicine',

      // Settings Screen
      settings_title: 'Einstellungen',
      settings_appearance: 'Erscheinungsbild',
      settings_theme_light: 'Hell',
      settings_theme_dark: 'Dunkel',
      settings_theme_system: 'System',
      settings_language: 'Sprache',
      settings_alarm: 'Alarm',
      settings_alarm_time: 'Alarmzeit',
      settings_alarm_manual: 'Manuell setzen',
      settings_permissions: 'Berechtigungen',
      settings_permission_mic: 'Mikrofon',
      settings_permission_notif: 'Benachrichtigungen',
      settings_permission_granted: 'Erteilt',
      settings_permission_denied: 'Verweigert',
      settings_permission_request: 'Anfragen',
      settings_about: 'Über die App',
      settings_version: 'Version {{version}}',
      settings_privacy: 'Alle Daten bleiben auf deinem Gerät. Es wird nichts hochgeladen.',

      // Common
      common_cancel: 'Abbrechen',
      common_ok: 'OK',
      common_save: 'Speichern',
      common_delete: 'Löschen',
      common_minutes: '{{count}} Min',
      common_hours: '{{count}} Std',
      common_seconds: '{{count}} Sek',
    },
  },
  uk: {
    translation: {
      // Navigation
      nav_home: 'Головна',
      nav_recordings: 'Записи',
      nav_tips: 'Поради',
      nav_settings: 'Налаштування',

      // Home Screen
      home_title: 'DawnDream Waker',
      home_next_alarm: 'Наступний будильник',
      home_no_alarm: 'Будильник не встановлено',
      home_sunrise_in: 'Симуляція світанку через',
      home_sunrise_active: 'Симуляція світанку активна',
      home_sunrise_done: 'Світанок завершено',
      home_sunrise_progress: 'Яскравість: {{percent}}%',
      home_start_recording: 'Почати запис снів',
      home_stop_recording: 'Зупинити запис',
      home_recording_waiting: 'Очікування {{minutes}} хв…',
      home_recording_active: 'Запис снів…',
      home_recording_auto_stop: 'Автозупинка о {{time}}',
      home_alarm_set_manually: 'Будильник встановлено вручну',
      home_tap_to_set_alarm: 'Натисніть, щоб встановити час',

      // Recordings Screen
      recordings_title: 'Записи снів',
      recordings_empty: 'Записів ще немає.\nПочніть перший запис снів сьогодні вночі.',
      recordings_delete: 'Видалити',
      recordings_play: 'Відтворити',
      recordings_pause: 'Пауза',
      recordings_duration: '{{duration}}',
      recordings_segment: 'Сегмент {{n}}',

      // Sleep Tips Screen
      tips_title: 'Поради для сну',
      tips_watch_video: 'Переглянути відео',
      tip1_title: 'Регулярний режим сну',
      tip1_body: 'Лягати спати і прокидатися щодня в один і той самий час — навіть у вихідні — допомагає регулювати внутрішній годинник і покращує якість сну.',
      tip1_source: 'Джерело: CDC, Harvard Health',
      tip2_title: 'Уникайте кофеїну після полудня',
      tip2_body: 'Кофеїн залишається в організмі 6–8 годин. Уникайте кави, чаю та енергетиків у другій половині дня, щоб не порушувати сон.',
      tip2_source: 'Джерело: Mayo Clinic',
      tip3_title: 'Регулярні фізичні вправи',
      tip3_body: 'Регулярна фізична активність допомагає швидше засинати і спати глибше — але уникайте інтенсивних тренувань за 2–3 години до сну.',
      tip3_source: 'Джерело: UC Davis Health',
      tip4_title: 'Прохолодна, темна і тиха спальня',
      tip4_body: 'Ідеальна температура для сну — 15–19°C. Використовуйте штори та білий шум для оптимального середовища сну.',
      tip4_source: 'Джерело: Sleep Foundation',
      tip5_title: 'Без екранів перед сном',
      tip5_body: 'Синє світло від телефонів і планшетів пригнічує вироблення мелатоніну. Відкладіть пристрої щонайменше за 1 годину до сну.',
      tip5_source: 'Джерело: Johns Hopkins Medicine',

      // Settings Screen
      settings_title: 'Налаштування',
      settings_appearance: 'Зовнішній вигляд',
      settings_theme_light: 'Світла',
      settings_theme_dark: 'Темна',
      settings_theme_system: 'Системна',
      settings_language: 'Мова',
      settings_alarm: 'Будильник',
      settings_alarm_time: 'Час будильника',
      settings_alarm_manual: 'Встановити вручну',
      settings_permissions: 'Дозволи',
      settings_permission_mic: 'Мікрофон',
      settings_permission_notif: 'Сповіщення',
      settings_permission_granted: 'Надано',
      settings_permission_denied: 'Відхилено',
      settings_permission_request: 'Запросити',
      settings_about: 'Про застосунок',
      settings_version: 'Версія {{version}}',
      settings_privacy: 'Усі дані зберігаються на вашому пристрої. Нічого не завантажується.',

      // Common
      common_cancel: 'Скасувати',
      common_ok: 'OK',
      common_save: 'Зберегти',
      common_delete: 'Видалити',
      common_minutes: '{{count}} хв',
      common_hours: '{{count}} год',
      common_seconds: '{{count}} с',
    },
  },
};

const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? 'en';
const supportedLanguages = ['en', 'de', 'uk'];
const defaultLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
export { supportedLanguages };
