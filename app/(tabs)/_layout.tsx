import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#58d5ba',
        tabBarInactiveTintColor: '#58d5ba',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#2c2f34',
        },
      }}>
      <Tabs.Screen
        name="zikhrs"
        options={{
          title: 'Zikhrs',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="list.bullet" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ev',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="placeholder"
        options={{
          title: '',
          tabBarIcon: () => <IconSymbol size={28} name="circle.fill" color="transparent" />,
          tabBarItemStyle: {
            opacity: 0,
            pointerEvents: 'none',
          },
        }}
      />
    </Tabs>
  );
}
