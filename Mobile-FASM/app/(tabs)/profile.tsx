import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const handleLogout = () => {
    router.replace('/login');
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
          
          <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: primaryColor }, Shadows.light.md]}>
              <ThemedText type="title" style={styles.avatarText}>JD</ThemedText>
              <View style={styles.editBadge}>
                <IconSymbol name="pencil" size={12} color="#FFFFFF" />
              </View>
            </View>
            <ThemedText type="title" style={styles.name}>John Doe</ThemedText>
            <ThemedText type="default" style={styles.email}>john.doe@university.edu</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: `${primaryColor}15` }]}>
              <ThemedText type="caption" style={{ color: primaryColor, fontWeight: '600' }}>Student</ThemedText>
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

          <View style={styles.section}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Support</ThemedText>
            <View style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}>
              {renderSettingItem({ icon: 'questionmark.circle.fill', title: 'Help Center', color: Colors.light.success })}
              {renderSettingItem({ icon: 'envelope.fill', title: 'Contact Support', color: Colors.light.primary })}
              {renderSettingItem({ icon: 'doc.text.fill', title: 'Terms & Privacy', color: Colors.light.icon })}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: Colors.light.error }]}
            onPress={handleLogout}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={20} color={Colors.light.error} style={styles.logoutIcon} />
            <ThemedText type="defaultSemiBold" style={{ color: Colors.light.error }}>Log Out</ThemedText>
          </TouchableOpacity>

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
  logoutIcon: {
    marginRight: Spacing.sm,
  },
  version: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    opacity: 0.4,
  },
});
