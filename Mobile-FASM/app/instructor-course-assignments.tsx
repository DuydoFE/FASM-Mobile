import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Pressable,
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
import { deleteAssignment, getAssignmentsByCourseInstance, publishAssignment } from '@/services/assignment.service';
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
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

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
        return 'circle.grid.3x3.fill';
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
    <View style={styles.filterContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                isSelected && { backgroundColor: primaryColor },
                !isSelected && { backgroundColor: cardBg, borderWidth: 1, borderColor: borderColor }
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <ThemedText
                type="caption"
                style={[
                  styles.filterText,
                  isSelected && { color: '#FFFFFF' }
                ]}
              >
                {filter === 'InReview' ? 'In Review' : filter === 'GradesPublished' ? 'Published' : filter}
              </ThemedText>
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

  const handlePublishAssignment = (assignment: Assignment) => {
    Alert.alert(
      'Publish Assignment',
      `Are you sure you want to publish "${assignment.title}"? This will make the assignment visible to students based on its start date.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Publish',
          style: 'default',
          onPress: async () => {
            try {
              setIsActionLoading(assignment.assignmentId);
              await publishAssignment(assignment.assignmentId);
              Alert.alert('Success', 'Assignment published successfully!');
              fetchAssignments(true);
            } catch (err) {
              console.error('Error publishing assignment:', err);
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to publish assignment. Please try again.'
              );
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${assignment.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(assignment.assignmentId);
              await deleteAssignment(assignment.assignmentId);
              Alert.alert('Success', 'Assignment deleted successfully!');
              fetchAssignments(true);
            } catch (err) {
              console.error('Error deleting assignment:', err);
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete assignment. Please try again.'
              );
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const openDropdown = (assignmentId: number, event: { nativeEvent: { pageX: number; pageY: number } }) => {
    const screenWidth = Dimensions.get('window').width;
    const dropdownWidth = 180;
    
    // Calculate position - align to the right side of the "..." button
    const rightOffset = screenWidth - event.nativeEvent.pageX - 24;
    
    setDropdownPosition({
      top: event.nativeEvent.pageY + 8,
      right: Math.max(16, rightOffset),
    });
    
    setDropdownVisible(assignmentId);
    
    // Animate dropdown opening
    Animated.spring(dropdownAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeDropdown = () => {
    Animated.timing(dropdownAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setDropdownVisible(null);
    });
  };

  const isDraftAssignment = (assignment: Assignment): boolean => {
    return assignment.status.toLowerCase() === 'draft' ||
           assignment.uiStatus?.toLowerCase() === 'draft';
  };

  const renderAssignmentCard = (assignment: Assignment) => {
    const statusColor = getStatusColor(assignment.uiStatus || assignment.status);
    const isDraft = isDraftAssignment(assignment);
    const isCurrentActionLoading = isActionLoading === assignment.assignmentId;

    return (
      <TouchableOpacity
        key={assignment.assignmentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleAssignmentPress(assignment)}
        disabled={isCurrentActionLoading}
      >
        {/* Loading Overlay */}
        {isCurrentActionLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={primaryColor} />
          </View>
        )}

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
            {/* More Options Button - Only for Draft */}
            {isDraft && (
              <TouchableOpacity
                style={styles.moreButton}
                onPress={(e) => openDropdown(assignment.assignmentId, e)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <IconSymbol name="ellipsis.vertical" size={18} color={Colors.light.icon} />
              </TouchableOpacity>
            )}
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

  const renderDropdownMenu = () => {
    if (dropdownVisible === null) return null;

    const assignment = assignments.find(a => a.assignmentId === dropdownVisible);
    if (!assignment) return null;

    const scaleValue = dropdownAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.95, 1],
    });

    const opacityValue = dropdownAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const translateY = dropdownAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-8, 0],
    });

    return (
      <Modal
        visible={dropdownVisible !== null}
        transparent
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <Pressable style={styles.dropdownOverlay} onPress={closeDropdown}>
          <Animated.View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: cardBg,
                borderColor: borderColor,
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                transform: [{ scale: scaleValue }, { translateY }],
                opacity: opacityValue,
              },
            ]}
          >
            {/* Menu Header */}
            <View style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText type="caption" style={styles.dropdownHeaderText}>
                Actions
              </ThemedText>
            </View>

            {/* Publish Option */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                closeDropdown();
                setTimeout(() => handlePublishAssignment(assignment), 200);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.dropdownIconContainer, styles.publishIconBg]}>
                <IconSymbol name="paperplane.fill" size={18} color={Colors.light.success} />
              </View>
              <View style={styles.dropdownTextContainer}>
                <ThemedText type="default" style={styles.dropdownItemText}>
                  Publish
                </ThemedText>
                <ThemedText type="caption" style={styles.dropdownItemSubtext}>
                  Make visible to students
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
            </TouchableOpacity>

            {/* Delete Option */}
            <TouchableOpacity
              style={[styles.dropdownItem, styles.dropdownItemDanger, { borderTopColor: `${Colors.light.error}20` }]}
              onPress={() => {
                closeDropdown();
                setTimeout(() => handleDeleteAssignment(assignment), 200);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.dropdownIconContainer, styles.deleteIconBg]}>
                <IconSymbol name="trash.fill" size={18} color={Colors.light.error} />
              </View>
              <View style={styles.dropdownTextContainer}>
                <ThemedText type="default" style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>
                  Delete
                </ThemedText>
                <ThemedText type="caption" style={styles.dropdownItemSubtext}>
                  Cannot be undone
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={`${Colors.light.error}80`} />
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
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
        
        {/* Dropdown Menu */}
        {renderDropdownMenu()}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: BorderRadius.lg,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    width: 240,
    borderRadius: BorderRadius.lg,
    ...Shadows.light.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  dropdownHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  dropdownHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: 'transparent',
  },
  dropdownItemDanger: {
    borderTopWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  dropdownIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishIconBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  deleteIconBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  dropdownTextContainer: {
    flex: 1,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownItemTextDanger: {
    color: Colors.light.error,
  },
  dropdownItemSubtext: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 2,
  },
});