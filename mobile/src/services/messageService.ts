import { mockConversations, mockMessages, mockNotifications } from '@/mock/data';
import type { AppNotification, Conversation, Message } from '@/types';

import { delay } from './source';

export const messageService = {
  async conversations(): Promise<Conversation[]> {
    return delay(mockConversations);
  },

  async byId(id: string): Promise<Conversation | null> {
    return delay(mockConversations.find((c) => c.id === id) ?? null, 150);
  },

  /** Messages d'un fil, du plus ancien au plus récent. */
  async thread(conversationId: string): Promise<Message[]> {
    const messages = mockMessages[conversationId] ?? [];
    return delay([...messages].sort((a, b) => a.sentAt.localeCompare(b.sentAt)));
  },

  /**
   * Ajoute un message au fil et renvoie le message tel qu'il a été
   * enregistré. En Phase 4 ce sera un `addDoc` Firestore : l'écran
   * continuera d'afficher ce que renvoie cette méthode.
   */
  async send(conversationId: string, text: string): Promise<Message> {
    const message: Message = {
      id: `${conversationId}-m${Date.now()}`,
      conversationId,
      author: 'me',
      authorName: 'Moi',
      text: text.trim(),
      sentAt: new Date().toISOString(),
    };

    mockMessages[conversationId] = [...(mockMessages[conversationId] ?? []), message];

    const conversation = mockConversations.find((c) => c.id === conversationId);
    if (conversation) {
      conversation.lastMessage = message.text;
      conversation.lastMessageAt = message.sentAt;
    }

    return delay(message, 250);
  },

  async markRead(conversationId: string): Promise<void> {
    const conversation = mockConversations.find((c) => c.id === conversationId);
    if (conversation) conversation.unreadCount = 0;
  },

  async unreadCount(): Promise<number> {
    const total = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0);
    return delay(total, 120);
  },
};

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    return delay(mockNotifications);
  },

  async markRead(id: string): Promise<void> {
    const notification = mockNotifications.find((n) => n.id === id);
    if (notification) notification.read = true;
  },

  async markAllRead(): Promise<void> {
    mockNotifications.forEach((n) => {
      n.read = true;
    });
  },

  async unreadCount(): Promise<number> {
    return delay(mockNotifications.filter((n) => !n.read).length, 120);
  },
};
