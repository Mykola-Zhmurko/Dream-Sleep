import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Notifications from 'expo-notifications';
import { requestRecordingPermissionsAsync } from 'expo-audio';
import Constants from 'expo-constants';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSettings, ThemeMode, Language } from '@/lib/settings-context';
import { useThemeContext } from '@/lib/theme-provider';

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { themeMode, language, alarmTime, setThemeMode, setLanguage, setAlarmTime } = useSettings();
  const { setColorScheme } = useThemeContext();

  const [showAlarmPicker, setShowAlarmPicker] = useState(false);
  const [alarmInput, setAlarmInput] = useState(alarmTime ?? '07:00');
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [notifPermission, setNotifPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');

  const handleThemeChange = useCallback(
    (mode: ThemeMode) => {
      setThemeMode(mode);
      if (mode === 'light') setColorScheme('light');
      else if (mode === 'dark') setColorScheme('dark');
      else setColorScheme('light'); // fallback for system
    },
    [setThemeMode, setColorScheme],
  );

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
    },
    [setLanguage],
  );

  const handleSaveAlarm = useCallback(() => {
    const match = alarmInput.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!match) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g. 07:30)');
      return;
    }
    setAlarmTime(alarmInput);
    setShowAlarmPicker(false);
  }, [alarmInput, setAlarmTime]);

  const requestMicPermission = useCallback(async () => {
    const { granted } = await requestRecordingPermissionsAsync();
    setMicPermission(granted ? 'granted' : 'denied');
  }, []);

  const requestNotifPermission = useCallback(async () => {
    const { granted } = await Notifications.requestPermissionsAsync();
    setNotifPermission(granted ? 'granted' : 'denied');
  }, []);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          {t('settings_title')}
        </Text>
        <IconSymbol name="gearshape.fill" size={24} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Appearance */}
        <SectionHeader title={t('settings_appearance')} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.segmentedControl}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => handleThemeChange(mode)}
                style={[
                  styles.segmentButton,
                  themeMode === mode && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    { color: themeMode === mode ? '#FFFFFF' : colors.muted },
                  ]}
                >
                  {t(`settings_theme_${mode}` as any)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Language */}
        <SectionHeader title={t('settings_language')} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {LANGUAGES.map((lang, idx) => (
            <Pressable
              key={lang.code}
              onPress={() => handleLanguageChange(lang.code)}
              style={({ pressed }) => [
                styles.listRow,
                idx < LANGUAGES.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border },
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.langFlag}>{lang.flag}</Text>
              <Text style={[styles.listRowText, { color: colors.foreground }]}>{lang.label}</Text>
              {language === lang.code && (
                <IconSymbol name="checkmark.circle.fill" size={20} color={colors.primary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Alarm */}
        <SectionHeader title={t('settings_alarm')} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable
            onPress={() => setShowAlarmPicker(true)}
            style={({ pressed }) => [styles.listRow, { opacity: pressed ? 0.7 : 1 }]}
          >
            <IconSymbol name="alarm.fill" size={20} color={colors.primary} />
            <View style={styles.listRowContent}>
              <Text style={[styles.listRowText, { color: colors.foreground }]}>
                {t('settings_alarm_time')}
              </Text>
              <Text style={[styles.listRowValue, { color: colors.muted }]}>
                {alarmTime ?? t('settings_alarm_manual')}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={16} color={colors.muted} />
          </Pressable>
        </View>

        {/* Permissions */}
        <SectionHeader title={t('settings_permissions')} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PermissionRow
            label={t('settings_permission_mic')}
            status={micPermission}
            onRequest={requestMicPermission}
            colors={colors}
            t={t}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PermissionRow
            label={t('settings_permission_notif')}
            status={notifPermission}
            onRequest={requestNotifPermission}
            colors={colors}
            t={t}
          />
        </View>

        {/* About */}
        <SectionHeader title={t('settings_about')} colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.listRowText, { color: colors.foreground }]}>DawnDream Waker</Text>
            <Text style={[styles.listRowValue, { color: colors.muted }]}>
              {t('settings_version', { version: appVersion })}
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.privacyText, { color: colors.muted }]}>
            {t('settings_privacy')}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Alarm Time Picker Modal */}
      <Modal
        visible={showAlarmPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlarmPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {t('settings_alarm_time')}
            </Text>
            <Text style={[styles.modalHint, { color: colors.muted }]}>
              Enter time in 24-hour format (HH:MM)
            </Text>
            <TextInput
              value={alarmInput}
              onChangeText={setAlarmInput}
              placeholder="07:30"
              placeholderTextColor={colors.muted}
              keyboardType="numbers-and-punctuation"
              style={[
                styles.timeInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
              maxLength={5}
              returnKeyType="done"
              onSubmitEditing={handleSaveAlarm}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowAlarmPicker(false)}
                style={[styles.modalButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.muted }]}>
                  {t('common_cancel')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleSaveAlarm}
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  {t('common_save')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.muted }]}>{title.toUpperCase()}</Text>
  );
}

function PermissionRow({
  label,
  status,
  onRequest,
  colors,
  t,
}: {
  label: string;
  status: 'granted' | 'denied' | 'unknown';
  onRequest: () => void;
  colors: any;
  t: (key: string) => string;
}) {
  return (
    <View style={styles.permissionRow}>
      <Text style={[styles.listRowText, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.permissionRight}>
        {status === 'granted' ? (
          <View style={[styles.permissionBadge, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.permissionBadgeText, { color: colors.success }]}>
              {t('settings_permission_granted')}
            </Text>
          </View>
        ) : status === 'denied' ? (
          <View style={[styles.permissionBadge, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.permissionBadgeText, { color: colors.error }]}>
              {t('settings_permission_denied')}
            </Text>
          </View>
        ) : (
          <Pressable
            onPress={onRequest}
            style={({ pressed }) => [
              styles.requestButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.requestButtonText}>{t('settings_permission_request')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  listRowContent: {
    flex: 1,
  },
  listRowText: {
    fontSize: 15,
    fontWeight: '500',
  },
  listRowValue: {
    fontSize: 13,
    marginTop: 2,
  },
  langFlag: {
    fontSize: 20,
  },
  divider: {
    height: 0.5,
    marginHorizontal: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  permissionRight: {
    alignItems: 'flex-end',
  },
  permissionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  permissionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  requestButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalHint: {
    fontSize: 13,
  },
  timeInput: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    letterSpacing: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
