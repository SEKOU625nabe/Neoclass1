import React from 'react';
import { Pressable, View } from 'react-native';

import { Avatar, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { Conversation } from '@/types';
import { formatRelativeTime } from '@/utils/format';

export type ConversationRowProps = {
  conversation: Conversation;
  onPress: () => void;
};

export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const { colors, spacing, radius } = useTheme();
  const unread = conversation.unreadCount > 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${conversation.title}. ${conversation.unreadCount} non lus.`}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Avatar name={conversation.title} uri={conversation.avatarUrl} size={46} />

      <View style={{ flex: 1, gap: 2 }}>
        <Text variant={unread ? 'bodyStrong' : 'body'} numberOfLines={1}>
          {conversation.title}
        </Text>
        <Text variant="small" tone={unread ? 'default' : 'muted'} numberOfLines={1}>
          {conversation.lastMessage}
        </Text>
      </View>

      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        <Text variant="caption" tone="faint">
          {formatRelativeTime(conversation.lastMessageAt)}
        </Text>

        {unread && (
          <View
            style={{
              minWidth: 20,
              height: 20,
              paddingHorizontal: 6,
              borderRadius: radius.pill,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="caption" style={{ color: colors.primaryOn }}>
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
