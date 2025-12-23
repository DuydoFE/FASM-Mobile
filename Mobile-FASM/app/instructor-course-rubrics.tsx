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
import { getRubricsByUserIdAndCourseInstance } from '@/services/rubric.service';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Rubric } from '@/types/api.types';

export default function InstructorCourseRubricsScreen() {
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

  const user = useAppSelector(selectCurrentUser);

  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const courseInstanceId = params.courseInstanceId ? parseInt(params.courseInstanceId, 10) : null;
  
  // Get course info from params
  const courseName = params.courseName || 'Course';
  const courseCode = params.courseCode || '';

  const fetchRubrics = async (showRefresh = false) => {
    if (!courseInstanceId || !user?.userId) {
      setError('Invalid course instance or user');
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

      const response = await getRubricsByUserIdAndCourseInstance(user.userId, courseInstanceId);
      setRubrics(response.data || []);
    } catch (err) {
      setError('Failed to load rubrics. Please try again.');
      console.error('Error fetching rubrics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRubrics();
  }, [courseInstanceId, user?.userId]);

  const handleRefresh = () => {
    fetchRubrics(true);
  };

  const handleRubricPress = (rubric: Rubric) => {
    router.push({
      pathname: '/rubric-detail',
      params: {
        rubricId: rubric.rubricId.toString(),
      },
    });
  };

  const getStatusColor = (status: string | null): string => {
    if (!status) return Colors.light.icon;
    
    switch (status.toLowerCase()) {
      case 'active':
        return Colors.light.success;
      case 'draft':
        return '#9CA3AF';
      case 'closed':
      case 'completed':
        return Colors.light.icon;
      default:
        return Colors.light.primary;
    }
  };

  const renderRubricCard = (rubric: Rubric) => {
    const statusColor = getStatusColor(rubric.assignmentStatus);
    const isTemplate = !rubric.assignmentId;

    return (
      <TouchableOpacity
        key={rubric.rubricId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleRubricPress(rubric)}
      >
        {/* Header with Status */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            {isTemplate && (
              <View style={[styles.templateBadge, { backgroundColor: `${Colors.light.primary}15` }]}>
                <IconSymbol name="document.badge.gearshape" size={12} color={Colors.light.primary} />
                <ThemedText type="caption" style={[styles.templateText, { color: Colors.light.primary }]}>
                  Template
                </ThemedText>
              </View>
            )}
            {rubric.assignmentStatus && (
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <ThemedText type="caption" style={styles.statusText}>
                  {rubric.assignmentStatus}
                </ThemedText>
              </View>
            )}
          </View>
          {rubric.isModified && (
            <View style={[styles.modifiedBadge, { backgroundColor: `${Colors.light.warning}15` }]}>
              <IconSymbol name="pencil" size={10} color={Colors.light.warning} />
              <ThemedText type="caption" style={[styles.modifiedText, { color: Colors.light.warning }]}>
                Modified
              </ThemedText>
            </View>
          )}
        </View>

        {/* Title & Description */}
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.rubricTitle}>
            {rubric.title}
          </ThemedText>
          
          {rubric.assignmentTitle && (
            <View style={styles.assignmentInfo}>
              <IconSymbol name="doc.text" size={14} color={Colors.light.icon} />
              <ThemedText type="default" style={styles.assignmentTitle} numberOfLines={1}>
                {rubric.assignmentTitle}
              </ThemedText>
            </View>
          )}

          {rubric.templateTitle && (
            <View style={styles.templateInfo}>
              <IconSymbol name="square.on.square" size={14} color={Colors.light.icon} />
              <ThemedText type="caption" style={styles.templateTitleText} numberOfLines={1}>
                Based on: {rubric.templateTitle}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Criteria & Scale Info */}
        <View style={[styles.infoContainer, { borderTopColor: borderColor }]}>
          <View style={styles.infoItem}>
            <IconSymbol name="list.bullet" size={14} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.infoText}>
              {rubric.criteriaCount} {rubric.criteriaCount === 1 ? 'Criterion' : 'Criteria'}
            </ThemedText>
          </View>
          
          {rubric.gradingScale && (
            <View style={styles.infoItem}>
              <IconSymbol name="chart.bar.fill" size={14} color={Colors.light.icon} />
              <ThemedText type="caption" style={styles.infoText}>
                {rubric.gradingScale}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Assignments Using Template */}
        {rubric.assignmentsUsingTemplate && rubric.assignmentsUsingTemplate.length > 0 && (
          <View style={[styles.usageContainer, { backgroundColor: `${Colors.light.primary}08`, borderTopColor: borderColor }]}>
            <IconSymbol name="doc.on.doc" size={12} color={Colors.light.primary} />
            <ThemedText type="caption" style={[styles.usageText, { color: Colors.light.primary }]}>
              Used in {rubric.assignmentsUsingTemplate.length} assignment{rubric.assignmentsUsingTemplate.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        )}

        {/* View Action */}
        <View style={[styles.viewAction, { borderTopColor: borderColor }]}>
          <IconSymbol name="eye.fill" size={14} color={Colors.light.primary} />
          <ThemedText type="caption" style={styles.viewActionText}>
            Tap to view details
          </ThemedText>
          <IconSymbol name="chevron.right" size={14} color={Colors.light.primary} />
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
            Loading rubrics...
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
            onPress={() => fetchRubrics()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (rubrics.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="doc.text.magnifyingglass" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            No rubrics found for this course
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
        {rubrics.map(renderRubricCard)}
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
              {courseName} - Rubrics
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

        {/* Rubric Count */}
        {!isLoading && !error && rubrics.length > 0 && (
          <View style={styles.countContainer}>
            <ThemedText type="default" style={styles.countText}>
              {rubrics.length} Rubric{rubrics.length !== 1 ? 's' : ''}
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
  countContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  countText: {
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
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  templateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  templateText: {
    fontWeight: '600',
    fontSize: 11,
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
  modifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  modifiedText: {
    fontWeight: '600',
    fontSize: 10,
  },
  cardContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  rubricTitle: {
    fontSize: 16,
    marginBottom: Spacing.xs,
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  assignmentTitle: {
    opacity: 0.7,
    fontSize: 13,
    flex: 1,
  },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  templateTitleText: {
    opacity: 0.6,
    fontSize: 12,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoText: {
    opacity: 0.6,
    fontSize: 12,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
  },
  usageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  viewActionText: {
    color: Colors.light.primary,
    fontWeight: '600',
    flex: 1,
    marginLeft: Spacing.xs,
  },
});