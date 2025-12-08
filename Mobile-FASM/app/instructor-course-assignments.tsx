import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { getAssignmentsByCourseInstance } from '@/services/assignment.service';
import { Assignment } from '@/types/api.types';

// Filter status options
const STATUS_FILTERS = [
  'All',
  'Draft',
  'Upcoming',
  'Active',
  'InReview',
  'Closed',
  'GradesPublished',
  'Cancelled',
] as const;

type StatusFilter = typeof STATUS_FILTERS[number];

export default function InstructorCourseAssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseInstanceId: string;
    courseName?: string;
    courseCode?: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<StatusFilter>('All');

  const courseInstanceId = params.courseInstanceId ? parseInt(params.courseInstanceId, 10) : null;
  
  // Get course info from params or first assignment
  const courseName = params.courseName || (assignments.length > 0 ? assignments[0].courseName : 'Course');
  const courseCode = params.courseCode || (assignments.length > 0 ? assignments[0].courseCode : '');

  // Filter assignments based on selected status
  const filteredAssignments = useMemo(() => {
    if (selectedFilter === 'All') {
      return assignments;
    }
    return assignments.filter(
      (a) => a.status.toLowerCase() === selectedFilter.toLowerCase() ||
             a.uiStatus?.toLowerCase() === selectedFilter.toLowerCase()
    );
  }, [assignments, selectedFilter]);

  const fetchAssignments = async (showRefresh = false) => {
    if (!courseInstanceId) {
      setError('Invalid course instance');
      setIsLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await getAssignmentsByCourseInstance(courseInstanceId);
      setAssignments(data);
    } catch (err) {
      setError('Failed to load assignments. Please try again.');
      console.error('Error fetching assignments:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseInstanceId]);

  const handleRefresh = () => {
    fetchAssignments(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'active':
        return Colors.light.success;
      case 'inreview':
      case 'in review':
        return Colors.light.primary;
      case 'closed':
      case 'completed':
        return Colors.light.icon;
      case 'upcoming':
        return Colors.light.warning;
      case 'draft':
        return '#9CA3AF'; // gray
      case 'gradespublished':
        return '#10B981'; // emerald
      case 'cancelled':
        return Colors.light.error;
      default:
        return Colors.light.icon;
    }
  };

  const getFilterColor = (filter: StatusFilter): string => {
    switch (filter.toLowerCase()) {
      case 'all':
        return Colors.light.primary;
      case 'active':
        return Colors.light.success;
      case 'inreview':
        return Colors.light.primary;
      case 'closed':
        return Colors.light.icon;
      case 'upcoming':
        return Colors.light.warning;
      case 'draft':
        return '#9CA3AF';
      case 'gradespublished':
        return '#10B981';
      case 'cancelled':
        return Colors.light.error;
      default:
        return Colors.light.icon;
    }
  };

  const getFilterIcon = (filter: StatusFilter): string => {
    switch (filter.toLowerCase()) {
      case 'all':
        return 'square.grid.2x2.fill';
      case 'active':
        return 'play.circle.fill';
      case 'inreview':
        return 'eye.fill';
      case 'closed':
        return 'checkmark.circle.fill';
      case 'upcoming':
        return 'clock.fill';
      case 'draft':
        return 'doc.fill';
      case 'gradespublished':
        return 'chart.bar.fill';
      case 'cancelled':
        return 'xmark.circle.fill';
      default:
        return 'circle.fill';
    }
  };

  const renderFilterTabs = () => (
    <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {STATUS_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter;
          const filterColor = getFilterColor(filter);
          const count = filter === 'All'
            ? assignments.length
            : assignments.filter(
                (a) => a.status.toLowerCase() === filter.toLowerCase() ||
                       a.uiStatus?.toLowerCase() === filter.toLowerCase()
              ).length;

          // Skip filters with 0 count (except All)
          if (count === 0 && filter !== 'All') {
            return null;
          }

          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                isSelected && [styles.filterChipSelected, { backgroundColor: filterColor }],
                !isSelected && styles.filterChipUnselected,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <IconSymbol
                name={getFilterIcon(filter) as any}
                size={14}
                color={isSelected ? '#FFFFFF' : filterColor}
              />
              <ThemedText
                type="caption"
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextSelected,
                  !isSelected && { color: filterColor },
                ]}
              >
                {filter === 'InReview' ? 'In Review' : filter === 'GradesPublished' ? 'Published' : filter}
              </ThemedText>
              <View style={[
                styles.filterCountBadge,
                isSelected
                  ? { backgroundColor: 'rgba(255,255,255,0.3)' }
                  : { backgroundColor: `${filterColor}20` }
              ]}>
                <ThemedText
                  type="caption"
                  style={[
                    styles.filterCountText,
                    isSelected && { color: '#FFFFFF' },
                    !isSelected && { color: filterColor },
                  ]}
                >
                  {count}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const handleAssignmentPress = (assignment: Assignment) => {
    // Navigate to instructor assignment details (can be implemented later)
    router.push({
      pathname: '/assignment-details',
      params: {
        assignmentId: assignment.assignmentId.toString(),
      },
    });
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const statusColor = getStatusColor(assignment.uiStatus || assignment.status);

    return (
      <TouchableOpacity
        key={assignment.assignmentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleAssignmentPress(assignment)}
      >
        {/* Header with Status */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText type="caption" style={styles.statusText}>
              {assignment.uiStatus || assignment.status}
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            {assignment.isOverdue && (
              <View style={[styles.overdueBadge, { backgroundColor: Colors.light.error }]}>
                <ThemedText type="caption" style={styles.overdueText}>Overdue</ThemedText>
              </View>
            )}
            <ThemedText type="caption" style={styles.gradingScale}>
              {assignment.gradingScale}
            </ThemedText>
          </View>
        </View>

        {/* Title & Description */}
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.assignmentTitle}>
            {assignment.title}
          </ThemedText>
          <ThemedText type="default" style={styles.description} numberOfLines={2}>
            {assignment.description}
          </ThemedText>
        </View>

        {/* Dates */}
        <View style={[styles.datesContainer, { borderTopColor: borderColor }]}>
          <View style={styles.dateItem}>
            <IconSymbol name="play.circle.fill" size={14} color={Colors.light.success} />
            <ThemedText type="caption" style={styles.dateLabel}>Start:</ThemedText>
            <ThemedText type="caption" style={styles.dateValue}>
              {formatShortDate(assignment.startDate)}
            </ThemedText>
          </View>
          <View style={styles.dateItem}>
            <IconSymbol name="clock.fill" size={14} color={Colors.light.warning} />
            <ThemedText type="caption" style={styles.dateLabel}>Due:</ThemedText>
            <ThemedText type="caption" style={styles.dateValue}>
              {formatShortDate(assignment.deadline)}
            </ThemedText>
          </View>
          <View style={styles.dateItem}>
            <IconSymbol name="xmark.circle.fill" size={14} color={Colors.light.error} />
            <ThemedText type="caption" style={styles.dateLabel}>Final:</ThemedText>
            <ThemedText type="caption" style={styles.dateValue}>
              {formatShortDate(assignment.finalDeadline)}
            </ThemedText>
          </View>
        </View>

        {/* Days Info & Settings */}
        <View style={styles.infoRow}>
          {assignment.daysUntilDeadline !== null && (
            <View style={styles.daysInfo}>
              <IconSymbol 
                name={assignment.daysUntilDeadline < 0 ? "exclamationmark.triangle.fill" : "calendar"} 
                size={12} 
                color={assignment.daysUntilDeadline < 0 ? Colors.light.error : Colors.light.icon} 
              />
              <ThemedText 
                type="caption" 
                style={[
                  styles.daysText,
                  assignment.daysUntilDeadline < 0 && { color: Colors.light.error }
                ]}
              >
                {assignment.daysUntilDeadline < 0 
                  ? `${Math.abs(assignment.daysUntilDeadline)} days overdue`
                  : assignment.daysUntilDeadline === 0 
                    ? 'Due today'
                    : `${assignment.daysUntilDeadline} days left`
                }
              </ThemedText>
            </View>
          )}
          <View style={styles.settingsRow}>
            {assignment.isBlindReview && (
              <View style={styles.settingItem}>
                <IconSymbol name="eye.slash.fill" size={12} color={Colors.light.icon} />
              </View>
            )}
            {assignment.includeAIScore && (
              <View style={styles.settingItem}>
                <IconSymbol name="cpu" size={12} color={Colors.light.icon} />
              </View>
            )}
            {assignment.allowCrossClass && (
              <View style={styles.settingItem}>
                <IconSymbol name="arrow.left.arrow.right" size={12} color={Colors.light.icon} />
              </View>
            )}
          </View>
        </View>

        {/* Weights Info */}
        <View style={styles.weightsRow}>
          <ThemedText type="caption" style={styles.weightText}>
            Instructor: {assignment.instructorWeight}%
          </ThemedText>
          <ThemedText type="caption" style={styles.weightText}>
            Peer: {assignment.peerWeight}%
          </ThemedText>
          {assignment.passThreshold && (
            <ThemedText type="caption" style={styles.weightText}>
              Pass: {assignment.passThreshold}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading assignments...
          </ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors.light.error} />
          <ThemedText type="default" style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={() => fetchAssignments()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (assignments.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            No assignments in this course yet
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={primaryColor}
          />
        }
      >
        {/* Assignments List */}
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map(renderAssignmentCard)
        ) : (
          <View style={styles.noResultsContainer}>
            <IconSymbol name="doc.text" size={32} color={Colors.light.icon} />
            <ThemedText type="default" style={styles.noResultsText}>
              No {selectedFilter !== 'All' ? selectedFilter.toLowerCase() : ''} assignments found
            </ThemedText>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color={primaryColor} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <ThemedText type="caption" style={styles.courseCode}>
              {courseCode}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {courseName}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: primaryColor }]}
            onPress={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <IconSymbol name="arrow.clockwise" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        {!isLoading && !error && assignments.length > 0 && renderFilterTabs()}

        {/* Assignment Count */}
        {!isLoading && !error && assignments.length > 0 && (
          <View style={styles.countContainer}>
            <ThemedText type="default" style={styles.countText}>
              {filteredAssignments.length} Assignment{filteredAssignments.length !== 1 ? 's' : ''}
              {selectedFilter !== 'All' && ` (${selectedFilter})`}
            </ThemedText>
          </View>
        )}

        {renderContent()}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  courseCode: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  headerTitle: {
    fontSize: 16,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  filterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  filterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  filterChipSelected: {
    ...Shadows.light.sm,
  },
  filterChipUnselected: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
  },
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  countText: {
    opacity: 0.6,
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  noResultsText: {
    opacity: 0.6,
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
  errorText: {
    marginTop: Spacing.md,
    textAlign: 'center',
    opacity: 0.6,
  },
  emptyText: {
    marginTop: Spacing.md,
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
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingBottom: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  overdueBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  overdueText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  gradingScale: {
    opacity: 0.6,
    fontSize: 12,
  },
  cardContent: {
    padding: Spacing.md,
  },
  assignmentTitle: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  description: {
    opacity: 0.6,
    fontSize: 13,
    lineHeight: 18,
  },
  datesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    opacity: 0.5,
    fontSize: 11,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  daysInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  daysText: {
    opacity: 0.6,
    fontSize: 11,
  },
  settingsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  settingItem: {
    opacity: 0.5,
  },
  weightsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  weightText: {
    opacity: 0.5,
    fontSize: 11,
  },
});