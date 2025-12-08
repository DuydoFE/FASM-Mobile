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
import { getRubricById } from '@/services/rubric.service';
import { RubricDetail, RubricDetailCriteria } from '@/types/api.types';

const STATUS_COLORS: Record<string, string> = {
  'Upcoming': Colors.light.primary,
  'Active': Colors.light.success,
  'InReview': Colors.light.warning,
  'GradesPublished': Colors.light.accent,
  'Closed': Colors.light.icon,
  'Cancelled': Colors.light.error,
};

export default function RubricDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    rubricId: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const [rubric, setRubric] = useState<RubricDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rubricId = params.rubricId ? parseInt(params.rubricId, 10) : null;

  const fetchRubricDetails = async (showRefresh = false) => {
    if (!rubricId) {
      setError('Invalid rubric');
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

      const response = await getRubricById(rubricId);
      if (response.statusCode === 200 && response.data) {
        setRubric(response.data);
      } else {
        setError(response.message || 'Failed to fetch rubric details');
      }
    } catch (err) {
      setError('Failed to load rubric details. Please try again.');
      console.error('Error fetching rubric details:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRubricDetails();
  }, [rubricId]);

  const handleRefresh = () => {
    fetchRubricDetails(true);
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || Colors.light.icon;
  };

  const getScoringTypeIcon = (scoringType: string): string => {
    switch (scoringType) {
      case 'Scale':
        return 'slider.horizontal.3';
      case 'Binary':
        return 'checkmark.circle';
      case 'Rubric':
        return 'list.bullet.rectangle';
      default:
        return 'number.circle';
    }
  };

  const renderCriteriaItem = (criteria: RubricDetailCriteria, index: number) => {
    const isLast = rubric && index === rubric.criteria.length - 1;
    
    return (
      <View 
        key={criteria.criteriaId} 
        style={[
          styles.criteriaItem, 
          { backgroundColor: cardBg },
          !isLast && styles.criteriaItemBorder
        ]}
      >
        <View style={styles.criteriaHeader}>
          <View style={styles.criteriaIndex}>
            <ThemedText type="defaultSemiBold" style={styles.criteriaIndexText}>
              {index + 1}
            </ThemedText>
          </View>
          <View style={styles.criteriaHeaderContent}>
            <ThemedText type="defaultSemiBold" style={styles.criteriaTitle}>
              {criteria.title}
            </ThemedText>
            {criteria.isModified && (
              <View style={styles.modifiedBadge}>
                <ThemedText type="caption" style={styles.modifiedBadgeText}>
                  Modified
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        <ThemedText type="default" style={styles.criteriaDescription}>
          {criteria.description}
        </ThemedText>

        <View style={styles.criteriaMetrics}>
          <View style={styles.metricItem}>
            <IconSymbol 
              name={getScoringTypeIcon(criteria.scoringType)} 
              size={14} 
              color={Colors.light.icon} 
            />
            <ThemedText type="caption" style={styles.metricLabel}>
              {criteria.scoringType}
            </ThemedText>
          </View>

          <View style={styles.metricItem}>
            <IconSymbol name="scalemass" size={14} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.metricLabel}>
              Weight: {criteria.weight}%
            </ThemedText>
          </View>

          <View style={styles.metricItem}>
            <IconSymbol name="star.fill" size={14} color={Colors.light.warning} />
            <ThemedText type="caption" style={styles.metricLabel}>
              Max: {criteria.maxScore}
            </ThemedText>
          </View>
        </View>

        <View style={styles.criteriaFooter}>
          <View style={[styles.scoreLabelBadge, { backgroundColor: `${primaryColor}15` }]}>
            <ThemedText type="caption" style={{ color: primaryColor, fontWeight: '600' }}>
              {criteria.scoreLabel}
            </ThemedText>
          </View>
          {criteria.criteriaFeedbackCount > 0 && (
            <View style={styles.feedbackCount}>
              <IconSymbol name="bubble.left.fill" size={12} color={Colors.light.icon} />
              <ThemedText type="caption" style={styles.feedbackCountText}>
                {criteria.criteriaFeedbackCount} feedback
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading rubric...
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
            onPress={() => fetchRubricDetails()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!rubric) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            Rubric not found
          </ThemedText>
        </View>
      );
    }

    const statusColor = getStatusColor(rubric.assignmentStatus);

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
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText type="caption" style={{ color: statusColor, fontWeight: '600' }}>
            {rubric.assignmentStatus}
          </ThemedText>
        </View>

        {/* Course & Class Info */}
        <View style={styles.courseInfo}>
          <ThemedText type="caption" style={styles.courseName}>
            {rubric.courseName}
          </ThemedText>
          <ThemedText type="caption" style={styles.className}>
            {rubric.className}
          </ThemedText>
        </View>

        {/* Title */}
        <ThemedText type="largeTitle" style={styles.title}>
          {rubric.title}
        </ThemedText>

        {/* Template Info */}
        <View style={[styles.templateBadge, { backgroundColor: cardBg }]}>
          <IconSymbol name="doc.on.doc" size={16} color={Colors.light.primary} />
          <ThemedText type="default" style={styles.templateText}>
            Template: {rubric.templateTitle}
          </ThemedText>
        </View>

        {/* Assignment Info Card */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="doc.text.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Assignment
            </ThemedText>
          </View>
          <View style={styles.assignmentInfo}>
            <ThemedText type="default" style={styles.assignmentTitle}>
              {rubric.assignmentTitle}
            </ThemedText>
          </View>
        </View>

        {/* Rubric Summary Card */}
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="chart.bar.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Rubric Summary
            </ThemedText>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <ThemedText type="caption" style={styles.summaryLabel}>
                Criteria Count
              </ThemedText>
              <ThemedText type="title" style={styles.summaryValue}>
                {rubric.criteriaCount}
              </ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText type="caption" style={styles.summaryLabel}>
                Total Weight
              </ThemedText>
              <ThemedText type="title" style={[
                styles.summaryValue,
                {
                  color: rubric.criteria.reduce((sum, c) => sum + c.weight, 0) === 100
                    ? Colors.light.success
                    : Colors.light.warning
                }
              ]}>
                {rubric.criteria.reduce((sum, c) => sum + c.weight, 0)}%
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Criteria Section */}
        <View style={styles.criteriaSection}>
          <View style={styles.criteriaSectionHeader}>
            <IconSymbol name="list.bullet.rectangle.fill" size={18} color={primaryColor} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Criteria ({rubric.criteria.length})
            </ThemedText>
          </View>

          <View style={[styles.criteriaList, { backgroundColor: cardBg }]}>
            {rubric.criteria.map((criteria, index) => renderCriteriaItem(criteria, index))}
          </View>
        </View>

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
              Rubric Details
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
  statusBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  courseInfo: {
    marginBottom: Spacing.xs,
  },
  courseName: {
    opacity: 0.6,
  },
  className: {
    opacity: 0.5,
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    marginBottom: Spacing.md,
  },
  templateBadge: {
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
  templateText: {
    fontWeight: '600',
    fontSize: 13,
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
  assignmentInfo: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  assignmentTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  summaryGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    opacity: 0.5,
    fontSize: 11,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  criteriaSection: {
    marginBottom: Spacing.md,
  },
  criteriaSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  criteriaList: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.light.sm,
  },
  criteriaItem: {
    padding: Spacing.md,
  },
  criteriaItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  criteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  criteriaIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  criteriaIndexText: {
    fontSize: 14,
  },
  criteriaHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  criteriaTitle: {
    fontSize: 15,
    flex: 1,
  },
  modifiedBadge: {
    backgroundColor: 'rgba(255,149,0,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  modifiedBadgeText: {
    color: Colors.light.warning,
    fontWeight: '600',
    fontSize: 10,
  },
  criteriaDescription: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  criteriaMetrics: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    opacity: 0.6,
    fontSize: 11,
  },
  criteriaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  feedbackCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  feedbackCountText: {
    opacity: 0.6,
    fontSize: 11,
  },
});