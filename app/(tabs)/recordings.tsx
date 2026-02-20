import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { createAudioPlayer } from 'expo-audio';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WaveformView } from '@/components/waveform-view';
import { useColors } from '@/hooks/use-colors';
import { useRecordings, RecordingSegment } from '@/lib/recordings-context';

interface PlaybackState {
  id: string;
  isPlaying: boolean;
  progress: number;
}

export default function RecordingsScreen() {
  const { t } = useTranslation();
  const colors = useColors();
  const { recordings, deleteRecording } = useRecordings();
  const [playbackStates, setPlaybackStates] = useState<Record<string, PlaybackState>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const playersRef = useRef<Map<string, any>>(new Map());
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

  // Cleanup all players on unmount
  useEffect(() => {
    return () => {
      playersRef.current.forEach((player) => {
        try { player.remove(); } catch { /* ignore */ }
      });
      intervalsRef.current.forEach((interval) => clearInterval(interval));
      playersRef.current.clear();
      intervalsRef.current.clear();
    };
  }, []);

  // Group recordings by date
  const sections = useMemo(() => {
    const grouped: Record<string, RecordingSegment[]> = {};
    recordings.forEach((rec) => {
      if (!grouped[rec.date]) grouped[rec.date] = [];
      grouped[rec.date].push(rec);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, data]) => ({
        title: date,
        data: data.sort((a, b) => b.timestamp - a.timestamp),
      }));
  }, [recordings]);

  const handleDelete = useCallback(
    (id: string) => {
      Alert.alert(
        t('recordings_delete'),
        t('recordings_delete_confirm'),
        [
          { text: t('common_cancel'), style: 'cancel' },
          {
            text: t('common_delete'),
            style: 'destructive',
            onPress: () => deleteRecording(id),
          },
        ],
      );
    },
    [deleteRecording, t],
  );

  const handlePlayPause = useCallback(
    async (recording: RecordingSegment) => {
      const current = playbackStates[recording.id];

      if (current?.isPlaying) {
        // Pause: stop the actual player and clear interval
        const player = playersRef.current.get(recording.id);
        if (player) {
          try { player.pause(); } catch { /* ignore */ }
        }
        const interval = intervalsRef.current.get(recording.id);
        if (interval) {
          clearInterval(interval);
          intervalsRef.current.delete(recording.id);
        }
        setPlaybackStates((prev) => ({
          ...prev,
          [recording.id]: { ...prev[recording.id], isPlaying: false },
        }));
        return;
      }

      // Clean up any existing player for this recording
      const existingPlayer = playersRef.current.get(recording.id);
      if (existingPlayer) {
        try { existingPlayer.remove(); } catch { /* ignore */ }
        playersRef.current.delete(recording.id);
      }

      setLoadingId(recording.id);
      try {
        const player = createAudioPlayer({ uri: recording.uri });
        playersRef.current.set(recording.id, player);
        setPlaybackStates((prev) => ({
          ...prev,
          [recording.id]: { id: recording.id, isPlaying: true, progress: 0 },
        }));
        setLoadingId(null);

        player.play();

        // Track progress via polling
        const duration = recording.duration * 1000;
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setPlaybackStates((prev) => ({
            ...prev,
            [recording.id]: { ...prev[recording.id], progress },
          }));
          if (progress >= 1) {
            clearInterval(progressInterval);
            intervalsRef.current.delete(recording.id);
            setPlaybackStates((prev) => ({
              ...prev,
              [recording.id]: { ...prev[recording.id], isPlaying: false, progress: 0 },
            }));
            player.remove();
            playersRef.current.delete(recording.id);
          }
        }, 200);
        intervalsRef.current.set(recording.id, progressInterval);
      } catch {
        setLoadingId(null);
        Alert.alert(t('recordings_playback_error'), t('recordings_playback_error_msg'));
      }
    },
    [playbackStates, t],
  );

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m > 0) return `${m}:${String(s).padStart(2, '0')}`;
    return `${s}s`;
  };

  const formatSectionTitle = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'EEEE, MMMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: RecordingSegment; index: number }) => {
      const pb = playbackStates[item.id];
      const isPlaying = pb?.isPlaying ?? false;
      const progress = pb?.progress ?? 0;
      const isLoading = loadingId === item.id;

      return (
        <View style={[styles.recordingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={styles.segmentBadge}>
              <Text style={[styles.segmentLabel, { color: colors.primary }]}>
                {t('recordings_segment', { n: index + 1 })}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={[styles.duration, { color: colors.muted }]}>
                {formatDuration(item.duration)}
              </Text>
              <Text style={[styles.timestamp, { color: colors.muted }]}>
                {format(new Date(item.timestamp), 'HH:mm')}
              </Text>
            </View>
          </View>

          {/* Waveform */}
          <View style={styles.waveformContainer}>
            <WaveformView
              amplitudeData={item.amplitudeData}
              width={260}
              height={44}
              barCount={40}
              progress={progress}
            />
          </View>

          <View style={styles.cardActions}>
            {/* Play/Pause */}
            <Pressable
              onPress={() => handlePlayPause(item)}
              style={({ pressed }) => [
                styles.playButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <IconSymbol
                  name={isPlaying ? 'pause.fill' : 'play.fill'}
                  size={16}
                  color="#FFFFFF"
                />
              )}
              <Text style={styles.playButtonText}>
                {isPlaying ? t('recordings_pause') : t('recordings_play')}
              </Text>
            </Pressable>

            {/* Delete */}
            <Pressable
              onPress={() => handleDelete(item.id)}
              style={({ pressed }) => [
                styles.deleteButton,
                { borderColor: colors.error, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <IconSymbol name="trash.fill" size={14} color={colors.error} />
            </Pressable>
          </View>
        </View>
      );
    },
    [colors, t, playbackStates, loadingId, handlePlayPause, handleDelete],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string; data: RecordingSegment[] } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <IconSymbol name="moon.fill" size={14} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {formatSectionTitle(section.title)}
        </Text>
        <Text style={[styles.sectionCount, { color: colors.muted }]}>
          {section.data.length} segment{section.data.length !== 1 ? 's' : ''}
        </Text>
      </View>
    ),
    [colors],
  );

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          {t('recordings_title')}
        </Text>
        <IconSymbol name="waveform" size={24} color={colors.primary} />
      </View>

      {recordings.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="mic.fill" size={56} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            {t('recordings_empty')}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
  },
  recordingCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  segmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 53, 0.12)',
  },
  segmentLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  duration: {
    fontSize: 13,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
  },
  waveformContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    justifyContent: 'center',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
