import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSettings } from '@/lib/settings-context';
import { useRecordings } from '@/lib/recordings-context';
import { useSunrise, lerpColor, calcRecordingAutoStop } from '@/lib/use-sunrise';
import { useDreamRecorder } from '@/lib/use-dream-recorder';

export default function HomeScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { alarmTime } = useSettings();
  const { addRecording } = useRecordings();

  const { status: sunriseStatus } = useSunrise(alarmTime);
  const {
    status: recorderStatus,
    startDreamRecording,
    stopDreamRecording,
    savedSegments,
    hasPermission,
    requestPermission,
  } = useDreamRecorder();

  // Pulsing animation for recording button
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (recorderStatus.state === 'listening' || recorderStatus.state === 'recording_segment') {
      pulseRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulseRef.current.start();
    } else {
      if (pulseRef.current) {
        pulseRef.current.stop();
        pulseRef.current = null;
      }
      pulseAnim.setValue(1);
    }
  }, [recorderStatus.state, pulseAnim]);

  // Save segments when recording stops
  const prevSegmentsLength = useRef(0);
  useEffect(() => {
    if (savedSegments.length > prevSegmentsLength.current) {
      const newSegments = savedSegments.slice(prevSegmentsLength.current);
      newSegments.forEach((seg) => {
        addRecording({
          date: seg.date,
          filename: seg.filename,
          uri: seg.uri,
          duration: seg.duration,
          timestamp: seg.timestamp,
          amplitudeData: seg.amplitudeData,
        });
      });
      prevSegmentsLength.current = savedSegments.length;
    }
  }, [savedSegments, addRecording]);

  const handleRecordingButton = useCallback(async () => {
    if (recorderStatus.state === 'idle' || recorderStatus.state === 'stopped') {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Microphone Permission',
            'DawnDream Waker needs microphone access to record your dreams. Please enable it in Settings.',
          );
          return;
        }
      }
      const autoStop = alarmTime ? calcRecordingAutoStop(alarmTime) : undefined;
      await startDreamRecording(autoStop);
    } else {
      await stopDreamRecording();
    }
  }, [
    recorderStatus.state,
    hasPermission,
    requestPermission,
    alarmTime,
    startDreamRecording,
    stopDreamRecording,
  ]);

  // Sunrise background color
  const sunriseBgColor =
    sunriseStatus.state === 'active'
      ? lerpColor('#FF4500', '#FFFFFF', sunriseStatus.progress)
      : sunriseStatus.state === 'done'
      ? '#FFFFFF'
      : 'transparent';

  const isRecordingActive =
    recorderStatus.state === 'listening' || recorderStatus.state === 'recording_segment';
  const isWaiting = recorderStatus.state === 'waiting';
  const isStopped = recorderStatus.state === 'stopped';

  const formatWaitTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
    return `${s}s`;
  };

  const getRecordButtonLabel = () => {
    if (isWaiting) return t('home_recording_waiting', { minutes: Math.ceil(recorderStatus.waitSecondsLeft / 60) });
    if (isRecordingActive) return t('home_stop_recording');
    if (isStopped) return t('home_start_recording');
    return t('home_start_recording');
  };

  const getRecordButtonColor = (): [string, string] => {
    if (isRecordingActive) return [colors.recording, '#FF0000'];
    if (isWaiting) return [colors.warning, '#F59E0B'];
    return [colors.primary, '#FF8C42'];
  };

  return (
    <ScreenContainer containerClassName="flex-1">
      {/* Sunrise overlay */}
      {sunriseStatus.state === 'active' && (
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: sunriseBgColor, opacity: 0.3, zIndex: 0 },
          ]}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: colors.foreground }]}>
            {t('home_title')}
          </Text>
          <IconSymbol name="sun.max.fill" size={28} color={colors.primary} />
        </View>

        {/* Alarm Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardRow}>
            <IconSymbol name="alarm.fill" size={20} color={colors.primary} />
            <Text style={[styles.cardLabel, { color: colors.muted }]}>
              {t('home_next_alarm')}
            </Text>
          </View>
          <Text style={[styles.alarmTime, { color: colors.foreground }]}>
            {alarmTime ?? t('home_no_alarm')}
          </Text>

          {/* Sunrise status */}
          {alarmTime && (
            <View style={styles.sunriseSection}>
              {sunriseStatus.state === 'waiting' && sunriseStatus.minutesUntilStart !== null && (
                <View style={styles.sunriseRow}>
                  <IconSymbol name="sun.max.fill" size={16} color={colors.warning} />
                  <Text style={[styles.sunriseText, { color: colors.muted }]}>
                    {t('home_sunrise_in')}{' '}
                    <Text style={{ color: colors.warning, fontWeight: '600' }}>
                      {sunriseStatus.minutesUntilStart} min
                    </Text>
                  </Text>
                </View>
              )}
              {sunriseStatus.state === 'active' && (
                <>
                  <View style={styles.sunriseRow}>
                    <IconSymbol name="sun.max.fill" size={16} color={colors.primary} />
                    <Text style={[styles.sunriseText, { color: colors.primary, fontWeight: '600' }]}>
                      {t('home_sunrise_active')}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={['#FF4500', '#FFD700', '#FFFFFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${sunriseStatus.progress * 100}%` }]}
                    />
                  </View>
                  <Text style={[styles.progressLabel, { color: colors.muted }]}>
                    {t('home_sunrise_progress', { percent: Math.round(sunriseStatus.progress * 100) })}
                  </Text>
                </>
              )}
              {sunriseStatus.state === 'done' && (
                <View style={styles.sunriseRow}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
                  <Text style={[styles.sunriseText, { color: colors.success }]}>
                    {t('home_sunrise_done')}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Dream Recording Section */}
        <View style={styles.recordingSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Dream Recording
          </Text>

          {/* Recording status */}
          {isRecordingActive && (
            <View style={[styles.statusBadge, { backgroundColor: colors.recording + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.recording }]} />
              <Text style={[styles.statusText, { color: colors.recording }]}>
                {t('home_recording_active')} · {recorderStatus.segmentCount} segments
              </Text>
            </View>
          )}
          {isWaiting && (
            <View style={[styles.statusBadge, { backgroundColor: colors.warning + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.statusText, { color: colors.warning }]}>
                {t('home_recording_waiting', { minutes: Math.ceil(recorderStatus.waitSecondsLeft / 60) })}
                {' '}({formatWaitTime(recorderStatus.waitSecondsLeft)})
              </Text>
            </View>
          )}
          {isStopped && recorderStatus.segmentCount > 0 && (
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
              <Text style={[styles.statusText, { color: colors.success }]}>
                {recorderStatus.segmentCount} dream segments saved
              </Text>
            </View>
          )}

          {/* Auto-stop info */}
          {(isWaiting || isRecordingActive) && recorderStatus.autoStopTime && (
            <Text style={[styles.autoStopText, { color: colors.muted }]}>
              {t('home_recording_auto_stop', {
                time: format(new Date(recorderStatus.autoStopTime), 'HH:mm'),
              })}
            </Text>
          )}

          {/* Big Recording Button */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              onPress={handleRecordingButton}
              disabled={isWaiting}
              style={({ pressed }) => [
                styles.recordButton,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
              ]}
            >
              <LinearGradient
                colors={getRecordButtonColor()}
                style={styles.recordButtonGradient}
              >
                <IconSymbol
                  name={isRecordingActive ? 'stop.fill' : 'mic.fill'}
                  size={40}
                  color="#FFFFFF"
                />
                <Text style={styles.recordButtonText}>
                  {getRecordButtonLabel()}
                </Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Text style={[styles.recordHint, { color: colors.muted }]}>
            {isWaiting
              ? 'Microphone will activate after the countdown'
              : isRecordingActive
              ? 'Recording speech above 40dB automatically'
              : 'Tap to begin — microphone activates after 30 min'}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alarmTime: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 12,
  },
  sunriseSection: {
    gap: 8,
  },
  sunriseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sunriseText: {
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
  },
  recordingSection: {
    alignItems: 'center',
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  autoStopText: {
    fontSize: 13,
    textAlign: 'center',
  },
  recordButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  recordButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recordButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  recordHint: {
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 18,
  },
});
