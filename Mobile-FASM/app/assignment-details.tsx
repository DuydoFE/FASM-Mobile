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
import { getAssignmentDetails, getPeerReviewTracking } from '@/services/assignment.service';
import { AssignmentDetail, PeerReviewTracking } from '@/types/api.types';

export default function AssignmentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    assignmentId: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [peerReviewTracking, setPeerReviewTracking] = useState<PeerReviewTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignmentId = params.assignmentId ? parseInt(params.assignmentId, 10) : null;

  const fetchAssignmentDetails = async (showRefresh = false) => {
    if (!assignmentId) {
      setError('Invalid assignment');
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

      const [assignmentData, trackingData] = await Promise.all([
        getAssignmentDetails(assignmentId),
        getPeerReviewTracking(assignmentId).catch(() => null),
      ]);
      
      setAssignment(assignmentData);
      setPeerReviewTracking(trackingData);
    } catch (err) {
      setError('Failed to load assignment details. Please try again.');
      console.error('Error fetching assignment details:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const handleRefresh = () => {
    fetchAssignmentDetails(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading assignment...
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
            onPress={() => fetchAssignmentDetails()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!assignment) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            Assignment not found
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
        {/* Course Info Badge */}
        <View style={[styles.courseInfoBadge, { backgroundColor: primaryColor }]}>
          <ThemedText type="caption" style={styles.courseCodeText}>
            {assignment.courseCode}
          </ThemedText>
          <ThemedText type="caption" style={styles.sectionCodeText}>
            {assignment.sectionCode}
          </ThemedText>
        </View>

        {/* Course Name */}
        <ThemedText type="default" style={styles.courseName}>
          {assignment.courseName}
        </ThemedText>

        {/* Title */}
        <ThemedText type="largeTitle" style={styles.title}>
          {assignment.title}
        </ThemedText>

        {/* Grading Scale Badge */}
        <View style={[styles.gradingBadge, { backgroundColor: cardBg }]}>
          <IconSymbol name="chart.bar.fill" size={16} color={Colors.light.primary} />
          <ThemedText type="default" style={styles.gradingText}>
            {assignment.gradingScale}
          </ThemedText>
        </View>

        {/* Description Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="doc.text.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Description
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.sectionContent}>
            {assignment.description}
          </ThemedText>
        </View>

        {/* Guidelines Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="list.bullet.rectangle.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Guidelines
            </ThemedText>
          </View>
          <ThemedText type="default" style={styles.sectionContent}>
            {assignment.guidelines}
          </ThemedText>
        </View>

        {/* Dates Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="calendar" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Important Dates
            </ThemedText>
          </View>
          
          <View style={styles.dateRow}>
            <View style={styles.dateIcon}>
              <IconSymbol name="play.circle.fill" size={16} color={Colors.light.success} />
            </View>
            <View style={styles.dateInfo}>
              <ThemedText type="caption" style={styles.dateLabel}>Start Date</ThemedText>
              <ThemedText type="default" style={styles.dateValue}>
                {formatDate(assignment.startDate)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.dateRow, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <View style={styles.dateIcon}>
              <IconSymbol name="clock.fill" size={16} color={Colors.light.warning} />
            </View>
            <View style={styles.dateInfo}>
              <ThemedText type="caption" style={styles.dateLabel}>Deadline</ThemedText>
              <ThemedText type="default" style={styles.dateValue}>
                {formatDate(assignment.deadline)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.dateRow, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <View style={styles.dateIcon}>
              <IconSymbol name="person.2.fill" size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.dateInfo}>
              <ThemedText type="caption" style={styles.dateLabel}>Review Deadline</ThemedText>
              <ThemedText type="default" style={styles.dateValue}>
                {formatDate(assignment.reviewDeadline)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.dateRow, { borderTopColor: borderColor, borderTopWidth: 1 }]}>
            <View style={styles.dateIcon}>
              <IconSymbol name="xmark.circle.fill" size={16} color={Colors.light.error} />
            </View>
            <View style={styles.dateInfo}>
              <ThemedText type="caption" style={styles.dateLabel}>Final Deadline</ThemedText>
              <ThemedText type="default" style={styles.dateValue}>
                {formatDate(assignment.finalDeadline)}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Grading Info Section */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="graduationcap.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Grading Information
            </ThemedText>
          </View>
          
          <View style={styles.gradingInfoGrid}>
            <View style={styles.gradingInfoItem}>
              <ThemedText type="caption" style={styles.gradingInfoLabel}>Pass Threshold</ThemedText>
              <ThemedText type="title" style={[styles.gradingInfoValue, { color: Colors.light.success }]}>
                {assignment.passThreshold}%
              </ThemedText>
            </View>
            
            <View style={styles.gradingInfoItem}>
              <ThemedText type="caption" style={styles.gradingInfoLabel}>Peer Reviews</ThemedText>
              <ThemedText type="title" style={styles.gradingInfoValue}>
                {assignment.numPeerReviewsRequired}
              </ThemedText>
            </View>
            
            <View style={styles.gradingInfoItem}>
              <ThemedText type="caption" style={styles.gradingInfoLabel}>Instructor Weight</ThemedText>
              <ThemedText type="title" style={styles.gradingInfoValue}>
                {assignment.instructorWeight}%
              </ThemedText>
            </View>
            
            <View style={styles.gradingInfoItem}>
              <ThemedText type="caption" style={styles.gradingInfoLabel}>Peer Weight</ThemedText>
              <ThemedText type="title" style={styles.gradingInfoValue}>
                {assignment.peerWeight}%
              </ThemedText>
            </View>
          </View>

          <View style={styles.gradingFlags}>
            {assignment.isBlindReview && (
              <View style={styles.flagItem}>
                <IconSymbol name="eye.slash.fill" size={14} color={Colors.light.icon} />
                <ThemedText type="caption" style={styles.flagText}>Blind Review</ThemedText>
              </View>
            )}
            {assignment.includeAIScore && (
              <View style={styles.flagItem}>
                <IconSymbol name="brain.head.profile" size={14} color={Colors.light.icon} />
                <ThemedText type="caption" style={styles.flagText}>AI Score Included</ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Peer Review Tracking Section */}
        {peerReviewTracking && (
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="person.2.fill" size={18} color={primaryColor} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Peer Reviews
              </ThemedText>
            </View>
            
            <View style={styles.peerReviewContent}>
              <View style={styles.peerReviewStats}>
                <View style={styles.peerReviewStatItem}>
                  <ThemedText type="caption" style={styles.peerReviewStatLabel}>
                    Completed / Required
                  </ThemedText>
                  <ThemedText type="title" style={styles.peerReviewStatValue}>
                    {peerReviewTracking.completedReviewsCount}/{peerReviewTracking.numPeerReviewsRequired}
                  </ThemedText>
                </View>
                
                <View style={styles.peerReviewStatItem}>
                  <ThemedText type="caption" style={styles.peerReviewStatLabel}>
                    Status
                  </ThemedText>
                  <View style={[
                    styles.statusBadge,
                    {
                      backgroundColor: peerReviewTracking.status === 'InReview'
                        ? Colors.light.primary
                        : peerReviewTracking.status === 'Completed'
                          ? Colors.light.success
                          : peerReviewTracking.status === 'Pending'
                            ? Colors.light.warning
                            : Colors.light.icon
                    }
                  ]}>
                    <ThemedText type="caption" style={styles.statusBadgeText}>
                      {peerReviewTracking.status}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Pending Reviews Info */}
              {peerReviewTracking.pendingReviewsCount > 0 && (
                <View style={styles.pendingReviewsInfo}>
                  <IconSymbol name="clock.fill" size={14} color={Colors.light.warning} />
                  <ThemedText type="caption" style={styles.pendingReviewsText}>
                    {peerReviewTracking.pendingReviewsCount} review{peerReviewTracking.pendingReviewsCount !== 1 ? 's' : ''} pending
                  </ThemedText>
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.peerReviewButton,
                  {
                    backgroundColor: peerReviewTracking.completedReviewsCount < peerReviewTracking.numPeerReviewsRequired
                      ? primaryColor
                      : Colors.light.success,
                  }
                ]}
                disabled={peerReviewTracking.completedReviewsCount >= peerReviewTracking.numPeerReviewsRequired}
                onPress={() => {
                  router.push({
                    pathname: '/peer-review',
                    params: {
                      assignmentId: assignmentId?.toString() || '',
                    },
                  });
                }}
              >
                <IconSymbol name="pencil.and.outline" size={18} color="#FFFFFF" />
                <ThemedText type="default" style={styles.peerReviewButtonText}>
                  {peerReviewTracking.completedReviewsCount >= peerReviewTracking.numPeerReviewsRequired
                    ? 'All Reviews Completed'
                    : 'Start Peer Review'}
                </ThemedText>
              </TouchableOpacity>
            </View>
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
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Assignment Details
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
  courseInfoBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  courseCodeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionCodeText: {
    color: 'rgba(255,255,255,0.8)',
  },
  courseName: {
    opacity: 0.6,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
    marginBottom: Spacing.md,
  },
  gradingBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
    ...Shadows.light.sm,
  },
  gradingText: {
    fontWeight: '600',
  },
  section: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.light.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    lineHeight: 22,
    opacity: 0.8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  dateIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    opacity: 0.5,
    fontSize: 11,
  },
  dateValue: {
    fontSize: 14,
  },
  gradingInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  gradingInfoItem: {
    width: '50%',
    paddingVertical: Spacing.sm,
  },
  gradingInfoLabel: {
    opacity: 0.5,
    fontSize: 11,
    marginBottom: 2,
  },
  gradingInfoValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  gradingFlags: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.lg,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  flagText: {
    opacity: 0.6,
  },
  peerReviewContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  peerReviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  peerReviewStatItem: {
    flex: 1,
  },
  peerReviewStatLabel: {
    opacity: 0.5,
    fontSize: 11,
    marginBottom: 4,
  },
  peerReviewStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  pendingReviewsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.sm,
  },
  pendingReviewsText: {
    color: Colors.light.warning,
    fontWeight: '500',
  },
  peerReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadows.light.sm,
  },
  peerReviewButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});