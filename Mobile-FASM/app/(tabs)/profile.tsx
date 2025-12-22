import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppDispatch, useAppSelector } from '@/store';
import { logout, selectCurrentUser } from '@/store/slices/authSlice';

/**
 * Get initials from first and last name
 */
const getInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return first + last || 'U';
};

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  // Get user from Redux store
  const user = useAppSelector(selectCurrentUser);
  const isLoggedIn = !!user;
  
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Guest';
  const email = user?.email || 'Not logged in';
  const initials = getInitials(user?.firstName, user?.lastName);
  const role = user?.roles?.[0] || 'User';

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace('/login');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {isLoggedIn ? (
            // Logged in: Show user profile
            <>
              <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: primaryColor }, Shadows.light.md]}>
                  <ThemedText type="title" style={styles.avatarText}>{initials}</ThemedText>
                  <View style={styles.editBadge}>
                    <IconSymbol name="pencil" size={12} color="#FFFFFF" />
                  </View>
                </View>
                <ThemedText type="title" style={styles.name}>{displayName}</ThemedText>
                <ThemedText type="default" style={styles.email}>{email}</ThemedText>
                <View style={[styles.roleBadge, { backgroundColor: `${primaryColor}15` }]}>
                  <ThemedText type="caption" style={{ color: primaryColor, fontWeight: '600' }}>{role}</ThemedText>
                </View>
              </View>
            </>
          ) : (
            // Not logged in: Show login prompt without logo
            <View style={styles.header}>
              <ThemedText type="title" style={styles.name}>Welcome to FASM</ThemedText>
              <ThemedText type="default" style={styles.email}>Please login to access your profile</ThemedText>
            </View>
          )}

          <Image
            source={require('@/assets/images/FASM.png')}
            style={styles.logoImageCenter}
            resizeMode="contain"
          />

          {!isLoggedIn && (
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: primaryColor }]}
              onPress={handleLogin}
            >
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" style={styles.logoutIcon} />
              <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>Login</ThemedText>
            </TouchableOpacity>
          )}

          {isLoggedIn && (
            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: Colors.light.error }]}
              onPress={handleLogout}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors.light.error} style={styles.logoutIcon} />
              <ThemedText type="defaultSemiBold" style={{ color: Colors.light.error }}>Log Out</ThemedText>
            </TouchableOpacity>
          )}

          <ThemedText type="caption" style={styles.version}>Version 1.0.0</ThemedText>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoImage: {
    width: 200,
    height: 140,
    marginBottom: Spacing.lg,
  },
  logoImageCenter: {
    width: 180,
    height: 120,
    marginVertical: Spacing.xl,
    alignSelf: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    marginBottom: 4,
  },
  email: {
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    opacity: 0.6,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingTitle: {
    flex: 1,
  },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  loginButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    opacity: 0.4,
  },
});
