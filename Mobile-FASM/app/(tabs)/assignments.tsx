import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { instructorService } from '@/services/instructor.service';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  selectAssignmentsError,
  selectAssignmentsLoading,
  selectInstructorAssignments,
  setAssignmentsError,
  setAssignmentsLoading,
  setInstructorAssignments,
} from '@/store/slices/instructorSlice';
import { InstructorAssignment } from '@/types/api.types';

const FILTERS = ['All', 'Draft', 'Upcoming', 'Active', 'InReview', 'Closed', 'GradesPublished', 'Cancelled'];

/**
 * Get status color based on assignment status
 */
const getStatusColor = (status: string, isOverdue: boolean, colorScheme: 'light' | 'dark'): string => {
  const colors = Colors[colorScheme];
  if (isOverdue) return colors.error;
  switch (status) {
    case 'Draft':
      return colors.icon;
    case 'Upcoming':
      return colors.primary;
    case 'Active':
      return colors.accent;
    case 'InReview':
      return colors.warning;
    case 'Closed':
      return colors.textSecondary;
    case 'GradesPublished':
      return colors.success;
    case 'Cancelled':
      return colors.error;
    default:
      return colors.primary;
  }
};

/**
 * Format date string to readable format
 */
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AssignmentsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const assignments = useAppSelector(selectInstructorAssignments);
  const isLoading = useAppSelector(selectAssignmentsLoading);
  const error = useAppSelector(selectAssignmentsError);
  
  // Theme hooks
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const shadows = Shadows[colorScheme];

  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const inputBg = useThemeColor({}, 'background');
  const modalBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = colors.border;
  const iconColor = colors.icon;

  /**
   * Fetch assignments from API
   */
  const fetchAssignments = async () => {
    if (!user?.userId) return;

    dispatch(setAssignmentsLoading(true));
    const response = await instructorService.getInstructorAssignments(user.userId);

    if (response.statusCode === 200 && response.data) {
      dispatch(setInstructorAssignments(response.data));
    } else {
      dispatch(setAssignmentsError(response.message || 'Failed to fetch assignments'));
    }
  };

  /**
   * Handle pull-to-refresh
   */
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAssignments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAssignments();
  }, [user?.userId]);


  /**
   * Filter assignments based on active filter
   */
  const filteredAssignments = activeFilter === 'All'
    ? assignments
    : assignments.filter((a) => a.uiStatus === activeFilter);

  const renderAssignmentItem = ({ item }: { item: InstructorAssignment }) => {
    const statusColor = getStatusColor(item.uiStatus, item.isOverdue, colorScheme);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }, shadows.sm]}
        activeOpacity={0.7}
      >
        <View style={[styles.cardHeader, { borderLeftColor: statusColor }]}>
          <View style={styles.headerContent}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
              {item.title}
            </ThemedText>
            <ThemedText type="caption" style={styles.courseName}>
              {item.courseName} - {item.sectionCode}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <ThemedText type="caption" style={{ color: statusColor, fontWeight: '600' }}>
              {item.uiStatus}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardBody}>
          <ThemedText type="caption" numberOfLines={2} style={styles.description}>
            {item.description}
          </ThemedText>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <IconSymbol name="person.2.fill" size={14} color={iconColor} />
              <ThemedText type="caption" style={styles.statText}>
                {item.submissionCount}/{item.studentCount} submitted
              </ThemedText>
            </View>
            {item.daysUntilDeadline !== 0 && (
              <View style={styles.statItem}>
                <IconSymbol
                  name={item.daysUntilDeadline < 0 ? 'exclamationmark.triangle.fill' : 'clock.fill'}
                  size={14}
                  color={item.daysUntilDeadline < 0 ? colors.error : iconColor}
                />
                <ThemedText
                  type="caption"
                  style={[
                    styles.statText,
                    item.daysUntilDeadline < 0 && { color: colors.error },
                  ]}
                >
                  {item.daysUntilDeadline < 0
                    ? `${Math.abs(item.daysUntilDeadline)} days overdue`
                    : `${item.daysUntilDeadline} days left`}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.cardFooter, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
          <View style={styles.dateContainer}>
            <IconSymbol name="calendar" size={14} color={iconColor} style={styles.dateIcon} />
            <ThemedText type="caption" style={styles.dateText}>
              Due: {formatDate(item.deadline)}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={16} color={iconColor} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">Assignments</ThemedText>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && { backgroundColor: primaryColor },
                  activeFilter !== filter && { backgroundColor: cardBg, borderWidth: 1, borderColor }
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterText,
                    activeFilter === filter && { color: '#FFFFFF' }
                  ]}
                >
                  {filter}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText type="caption" style={styles.loadingText}>
              Loading assignments...
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle.fill" size={48} color={colors.error} />
            <ThemedText type="subtitle" style={[styles.errorText, { color: colors.error }]}>
              {error}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: primaryColor }]}
              onPress={fetchAssignments}
            >
              <ThemedText type="defaultSemiBold" style={styles.retryButtonText}>
                Retry
              </ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredAssignments}
            renderItem={renderAssignmentItem}
            keyExtractor={(item) => item.assignmentId.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <IconSymbol name="doc.text" size={48} color={iconColor} />
                <ThemedText type="subtitle" style={styles.emptyText}>
                  No assignments found
                </ThemedText>
              </View>
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
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  filterContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  filterText: {
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  courseName: {
    opacity: 0.6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: Spacing.xs,
  },
  dateText: {
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    marginTop: Spacing.md,
    opacity: 0.5,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
  },
  cardBody: {
    marginBottom: Spacing.md,
  },
  description: {
    opacity: 0.7,
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    opacity: 0.7,
  },
  // Modal styles - Enhanced Pop-up Design
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalWrapper: {
    maxHeight: '92%',
  },
  modalContainer: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '100%',
  },
  modalHandleContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  modalHandle: {
    width: 40,
    height: 5,
    borderRadius: BorderRadius.full,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cancelText: {
    // Color set dynamically
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: 18,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
    maxHeight: 500,
  },
  formSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  pickerDropdown: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    maxHeight: 200,
  },
  pickerItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  numberInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  // Date Picker Styles
  datePickerContainer: {
    borderTopWidth: 1,
    paddingBottom: Spacing.lg,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  datePicker: {
    height: 200,
  },
});
