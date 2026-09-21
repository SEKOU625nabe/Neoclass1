import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { useTheme } from '@/theme';

type TabIcon = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, { active: TabIcon; inactive: TabIcon }> = {
  index: { active: 'home', inactive: 'home-outline' },
  courses: { active: 'book', inactive: 'book-outline' },
  messages: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  nabecoins: { active: 'wallet', inactive: 'wallet-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

export default function TabsLayout() {
  const { colors, typography } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 86 : 64,
          paddingTop: 6,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        tabBarLabelStyle: typography.caption,
        tabBarIcon: ({ focused, color, size }) => {
          const icon = ICONS[route.name] ?? ICONS.index!;
          return <Ionicons name={focused ? icon.active : icon.inactive} size={size - 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="courses" options={{ title: 'Cours' }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="nabecoins" options={{ title: 'NabeCoins' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profil' }} />
    </Tabs>
  );
}
