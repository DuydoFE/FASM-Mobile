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
      {/* Student Home Tab - only for students */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          // Only show for Student, hide for Instructor
          href: !isInstructor ? undefined : null,
        }}
      />
      {/* Instructor Dashboard Tab - only for instructors */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="square.grid.2x2.fill" color={color} />,
          // Only show for Instructor
          href: isLoggedIn && isInstructor ? undefined : null,
        }}
      />
      {/* Student Classes Tab - only for students */}
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          // Only show for Student, hide for Instructor
          href: isLoggedIn && !isInstructor ? undefined : null,
        }}
      />
      {/* Instructor My Class Tab - only for instructors */}
      <Tabs.Screen
        name="my-class"
        options={{
          title: 'My Class',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          // Only show for Instructor
          href: isLoggedIn && isInstructor ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="rubric"
        options={{
          href: null, // Hide rubric tab
        }}
      />
      
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Hide explore completely
        }}
      />
    
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="bell.fill" color={color} />,
          // Show for logged in users (both Student and Instructor)
          href: isLoggedIn ? undefined : null,
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
