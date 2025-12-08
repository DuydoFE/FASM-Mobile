import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { getStudentAssignmentsWithTracking } from '@/services/assignment.service';
import { AssignmentStatus, StudentAssignmentWithTracking } from '@/types/api.types';

// Status color mapping for assignment status enum
const STATUS_COLORS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.Active]: '#22C55E', // Green - Active assignments
  [AssignmentStatus.InReview]: '#3B82F6', // Blue - In review phase
  [AssignmentStatus.Closed]: '#6B7280', // Gray - Closed assignments
  [AssignmentStatus.Cancelled]: '#EF4444', // Red - Cancelled assignments
  [AssignmentStatus.UpComing]: '#F59E0B', // Orange/Amber - Upcoming assignments
  [AssignmentStatus.GradesPublished]: '#8B5CF6', // Purple - Grades published
};

export default function CourseAssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseInstanceId: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [assignments, setAssignments] = useState<StudentAssignmentWithTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseInstanceId = params.courseInstanceId ? parseInt(params.courseInstanceId, 10) : null;
  
  // Get course info from first assignment (API returns courseName and courseCode)
  const courseName = assignments.length > 0 ? assignments[0].courseName : 'Course';
  const courseCode = assignments.length > 0 ? assignments[0].courseCode : '';

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

      const data = await getStudentAssignmentsWithTracking(courseInstanceId);
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: AssignmentStatus): string => {
    return STATUS_COLORS[status] || Colors.light.icon;
  };

  const getStatusDisplayName = (status: AssignmentStatus): string => {
    switch (status) {
      case AssignmentStatus.Active:
        return 'Active';
      case AssignmentStatus.InReview:
        return 'In Review';
      case AssignmentStatus.Closed:
        return 'Closed';
      case AssignmentStatus.Cancelled:
        return 'Cancelled';
      case AssignmentStatus.UpComing:
        return 'Upcoming';
      case AssignmentStatus.GradesPublished:
        return 'Grades Published';
      default:
        return status;
    }
  };

  const handleAssignmentPress = (assignment: StudentAssignmentWithTracking) => {
    router.push({
      pathname: '/assignment-details',
      params: {
        assignmentId: assignment.assignmentId.toString(),
      },
    });
  };

  const renderAssignmentCard = (assignment: StudentAssignmentWithTracking) => {
    const statusColor = getStatusColor(assignment.status);

    return (
      <TouchableOpacity
        key={assignment.assignmentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleAssignmentPress(assignment)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText type="caption" style={styles.statusText}>
              {getStatusDisplayName(assignment.status)}
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            {assignment.hasSubmission && (
              <View style={[styles.submittedBadge, { backgroundColor: Colors.light.success }]}>
                <ThemedText type="caption" style={styles.submittedText}>Submitted</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Title */}
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.assignmentTitle}>
            {assignment.title}
          </ThemedText>
        </View>

        {/* Dates */}
        <View style={[styles.datesContainer, { borderTopColor: borderColor }]}>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <IconSymbol name="play.circle.fill" size={14} color={Colors.light.success} />
              <ThemedText type="caption" style={styles.dateLabel}>Start:</ThemedText>
              <ThemedText type="caption" style={styles.dateValue}>
                {formatShortDate(assignment.startDate)}
              </ThemedText>
            </View>
            <View style={styles.dateItem}>
              <IconSymbol name="clock.fill" size={14} color={Colors.light.warning} />
              <ThemedText type="caption" style={styles.dateLabel}>Deadline:</ThemedText>
              <ThemedText type="caption" style={styles.dateValue}>
                {formatShortDate(assignment.deadline)}
              </ThemedText>
            </View>
          </View>
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <IconSymbol name="person.2.fill" size={14} color={Colors.light.primary} />
              <ThemedText type="caption" style={styles.dateLabel}>Review:</ThemedText>
              <ThemedText type="caption" style={styles.dateValue}>
                {formatShortDate(assignment.reviewDeadline)}
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
        </View>

        {/* Review Progress */}
        <View style={styles.reviewProgressContainer}>
          <View style={styles.reviewProgressHeader}>
            <IconSymbol name="person.2.fill" size={14} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.reviewProgressLabel}>
              Peer Review Progress
            </ThemedText>
          </View>
          <View style={styles.reviewProgressBar}>
            <View
              style={[
                styles.reviewProgressFill,
                {
                  width: `${(assignment.completedReviewsCount / assignment.numPeerReviewsRequired) * 100}%`,
                  backgroundColor: assignment.completedReviewsCount >= assignment.numPeerReviewsRequired
                    ? Colors.light.success
                    : Colors.light.primary
                }
              ]}
            />
          </View>
          <ThemedText type="caption" style={styles.reviewProgressText}>
            {assignment.completedReviewsCount} / {assignment.numPeerReviewsRequired} reviews completed
            {assignment.pendingReviewsCount > 0 && ` (${assignment.pendingReviewsCount} pending)`}
          </ThemedText>
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
            No assignments yet
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
        {assignments.map(renderAssignmentCard)}
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

        {/* Assignment Count */}
        {!isLoading && !error && assignments.length > 0 && (
          <View style={styles.countContainer}>
            <ThemedText type="default" style={styles.countText}>
              {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}
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
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  countText: {
    opacity: 0.6,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dateLabel: {
    opacity: 0.5,
    fontSize: 11,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: '500',
  },
  submittedBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  submittedText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 10,
  },
  reviewProgressContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  reviewProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  reviewProgressLabel: {
    opacity: 0.6,
    fontSize: 11,
  },
  reviewProgressBar: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  reviewProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  reviewProgressText: {
    opacity: 0.6,
    fontSize: 11,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    opacity: 0.6,
    fontSize: 11,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  daysText: {
    opacity: 0.6,
    fontSize: 11,
  },
});