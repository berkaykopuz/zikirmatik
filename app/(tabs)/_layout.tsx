import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const baseTabBarHeight = 48;
  const bottomInset = Math.max(insets.bottom, 10); // keep bar above Android nav buttons

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: '#58d5ba',
        tabBarInactiveTintColor: '#6f737a',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#2c2f34',
          borderTopWidth: 1,
          borderTopColor: '#3a3d42',
          height: baseTabBarHeight + 3,
          paddingTop: 1,
          paddingBottom: 8,
          marginBottom: bottomInset, // reserve space so bar sits above system nav
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}>

      <Tabs.Screen
        name="zikhrs"
        options={{
          title: 'Zikirler',
          tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => <FontAwesome5 name="mosque" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="reminder"
        options={{
          title: 'Hatırlatıcı',
          tabBarIcon: ({ color }) => <MaterialIcons name="alarm" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="placeholder"
        options={{
          title: '',
          tabBarIcon: () => <IconSymbol size={24} name="circle.fill" color="transparent" />,
          tabBarItemStyle: {
            display: 'none', // do not reserve space so visible tabs stay centered
          },
        }}
      />
    </Tabs>
  );
}
