import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#58d5ba',
        tabBarInactiveTintColor: '#6f737a',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#2c2f34',
          borderTopWidth: 1,
          borderTopColor: '#3a3d42',
          height: 65,
          paddingTop: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
        
      <Tabs.Screen
        name="zikhrs"
        options={{
          title: 'Zikirler',
          tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
      name="index"
      options={{
        title: 'Ana Sayfa',
        tabBarIcon: ({ color }) => <FontAwesome5 name="mosque" size={24} color={color} />,
      }}
      />

      <Tabs.Screen
      name="reminder"
      options={{
        title: 'Hatırlatıcı',
        tabBarIcon: ({ color }) => <MaterialIcons name="alarm" size={24} color={color} />,
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
