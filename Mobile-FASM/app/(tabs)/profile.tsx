import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
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

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    // Clear user data from Redux store
    dispatch(logout());
    router.replace('/login');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const renderSettingItem = ({ icon, title, type = 'link', value, onValueChange, color }: any) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: borderColor }]}
      activeOpacity={type === 'link' ? 0.7 : 1}
      disabled={type === 'switch'}
    >
      <View style={[styles.settingIcon, { backgroundColor: color ? `${color}15` : 'rgba(0,0,0,0.05)' }]}>
        <IconSymbol name={icon} size={20} color={color || textColor} />
      </View>
      <ThemedText type="default" style={styles.settingTitle}>{title}</ThemedText>
      
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: primaryColor }}
          thumbColor={'#f4f3f4'}
        />
      ) : (
        <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
      )}
    </TouchableOpacity>
  );

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

              <View style={styles.section}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Account Settings</ThemedText>
                <View style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}>
                  {renderSettingItem({ icon: 'person.fill', title: 'Personal Information', color: Colors.light.primary })}
                  {renderSettingItem({ icon: 'lock.fill', title: 'Security & Password', color: Colors.light.accent })}
                  {renderSettingItem({ icon: 'bell.fill', title: 'Notifications', type: 'switch', value: notificationsEnabled, onValueChange: setNotificationsEnabled, color: Colors.light.warning })}
                  {renderSettingItem({ icon: 'moon.fill', title: 'Dark Mode', type: 'switch', value: isDarkMode, onValueChange: setIsDarkMode, color: Colors.light.info })}
                </View>
              </View>
            </>
          ) : (
            // Not logged in: Show login prompt
            <View style={styles.header}>
              <View style={[styles.avatarContainer, { backgroundColor: Colors.light.icon }, Shadows.light.md]}>
                <IconSymbol name="person.fill" size={48} color="#FFFFFF" />
              </View>
              <ThemedText type="title" style={styles.name}>Welcome to FASM</ThemedText>
              <ThemedText type="default" style={styles.email}>Please login to access your profile</ThemedText>
            </View>
          )}

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Support</ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}>
              {renderSettingItem({ icon: 'questionmark.circle.fill', title: 'Help Center', color: Colors.light.success })}
              {renderSettingItem({ icon: 'envelope.fill', title: 'Contact Support', color: Colors.light.primary })}
              {renderSettingItem({ icon: 'doc.text.fill', title: 'Terms & Privacy', color: Colors.light.icon })}
            </View>
          </View>

          {isLoggedIn ? (
            // Logged in: Show logout button
            <TouchableOpacity
              style={[styles.logoutButton, { borderColor: Colors.light.error }]}
              onPress={handleLogout}
            >
              <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors.light.error} style={styles.logoutIcon} />
              <ThemedText type="defaultSemiBold" style={{ color: Colors.light.error }}>Log Out</ThemedText>
            </TouchableOpacity>
          ) : (
            // Not logged in: Show login button
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: primaryColor }]}
              onPress={handleLogin}
            >
              <IconSymbol name="person.fill" size={20} color="#FFFFFF" style={styles.logoutIcon} />
              <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>Login</ThemedText>
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
