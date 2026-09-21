import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Badge, BrandHeader, Button, Card, EmptyState, ErrorState, Loader, ProgressBar, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { courseService } from '@/services';
import { useTheme } from '@/theme';
import type { QuizQuestion, QuizResult } from '@/types';
import { formatNumber } from '@/utils/format';

/** Message de fin, choisi sur le ratio de bonnes réponses. */
function verdict(ratio: number): { title: string; message: string; icon: keyof typeof Ionicons.glyphMap } {
  if (ratio === 1) {
    return { title: 'Sans faute !', message: 'Tu maîtrises ce chapitre.', icon: 'trophy' };
  }
  if (ratio >= 0.5) {
    return { title: 'Bien joué', message: 'Revois les questions manquées pour consolider.', icon: 'thumbs-up' };
  }
  return { title: 'À retravailler', message: 'Reprends la leçon puis retente l’exercice.', icon: 'refresh-circle' };
}

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exerciseId = id ?? '';
  const router = useRouter();
  const { colors, spacing, radius } = useTheme();

  const load = useCallback(async () => {
    const [exercise, questions] = await Promise.all([
      courseService.exerciseById(exerciseId),
      courseService.exerciseQuiz(exerciseId),
    ]);
    return { exercise, questions };
  }, [exerciseId]);

  const { state, reload } = useAsync(load, [exerciseId]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  /** Réponse validée : on affiche alors la correction, plus de changement possible. */
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  function restart() {
    setIndex(0);
    setAnswers({});
    setChecked(false);
    setResult(null);
  }

  async function finish(finalAnswers: Record<string, string>) {
    setSubmitting(true);
    try {
      setResult(await courseService.submitQuiz(exerciseId, finalAnswers));
    } finally {
      setSubmitting(false);
    }
  }

  function next(questions: QuizQuestion[]) {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setChecked(false);
      return;
    }
    void finish(answers);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader
        title={state.status === 'ready' ? (state.data.exercise?.title ?? 'Exercice') : 'Exercice'}
        subtitle={result ? 'Résultat' : 'Quiz'}
        back
      />

      {state.status === 'loading' && <Loader label="Préparation du quiz…" />}

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      {state.status === 'ready' && state.data.questions.length === 0 && (
        <EmptyState
          icon="help-circle-outline"
          title="Quiz indisponible"
          message="Les questions de cet exercice ne sont pas encore en ligne."
          actionLabel="Retour"
          onAction={() => router.back()}
        />
      )}

      {state.status === 'ready' &&
        state.data.questions.length > 0 &&
        (() => {
          const questions = state.data.questions;
          const question = questions[Math.min(index, questions.length - 1)];
          if (!question) return null;

          const selected = answers[question.id];
          const isCorrect = checked && selected === question.correctOptionId;

          if (result) {
            const { title, message, icon } = verdict(result.ratio);
            return (
              <ScrollView
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge }}
                showsVerticalScrollIndicator={false}
              >
                <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xxl }}>
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: radius.pill,
                      backgroundColor: colors.brandSoft,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name={icon} size={34} color={colors.primary} />
                  </View>

                  <Text variant="h2" center>
                    {title}
                  </Text>
                  <Text variant="display" tone="primary">
                    {result.correct} / {result.total}
                  </Text>
                  <Text variant="small" tone="muted" center>
                    {message}
                  </Text>

                  {result.coinsEarned > 0 && (
                    <Badge label={`+ ${formatNumber(result.coinsEarned)} NabeCoins`} tone="accent" />
                  )}
                </Card>

                <Card style={{ gap: spacing.md }}>
                  <Text variant="h3">Correction</Text>
                  {questions.map((q, i) => {
                    const given = answers[q.id];
                    const ok = given === q.correctOptionId;
                    const goodLabel = q.options.find((o) => o.id === q.correctOptionId)?.label ?? '—';

                    return (
                      <View key={q.id} style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                        <Ionicons
                          name={ok ? 'checkmark-circle' : 'close-circle'}
                          size={20}
                          color={ok ? colors.success : colors.danger}
                        />
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text variant="small" numberOfLines={2}>
                            {i + 1}. {q.prompt}
                          </Text>
                          {!ok && (
                            <Text variant="caption" tone="success">
                              Bonne réponse : {goodLabel}
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </Card>

                <Button label="Recommencer" variant="outline" icon="refresh" onPress={restart} />
                <Button label="Terminer" icon="arrow-forward" iconAfter onPress={() => router.back()} />
              </ScrollView>
            );
          }

          return (
            <ScrollView
              contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.huge }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="caption" tone="faint">
                    Question {index + 1} sur {questions.length}
                  </Text>
                  <Text variant="caption" tone="faint">
                    {Math.round(((index + 1) / questions.length) * 100)} %
                  </Text>
                </View>
                <ProgressBar value={(index + 1) / questions.length} label="Progression du quiz" />
              </View>

              <Card style={{ gap: spacing.lg }}>
                <Text variant="h3">{question.prompt}</Text>

                <View style={{ gap: spacing.sm }}>
                  {question.options.map((option) => {
                    const picked = selected === option.id;
                    const right = option.id === question.correctOptionId;

                    // Avant validation : seule la sélection est mise en avant.
                    // Après : la bonne réponse passe au vert, l'erreur au rouge.
                    const borderColor = checked
                      ? right
                        ? colors.success
                        : picked
                          ? colors.danger
                          : colors.border
                      : picked
                        ? colors.primary
                        : colors.border;

                    const background = checked
                      ? right
                        ? colors.successSoft
                        : picked
                          ? colors.dangerSoft
                          : colors.surface
                      : picked
                        ? colors.brandSoft
                        : colors.surface;

                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: picked, disabled: checked }}
                        accessibilityLabel={option.label}
                        disabled={checked}
                        onPress={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: spacing.md,
                          padding: spacing.lg - 2,
                          borderRadius: radius.lg,
                          borderWidth: 1.5,
                          borderColor,
                          backgroundColor: background,
                        }}
                      >
                        <View
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: radius.pill,
                            borderWidth: 2,
                            borderColor: picked ? colors.primary : colors.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {picked && (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: radius.pill,
                                backgroundColor: colors.primary,
                              }}
                            />
                          )}
                        </View>

                        <Text variant="body" style={{ flex: 1 }}>
                          {option.label}
                        </Text>

                        {checked && right && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
                        {checked && picked && !right && (
                          <Ionicons name="close-circle" size={20} color={colors.danger} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              {checked && (
                <Card
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    backgroundColor: isCorrect ? colors.successSoft : colors.dangerSoft,
                  }}
                  elevation="flat"
                >
                  <Ionicons
                    name={isCorrect ? 'checkmark-circle' : 'information-circle'}
                    size={22}
                    color={isCorrect ? colors.success : colors.danger}
                  />
                  <Text variant="small" style={{ flex: 1 }}>
                    {isCorrect ? 'Bonne réponse, continue !' : 'Ce n’est pas la bonne réponse. Regarde la correction en vert.'}
                  </Text>
                </Card>
              )}

              {checked ? (
                <Button
                  label={index + 1 < questions.length ? 'Question suivante' : 'Voir mon résultat'}
                  icon="arrow-forward"
                  iconAfter
                  loading={submitting}
                  onPress={() => next(questions)}
                />
              ) : (
                <Button label="Valider" disabled={!selected} onPress={() => setChecked(true)} />
              )}
            </ScrollView>
          );
        })()}
    </View>
  );
}
