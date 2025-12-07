import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // Get user from Redux store to determine if logged in and role
  const user = useAppSelector(selectCurrentUser);
  const isLoggedIn = !!user;
  
  // Check user role - roles is an array, check if it includes specific role
  const isStudent = user?.roles?.includes('Student') || false;
  const isInstructor = user?.roles?.includes('Instructor') || false;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          // Show for logged in users (both Student and Instructor)
          href: isLoggedIn ? '/(tabs)/classes' : null,
        }}
      />
      <Tabs.Screen
        name="assignments"
        options={{
          title: 'Assignments',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="doc.text.fill" color={color} />,
          // Only show for Instructor, hide for Student and not logged in
          href: isLoggedIn && isInstructor ? '/(tabs)/assignments' : null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="safari.fill" color={color} />,
          // Show for logged in users (both Student and Instructor)
          href: isLoggedIn ? '/(tabs)/explore' : null,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bell.fill" color={color} />,
          // Show for logged in users (both Student and Instructor)
          href: isLoggedIn ? '/(tabs)/notifications' : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.crop.circle" color={color} />,
        }}
      />
    </Tabs>
  );
}
