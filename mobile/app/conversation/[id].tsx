import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Avatar, BrandHeader, ErrorState, Loader, Text } from '@/components/ui';
import { useAsync } from '@/hooks/useAsync';
import { messageService } from '@/services';
import { useTheme } from '@/theme';
import type { Message } from '@/types';
import { formatRelativeTime } from '@/utils/format';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conversationId = id ?? '';
  const { colors, spacing, radius, typography } = useTheme();

  const load = useCallback(async () => {
    const [conversation, messages] = await Promise.all([
      messageService.byId(conversationId),
      messageService.thread(conversationId),
    ]);
    return { conversation, messages };
  }, [conversationId]);

  // `emptyWhenArrayEmpty` ne s'applique pas ici : un fil sans message
  // reste un écran valide, on y affiche l'invitation à écrire.
  const { state, reload } = useAsync(load, [conversationId]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (state.status !== 'ready') return;
    setMessages(state.data.messages);
    void messageService.markRead(conversationId);
  }, [state, conversationId]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;

    // Message optimiste : affiché avant la confirmation du service,
    // puis remplacé par la version enregistrée.
    const optimistic: Message = {
      id: `local-${Date.now()}`,
      conversationId,
      author: 'me',
      authorName: 'Moi',
      text,
      sentAt: new Date().toISOString(),
      pending: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft('');
    setSending(true);
    scrollToEnd();

    try {
      const saved = await messageService.send(conversationId, text);
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? saved : m)));
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setDraft(text);
    } finally {
      setSending(false);
    }
  }

  const conversation = state.status === 'ready' ? state.data.conversation : null;
  const isGroup = conversation ? conversation.kind === 'class' || conversation.kind === 'group' : false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <BrandHeader
        title={conversation?.title ?? 'Conversation'}
        subtitle={conversation?.kind === 'direct' ? 'Message privé' : isGroup ? 'Groupe' : undefined}
        back
        right={
          conversation ? <Avatar name={conversation.title} uri={conversation.avatarUrl} size={36} ring /> : undefined
        }
      />

      {state.status === 'loading' && <Loader label="Chargement des messages…" />}

      {state.status === 'error' && <ErrorState message={state.error} onRetry={reload} />}

      {state.status === 'ready' && (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={12}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={scrollToEnd}
          >
            {messages.length === 0 && (
              <Text variant="small" tone="faint" center>
                Aucun message pour le moment. Écris le premier.
              </Text>
            )}

            {messages.map((message) => {
              if (message.author === 'system') {
                return (
                  <View
                    key={message.id}
                    style={{
                      alignSelf: 'center',
                      maxWidth: '90%',
                      backgroundColor: colors.surfaceMuted,
                      borderRadius: radius.lg,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                    }}
                  >
                    <Text variant="small" tone="muted" center>
                      {message.text}
                    </Text>
                  </View>
                );
              }

              const mine = message.author === 'me';
              return (
                <View
                  key={message.id}
                  style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '84%', gap: 2 }}
                >
                  {isGroup && !mine && (
                    <Text variant="caption" tone="faint" style={{ marginLeft: spacing.sm }}>
                      {message.authorName}
                    </Text>
                  )}

                  <View
                    style={{
                      backgroundColor: mine ? colors.primary : colors.surface,
                      borderRadius: radius.xl,
                      borderBottomRightRadius: mine ? radius.sm : radius.xl,
                      borderBottomLeftRadius: mine ? radius.xl : radius.sm,
                      padding: spacing.md,
                      opacity: message.pending ? 0.7 : 1,
                    }}
                  >
                    <Text variant="body" style={{ color: mine ? colors.primaryOn : colors.text }}>
                      {message.text}
                    </Text>
                  </View>

                  <Text
                    variant="caption"
                    tone="faint"
                    style={{ alignSelf: mine ? 'flex-end' : 'flex-start', marginHorizontal: spacing.sm }}
                  >
                    {message.pending ? 'Envoi…' : formatRelativeTime(message.sentAt)}
                  </Text>
                </View>
              );
            })}
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
              placeholder="Écris un message…"
              placeholderTextColor={colors.textFaint}
              value={draft}
              onChangeText={setDraft}
              multiline
            />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Envoyer"
              disabled={!draft.trim() || sending}
              onPress={() => void send()}
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
      )}
    </View>
  );
}
