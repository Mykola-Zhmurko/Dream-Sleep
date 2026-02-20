import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';

import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

const TIPS = [
  {
    key: 'tip1',
    titleKey: 'tip1_title',
    bodyKey: 'tip1_body',
    sourceKey: 'tip1_source',
    videoUrl: 'https://www.youtube.com/watch?v=1_zPrvngtmQ',
    videoTitle: 'Why Is A Consistent Sleep Schedule Important?',
    icon: '🕐',
  },
  {
    key: 'tip2',
    titleKey: 'tip2_title',
    bodyKey: 'tip2_body',
    sourceKey: 'tip2_source',
    videoUrl: 'https://www.youtube.com/shorts/rxhxoNdEUPY',
    videoTitle: 'Avoid Caffeine 6 to 8 Hours Before you Sleep',
    icon: '☕',
  },
  {
    key: 'tip3',
    titleKey: 'tip3_title',
    bodyKey: 'tip3_body',
    sourceKey: 'tip3_source',
    videoUrl: 'https://www.youtube.com/shorts/H1cptcnplvw',
    videoTitle: 'Exercise Helps You Sleep 55% FASTER',
    icon: '🏃',
  },
  {
    key: 'tip4',
    titleKey: 'tip4_title',
    bodyKey: 'tip4_body',
    sourceKey: 'tip4_source',
    videoUrl: 'https://www.youtube.com/shorts/C9c6ECsVW58',
    videoTitle: 'Dark, quiet, cool: The recipe for a better night\'s sleep',
    icon: '🌙',
  },
  {
    key: 'tip5',
    titleKey: 'tip5_title',
    bodyKey: 'tip5_body',
    sourceKey: 'tip5_source',
    videoUrl: 'https://www.youtube.com/watch?v=d1PPFZO_8Lc',
    videoTitle: 'Health tips: Why should you avoid screens before bed?',
    icon: '📵',
  },
] as const;

export default function TipsScreen() {
  const { t } = useTranslation();
  const colors = useColors();

  const openVideo = useCallback(async (url: string) => {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      toolbarColor: '#0D0D0D',
    });
  }, []);

  return (
    <ScreenContainer>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.screenTitle, { color: colors.foreground }]}>
          {t('tips_title')}
        </Text>
        <IconSymbol name="moon.stars.fill" size={24} color={colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {TIPS.map((tip, index) => (
          <View
            key={tip.key}
            style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            {/* Number badge */}
            <View style={[styles.tipHeader]}>
              <View style={[styles.numberBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipIcon}>{tip.icon}</Text>
            </View>

            {/* Title */}
            <Text style={[styles.tipTitle, { color: colors.foreground }]}>
              {t(tip.titleKey)}
            </Text>

            {/* Body */}
            <Text style={[styles.tipBody, { color: colors.muted }]}>
              {t(tip.bodyKey)}
            </Text>

            {/* Source */}
            <Text style={[styles.tipSource, { color: colors.muted }]}>
              {t(tip.sourceKey)}
            </Text>

            {/* Video Button */}
            <Pressable
              onPress={() => openVideo(tip.videoUrl)}
              style={({ pressed }) => [
                styles.videoButton,
                {
                  backgroundColor: colors.primary + '15',
                  borderColor: colors.primary,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <IconSymbol name="video.fill" size={16} color={colors.primary} />
              <Text style={[styles.videoButtonText, { color: colors.primary }]}>
                {t('tips_watch_video')}
              </Text>
            </Pressable>

            {/* Video title hint */}
            <Text style={[styles.videoTitle, { color: colors.muted }]} numberOfLines={1}>
              {tip.videoTitle}
            </Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Tips based on peer-reviewed research and guidelines from leading health organizations.
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  tipCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 8,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tipIcon: {
    fontSize: 24,
  },
  tipTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  tipBody: {
    fontSize: 14,
    lineHeight: 21,
  },
  tipSource: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  videoButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
