import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Assignment Due Soon',
    message: 'OOP Lab 3 is due tomorrow at 11:59 PM. Don\'t forget to submit!',
    time: '2 hours ago',
    type: 'alert',
    read: false,
    icon: 'exclamationmark.circle.fill',
    color: Colors.light.error,
  },
  {
    id: '2',
    title: 'New Grade Posted',
    message: 'Your grade for Database Design Project has been posted.',
    time: 'Yesterday',
    type: 'success',
    read: true,
    icon: 'checkmark.circle.fill',
    color: Colors.light.success,
  },
  {
    id: '3',
    title: 'Class Cancelled',
    message: 'Mobile Development class on Friday is cancelled.',
    time: '2 days ago',
    type: 'info',
    read: true,
    icon: 'info.circle.fill',
    color: Colors.light.info,
  },
  {
    id: '4',
    title: 'New Assignment Available',
    message: 'Algorithm Analysis Report is now available.',
    time: '3 days ago',
    type: 'warning',
    read: true,
    icon: 'doc.text.fill',
    color: Colors.light.warning,
  },
  {
    id: '5',
    title: 'System Maintenance',
    message: 'FASM will be undergoing maintenance on Sunday from 2 AM to 4 AM.',
    time: '1 week ago',
    type: 'system',
    read: true,
    icon: 'gearshape.fill',
    color: Colors.light.icon,
  },
];

export default function NotificationsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const renderNotificationItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: item.read ? 'transparent' : `${item.color}08` }
      ]}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
        <IconSymbol name={item.icon as any} size={24} color={item.color} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <ThemedText type="defaultSemiBold" style={styles.title}>{item.title}</ThemedText>
          {!item.read && <View style={[styles.dot, { backgroundColor: item.color }]} />}
        </View>
        <ThemedText type="default" style={styles.message} numberOfLines={2}>{item.message}</ThemedText>
        <ThemedText type="caption" style={styles.time}>{item.time}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">Notifications</ThemedText>
          <TouchableOpacity>
            <ThemedText type="link">Mark all as read</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={NOTIFICATIONS}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    opacity: 0.7,
    marginBottom: 6,
    lineHeight: 20,
  },
  time: {
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 80, 
  },
});
