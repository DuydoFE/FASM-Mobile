import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/services/notification.service';
import { Notification } from '@/types/api.types';

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  } else if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};

// Helper function to get icon and color based on notification type
const getNotificationStyle = (type: string): { icon: string; color: string } => {
  switch (type?.toLowerCase()) {
    case 'assignmentactive':
    case 'assignmentinreview':
    case 'assignmentclosed':
    case 'assignment':
    case 'new_assignment':
      return { icon: 'doc.text.fill', color: Colors.light.warning };
    case 'deadline':
    case 'due_soon':
      return { icon: 'exclamationmark.circle.fill', color: Colors.light.error };
    case 'grade':
    case 'grade_posted':
      return { icon: 'checkmark.circle.fill', color: Colors.light.success };
    case 'review':
    case 'peer_review':
      return { icon: 'person.2.fill', color: Colors.light.primary };
    case 'submission':
      return { icon: 'arrow.up.doc.fill', color: Colors.light.info };
    case 'system':
    case 'maintenance':
      return { icon: 'gearshape.fill', color: Colors.light.icon };
    case 'info':
      return { icon: 'info.circle.fill', color: Colors.light.info };
    case 'announcement':
      return { icon: 'megaphone.fill', color: Colors.light.primary };
    case 'course':
      return { icon: 'book.fill', color: Colors.light.primary };
    default:
      return { icon: 'bell.fill', color: Colors.light.primary };
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (showLoading: boolean = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const data = await getMyNotifications(false);
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchNotifications(false);
  }, []);

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.notificationId);
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n.notificationId === notification.notificationId
              ? { ...n, isRead: true }
              : n
          )
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    
    // Navigate based on notification type
    navigateByNotificationType(notification);
  };

  const navigateByNotificationType = (notification: Notification) => {
    const { type, assignmentId, courseInstanceId } = notification;
    
    switch (type?.toLowerCase()) {
      case 'assignmentactive':
      case 'assignmentinreview':
      case 'assignmentclosed':
      case 'new_assignment':
      case 'assignment':
        if (assignmentId) {
          router.push({
            pathname: '/assignment-details',
            params: { assignmentId: assignmentId.toString() },
          });
        }
        break;
      
      case 'grade':
      case 'grade_posted':
        if (assignmentId) {
          router.push({
            pathname: '/assignment-details',
            params: { assignmentId: assignmentId.toString() },
          });
        }
        break;
      
      case 'review':
      case 'peer_review':
        if (assignmentId) {
          router.push({
            pathname: '/peer-review',
            params: { assignmentId: assignmentId.toString() },
          });
        }
        break;
      
      case 'submission':
      case 'course':
        if (courseInstanceId) {
          router.push({
            pathname: '/course-assignments',
            params: { courseInstanceId: courseInstanceId.toString() },
          });
        }
        break;
      
      default:
        // If no specific route, navigate to notifications
        console.log('No navigation route for notification type:', type);
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotificationItem = ({ item }: { item: Notification }) => {
    const { icon, color } = getNotificationStyle(item.type);
    
    return (
      <TouchableOpacity 
        style={[
          styles.notificationItem, 
          { backgroundColor: item.isRead ? 'transparent' : `${color}08` }
        ]}
        activeOpacity={0.7}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <IconSymbol name={icon as any} size={24} color={color} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {!item.isRead && <View style={[styles.dot, { backgroundColor: color }]} />}
          </View>
          <ThemedText type="default" style={styles.message} numberOfLines={2}>
            {item.message}
          </ThemedText>
          <ThemedText type="caption" style={styles.time}>
            {formatRelativeTime(item.createdAt)}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="bell.slash" size={64} color={Colors.light.icon} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Notifications
      </ThemedText>
      <ThemedText type="default" style={styles.emptyMessage}>
        You're all caught up! Check back later for updates.
      </ThemedText>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="exclamationmark.triangle" size={64} color={Colors.light.error} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        Failed to Load
      </ThemedText>
      <ThemedText type="default" style={styles.emptyMessage}>
        {error}
      </ThemedText>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: primaryColor }]}
        onPress={() => fetchNotifications()}
      >
        <ThemedText type="default" style={styles.retryButtonText}>
          Retry
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <ThemedText type="largeTitle">Notifications</ThemedText>
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText type="default" style={styles.loadingText}>
              Loading notifications...
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText type="largeTitle">Notifications</ThemedText>
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: Colors.light.error }]}>
                <ThemedText type="caption" style={styles.badgeText}>
                  {unreadCount}
                </ThemedText>
              </View>
            )}
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead}>
              <ThemedText type="link">Mark all as read</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        {error ? (
          renderErrorState()
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.notificationId.toString()}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={renderEmptyState}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={primaryColor}
                colors={[primaryColor]}
              />
            }
          />
        )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyListContent: {
    flex: 1,
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
    flex: 1,
    marginRight: Spacing.sm,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    textAlign: 'center',
    opacity: 0.6,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
