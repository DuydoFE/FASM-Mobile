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
import { getAssignmentsByCourseInstance } from '@/services/assignment.service';
import { Assignment } from '@/types/api.types';

export default function CourseAssignmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseInstanceId: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
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

  const getAssignmentStatus = (assignment: Assignment): { status: string; color: string } => {
    const now = new Date();
    const startDate = new Date(assignment.startDate);
    const deadline = new Date(assignment.deadline);
    const finalDeadline = new Date(assignment.finalDeadline);

    if (now < startDate) {
      return { status: 'Upcoming', color: Colors.light.icon };
    } else if (now <= deadline) {
      return { status: 'Open', color: Colors.light.success };
    } else if (now <= finalDeadline) {
      return { status: 'Late Submission', color: Colors.light.warning };
    } else {
      return { status: 'Closed', color: Colors.light.error };
    }
  };

  const handleAssignmentPress = (assignment: Assignment) => {
    router.push({
      pathname: '/assignment-details',
      params: {
        assignmentId: assignment.assignmentId.toString(),
      },
    });
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const { status, color } = getAssignmentStatus(assignment);

    return (
      <TouchableOpacity
        key={assignment.assignmentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleAssignmentPress(assignment)}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: color }]}>
            <ThemedText type="caption" style={styles.statusText}>
              {status}
            </ThemedText>
          </View>
          <ThemedText type="caption" style={styles.gradingScale}>
            {assignment.gradingScale}
          </ThemedText>
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

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <IconSymbol name="person.2.fill" size={12} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.infoText}>
              {assignment.numPeerReviewsRequired} peer reviews
            </ThemedText>
          </View>
          <View style={styles.infoItem}>
            <IconSymbol name="checkmark.seal.fill" size={12} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.infoText}>
              Pass: {assignment.passThreshold}%
            </ThemedText>
          </View>
          {assignment.isBlindReview && (
            <View style={styles.infoItem}>
              <IconSymbol name="eye.slash.fill" size={12} color={Colors.light.icon} />
              <ThemedText type="caption" style={styles.infoText}>Blind</ThemedText>
            </View>
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
});