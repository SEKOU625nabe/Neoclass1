import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { BrandHeader, Card, Text } from '@/components/ui';
import { useSession } from '@/contexts/SessionContext';
import { useTheme } from '@/theme';
import { firstName } from '@/utils/format';

type ChatMessage = {
  id: string;
  from: 'user' | 'darx';
  text: string;
  pending?: boolean;
};

const SUGGESTIONS = [
  'Explique-moi les limites',
  'Résume ce chapitre',
  'Donne-moi un exercice',
  'Corrige mon devoir',
];

export default function DarxScreen() {
  const router = useRouter();
  const { colors, spacing, radius, typography } = useTheme();
  const { user } = useSession();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      from: 'darx',
      text: `Bonjour ${user ? firstName(user.fullName) : ''} ! Je suis DARX, ton assistant NeoClass. Pose-moi une question sur tes cours.`,
    },
  ]);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  function send(text: string) {
    const content = text.trim();
    if (!content) return;

    const userMessage: ChatMessage = { id: `u-${Date.now()}`, from: 'user', text: content };
    const placeholder: ChatMessage = { id: `d-${Date.now()}`, from: 'darx', text: '', pending: true };

    setMessages((prev) => [...prev, userMessage, placeholder]);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

    // Phase 8 : remplacé par un appel à la Cloud Function `darx`.
    // La clé Mistral reste côté serveur, jamais dans l'application.
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholder.id
            ? {
                ...m,
                pending: false,
                text: "Je ne suis pas encore branché au serveur. À la phase 8, cette réponse viendra de la Cloud Function sécurisée, avec ton niveau et ta matière en contexte.",
              }
            : m,
        ),
      );
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }, 900);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader
        title="DARX AI"
        subtitle="Ton assistant intelligent"
        right={
          <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={12}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const mine = message.from === 'user';
            return (
              <View
                key={message.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '84%',
                  backgroundColor: mine ? colors.primary : colors.surface,
                  borderRadius: radius.xl,
                  borderBottomRightRadius: mine ? radius.sm : radius.xl,
                  borderBottomLeftRadius: mine ? radius.xl : radius.sm,
                  padding: spacing.md,
                }}
              >
                {message.pending ? (
                  <Text variant="small" tone="muted">
                    DARX écrit…
                  </Text>
                ) : (
                  <Text variant="body" style={{ color: mine ? colors.primaryOn : colors.text }}>
                    {message.text}
                  </Text>
                )}
              </View>
            );
          })}

          {messages.length <= 1 && (
            <Card style={{ gap: spacing.sm }}>
              <Text variant="caption" tone="faint">
                Suggestions
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {SUGGESTIONS.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    accessibilityRole="button"
                    onPress={() => send(suggestion)}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderRadius: radius.pill,
                      backgroundColor: colors.brandSoft,
                    }}
                  >
                    <Text variant="caption" tone="primary">
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </Card>
          )}
        </ScrollView>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: spacing.sm,
            padding: spacing.lg,
            paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.lg,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.surface,
          }}
        >
          <TextInput
            style={[
              typography.body,
              {
                flex: 1,
                maxHeight: 120,
                color: colors.text,
                backgroundColor: colors.background,
                borderRadius: radius.lg,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.md,
              },
            ]}
            placeholder="Pose ta question…"
            placeholderTextColor={colors.textFaint}
            value={draft}
            onChangeText={setDraft}
            multiline
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Envoyer"
            disabled={!draft.trim()}
            onPress={() => send(draft)}
            style={{
              width: 46,
              height: 46,
              borderRadius: radius.pill,
              backgroundColor: draft.trim() ? colors.primary : colors.surfaceMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="send" size={18} color={draft.trim() ? colors.primaryOn : colors.textFaint} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
