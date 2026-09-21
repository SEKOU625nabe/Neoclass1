import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge, Button, Card, Loader, ProgressBar, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { courseService } from '@/services';
import { useTheme } from '@/theme';

type Tab = 'notes' | 'questions' | 'telecharger';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, spacing, radius, palette } = useTheme();
  const insets = useSafeAreaInsets();

  const [tab, setTab] = useState<Tab>('notes');
  const [answer, setAnswer] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const load = useCallback(() => courseService.lessonQuiz(String(id)), [id]);
  const { state } = useAsync(load, [id]);

  const question = state.status === 'ready' ? state.data[0] : undefined;
  const isCorrect = validated && question && answer === question.correctOptionId;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Zone vidéo */}
      <View
        style={{
          backgroundColor: palette.ink900,
          paddingTop: insets.top,
          height: 240 + insets.top,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: spacing.lg }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Retour" onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={{ flexDirection: 'row', gap: spacing.lg }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Télécharger" hitSlop={12}>
              <Ionicons name="download-outline" size={22} color="#FFFFFF" />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Plein écran" hitSlop={12}>
              <Ionicons name="expand-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: radius.pill,
              backgroundColor: 'rgba(255,255,255,0.22)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="play" size={26} color="#FFFFFF" />
          </View>
        </View>

        <View style={{ padding: spacing.lg, gap: spacing.sm }}>
          <ProgressBar value={0.44} height={4} color={palette.gold400} trackColor="rgba(255,255,255,0.25)" label="Lecture" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" tone="onBrandMuted">
              12:34 / 28:16
            </Text>
            <Text variant="caption" tone="onBrandMuted">
              1x
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: spacing.xs }}>
          <Text variant="h2">Fonctions et limites — Partie 1</Text>
          <Text variant="small" tone="muted">
            Mathématiques · Terminale SM
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {(
            [
              { key: 'notes', label: 'Notes', icon: 'document-text-outline' },
              { key: 'questions', label: 'Questions', icon: 'help-circle-outline' },
              { key: 'telecharger', label: 'Télécharger', icon: 'download-outline' },
            ] as { key: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[]
          ).map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => setTab(item.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  backgroundColor: active ? colors.brandSoft : colors.surface,
                  borderWidth: 1,
                  borderColor: active ? colors.primary : colors.border,
                }}
              >
                <Ionicons name={item.icon} size={14} color={active ? colors.primary : colors.textFaint} />
                <Text variant="caption" tone={active ? 'primary' : 'muted'}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Quiz rapide, comme sur la maquette « Vidéo de cours avec quiz » */}
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="h3">Quiz rapide</Text>
            <Badge label="+10 NabeCoins" tone="accent" />
          </View>

          {state.status === 'loading' && <Loader />}

          {question && (
            <>
              <Text variant="body">{question.prompt}</Text>

              <View style={{ gap: spacing.sm }}>
                {question.options.map((option) => {
                  const selected = answer === option.id;
                  const showRight = validated && option.id === question.correctOptionId;
                  const showWrong = validated && selected && option.id !== question.correctOptionId;

                  const borderColor = showRight
                    ? colors.success
                    : showWrong
                      ? colors.danger
                      : selected
                        ? colors.primary
                        : colors.border;

                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ selected, disabled: validated }}
                      disabled={validated}
                      onPress={() => setAnswer(option.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        borderRadius: radius.lg,
                        borderWidth: 1.5,
                        borderColor,
                        backgroundColor: colors.surface,
                      }}
                    >
                      <Ionicons
                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={selected ? colors.primary : colors.textFaint}
                      />
                      <Text variant="body" style={{ flex: 1 }}>
                        {option.label}
                      </Text>
                      {showRight && <Ionicons name="checkmark-circle" size={18} color={colors.success} />}
                      {showWrong && <Ionicons name="close-circle" size={18} color={colors.danger} />}
                    </Pressable>
                  );
                })}
              </View>

              {validated ? (
                <Text variant="small" tone={isCorrect ? 'success' : 'danger'}>
                  {isCorrect ? 'Bonne réponse ! 🎉' : 'Ce n’est pas la bonne réponse — revois la vidéo.'}
                </Text>
              ) : (
                <Button label="Valider" disabled={!answer} onPress={() => setValidated(true)} />
              )}
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
