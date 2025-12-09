import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InstructorSearchBar } from './instructor-search-bar';
import { StudentSearchBar } from './student-search-bar';

/**
 * Get greeting based on current time of day
 */
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 18) return 'Good Afternoon,';
  return 'Good Evening,';
};

/**
 * Get initials from first and last name
 */
const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || 'U';
};

export function HomeHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  
  // Get user from Redux store
  const user = useAppSelector(selectCurrentUser);
  const isLoggedIn = !!user;
  
  // Check if user is instructor
  const isInstructor = user?.roles?.some(
    (role: string) => role.toLowerCase() === 'instructor'
  );
  
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest';
  const initials = getInitials(user?.firstName, user?.lastName);

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleLoginPress = () => {
    router.push('/login');
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + Spacing.sm, backgroundColor }]}>
      <View style={styles.headerContent}>
        {isLoggedIn ? (
          // Logged in: Show avatar and user info
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.8}>
              <View style={[styles.avatarContainer, { backgroundColor: primaryColor }]}>
                <ThemedText type="defaultSemiBold" style={styles.avatarText}>{initials}</ThemedText>
              </View>
            </TouchableOpacity>
            <View style={styles.greetingContainer}>
              <ThemedText type="caption" style={styles.greeting}>{getGreeting()}</ThemedText>
              <ThemedText type="title" style={styles.username}>{displayName}</ThemedText>
            </View>
          </View>
        ) : (
          // Not logged in: Show Login button
          <TouchableOpacity
            onPress={handleLoginPress}
            style={[styles.loginButton, { backgroundColor: primaryColor }]}
            activeOpacity={0.8}
          >
            <IconSymbol name="person.fill" size={18} color="#FFFFFF" style={styles.loginIcon} />
            <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.notificationBtn, { borderColor: Colors.light.border }]} activeOpacity={0.7}>
          <IconSymbol name="bell.fill" size={20} color={textColor} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>
      
      {isLoggedIn && (
        isInstructor ? <InstructorSearchBar /> : <StudentSearchBar />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.light.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  greeting: {
    opacity: 0.6,
    marginBottom: 2,
  },
  username: {
    fontSize: 20,
    lineHeight: 24,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  placeholder: {
    opacity: 0.5,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadows.light.sm,
  },
  loginIcon: {
    marginRight: Spacing.xs,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
