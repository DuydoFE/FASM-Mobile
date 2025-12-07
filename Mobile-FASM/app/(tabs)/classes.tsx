import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAppSelector } from '@/store';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/slices/authSlice';
import { selectInstructorClasses, selectInstructorError, selectInstructorLoading } from '@/store/slices/instructorSlice';
import { InstructorClass } from '@/types/api.types';

// Color palette for class cards
const CLASS_COLORS = [
  Colors.light.primary,
  Colors.light.accent,
  Colors.light.success,
  Colors.light.warning,
  '#9333EA', // purple
  '#EC4899', // pink
];

/**
 * Get a consistent color for a class based on its ID
 */
const getClassColor = (classId: number): string => {
  return CLASS_COLORS[classId % CLASS_COLORS.length];
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Get status badge color
 */
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return Colors.light.success;
    case 'upcoming':
      return Colors.light.warning;
    case 'completed':
      return Colors.light.icon;
    default:
      return Colors.light.primary;
  }
};

export default function ClassesScreen() {
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');

  // Redux selectors
  const instructorClasses = useAppSelector(selectInstructorClasses);
  const isLoading = useAppSelector(selectInstructorLoading);
  const error = useAppSelector(selectInstructorError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);

  // Check if user is an instructor
  const isInstructor = currentUser?.roles?.includes('Instructor') ?? false;

  /**
   * Render a single class card
   */
  const renderClassCard = (item: InstructorClass) => {
    const cardColor = getClassColor(item.id);
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
      >
        <View style={[styles.cardBanner, { backgroundColor: cardColor }]}>
          <View style={styles.bannerHeader}>
            <View style={styles.codeBadge}>
              <ThemedText type="caption" style={styles.codeText}>{item.courseCode}</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.courseInstanceStatus) }]}>
              <ThemedText type="caption" style={styles.statusText}>{item.courseInstanceStatus}</ThemedText>
            </View>
          </View>
          <IconSymbol name="book.fill" size={24} color="rgba(255,255,255,0.3)" style={styles.bannerIcon} />
        </View>
        
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.className}>{item.courseName}</ThemedText>
          <ThemedText type="default" style={styles.courseInstance}>{item.courseInstanceName}</ThemedText>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <IconSymbol name="calendar" size={14} color={Colors.light.icon} style={styles.infoIcon} />
              <ThemedText type="caption" style={styles.infoText}>{item.semesterName}</ThemedText>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="person.2.fill" size={14} color={Colors.light.icon} style={styles.infoIcon} />
              <ThemedText type="caption" style={styles.infoText}>{item.studentCount} students</ThemedText>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <ThemedText type="caption" style={styles.dateLabel}>Start:</ThemedText>
              <ThemedText type="caption" style={styles.dateValue}>{formatDate(item.startDate)}</ThemedText>
            </View>
            <View style={styles.dateItem}>
              <ThemedText type="caption" style={styles.dateLabel}>End:</ThemedText>
              <ThemedText type="caption" style={styles.dateValue}>{formatDate(item.endDate)}</ThemedText>
            </View>
          </View>

          {item.isMainInstructor && (
            <View style={styles.mainInstructorBadge}>
              <IconSymbol name="star.fill" size={12} color={Colors.light.warning} style={styles.starIcon} />
              <ThemedText type="caption" style={styles.mainInstructorText}>Main Instructor</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state when no classes
   */
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="book.closed" size={64} color={Colors.light.icon} />
      <ThemedText type="title" style={styles.emptyTitle}>No Classes Yet</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        {isAuthenticated
          ? isInstructor
            ? "You don't have any assigned classes yet."
            : "Please log in with an instructor account to view your classes."
          : "Please log in to view your classes."}
      </ThemedText>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="exclamationmark.triangle" size={64} color={Colors.light.warning} />
      <ThemedText type="title" style={styles.emptyTitle}>Error Loading Classes</ThemedText>
      <ThemedText style={styles.emptySubtitle}>{error}</ThemedText>
    </View>
  );

  /**
   * Render loading state
   */
  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={primaryColor} />
      <ThemedText style={styles.loadingText}>Loading your classes...</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">My Classes</ThemedText>
          {isInstructor && (
            <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
              <IconSymbol name="plus" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            renderLoadingState()
          ) : error ? (
            renderErrorState()
          ) : instructorClasses.length > 0 ? (
            instructorClasses.map(renderClassCard)
          ) : (
            renderEmptyState()
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardBanner: {
    height: 80,
    padding: Spacing.md,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
  },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 11,
  },
  bannerIcon: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    transform: [{ scale: 2.5 }],
  },
  cardContent: {
    padding: Spacing.md,
  },
  className: {
    fontSize: 18,
    marginBottom: 4,
  },
  courseInstance: {
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: Spacing.xs,
  },
  infoText: {
    opacity: 0.6,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    opacity: 0.5,
    marginRight: 4,
  },
  dateValue: {
    fontWeight: '500',
  },
  mainInstructorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  starIcon: {
    marginRight: 4,
  },
  mainInstructorText: {
    color: Colors.light.warning,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    opacity: 0.6,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
});
