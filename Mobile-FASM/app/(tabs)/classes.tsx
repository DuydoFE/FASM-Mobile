import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EnrollKeyModal } from '@/components/enroll-key-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { enrollWithKey, getStudentCourses } from '@/services/course-student.service';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { CourseStudent } from '@/types/api.types';

// Color palette for class cards
const CLASS_COLORS = [
  Colors.light.primary,
  Colors.light.accent,
  Colors.light.success,
  Colors.light.warning,
  '#9333EA', // purple
  '#EC4899', // pink
];

const PENDING_COLOR = Colors.light.warning;

const getColorForIndex = (index: number): string => {
  return CLASS_COLORS[index % CLASS_COLORS.length];
};

export default function ClassesScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const user = useAppSelector(selectCurrentUser);
  
  const [courses, setCourses] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [selectedPendingCourse, setSelectedPendingCourse] = useState<CourseStudent | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Split courses by status
  const { enrolledCourses, pendingCourses } = useMemo(() => {
    const enrolled: CourseStudent[] = [];
    const pending: CourseStudent[] = [];
    
    courses.forEach(course => {
      if (course.status.toLowerCase() === 'pending') {
        pending.push(course);
      } else {
        enrolled.push(course);
      }
    });
    
    return { enrolledCourses: enrolled, pendingCourses: pending };
  }, [courses]);

  const fetchCourses = async (showRefresh = false) => {
    if (!user?.userId) {
      setError('Please login to view your classes');
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
      
      const data = await getStudentCourses(user.userId);
      setCourses(data);
    } catch (err) {
      setError('Failed to load classes. Please try again.');
      console.error('Error fetching courses:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.userId]);

  const handleRefresh = () => {
    fetchCourses(true);
  };

  const handlePendingCoursePress = (course: CourseStudent) => {
    setSelectedPendingCourse(course);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedPendingCourse(null);
  };

  const handleEnrollWithKey = async (courseInstanceId: number, enrollKey: string) => {
    if (!user?.userId) {
      throw new Error('User not logged in');
    }
    
    await enrollWithKey(courseInstanceId, user.userId, enrollKey);
    // Refresh the courses list after successful enrollment
    await fetchCourses();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string, isPassed: boolean): string => {
    if (isPassed) return Colors.light.success;
    switch (status.toLowerCase()) {
      case 'enrolled':
      case 'active':
        return Colors.light.primary;
      case 'completed':
        return Colors.light.success;
      case 'pending':
        return Colors.light.warning;
      case 'dropped':
        return Colors.light.error;
      default:
        return Colors.light.icon;
    }
  };

  const handleEnrolledCoursePress = (course: CourseStudent) => {
    router.push({
      pathname: '/course-assignments',
      params: {
        courseInstanceId: course.courseInstanceId.toString(),
      },
    });
  };

  const renderCourseCard = (course: CourseStudent, index: number, isPending: boolean = false) => {
    const cardColor = isPending ? PENDING_COLOR : getColorForIndex(index);
    
    return (
      <TouchableOpacity
        key={course.courseStudentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={isPending ? () => handlePendingCoursePress(course) : () => handleEnrolledCoursePress(course)}
      >
        <View style={[styles.cardBanner, { backgroundColor: cardColor }]}>
          <View style={styles.codeBadge}>
            <ThemedText type="caption" style={styles.codeText}>{course.courseCode}</ThemedText>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(course.status, course.isPassed) }]} />
            <ThemedText type="caption" style={styles.statusText}>{course.status}</ThemedText>
          </View>
          <IconSymbol 
            name={isPending ? "key.fill" : "book.fill"} 
            size={24} 
            color="rgba(255,255,255,0.3)" 
            style={styles.bannerIcon} 
          />
        </View>
        
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.className}>{course.courseName}</ThemedText>
          <ThemedText type="default" style={styles.instanceName}>{course.courseInstanceName}</ThemedText>
          
          {course.instructorNames.length > 0 && (
            <View style={styles.infoRow}>
              <IconSymbol name="person.fill" size={14} color={Colors.light.icon} style={styles.infoIcon} />
              <ThemedText type="caption" style={styles.infoText}>
                {course.instructorNames.join(', ')}
              </ThemedText>
            </View>
          )}
          
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={14} color={Colors.light.icon} style={styles.infoIcon} />
            <ThemedText type="caption" style={styles.infoText}>
              Enrolled: {formatDate(course.enrolledAt)}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <IconSymbol name="person.2.fill" size={14} color={Colors.light.icon} style={styles.infoIcon} />
            <ThemedText type="caption" style={styles.infoText}>
              {course.studentCount} students
            </ThemedText>
          </View>

          {isPending && (
            <View style={styles.pendingAction}>
              <IconSymbol name="key.fill" size={14} color={Colors.light.warning} style={styles.infoIcon} />
              <ThemedText type="caption" style={styles.pendingText}>
                Tap to enter enrollment key
              </ThemedText>
            </View>
          )}

          {!isPending && (
            <View style={styles.viewAssignmentsAction}>
              <IconSymbol name="doc.text.fill" size={14} color={Colors.light.primary} style={styles.infoIcon} />
              <ThemedText type="caption" style={styles.viewAssignmentsText}>
                Tap to view assignments
              </ThemedText>
              <IconSymbol name="chevron.right" size={14} color={Colors.light.primary} />
            </View>
          )}

          {!isPending && course.finalGrade !== null && course.finalGrade !== undefined && (
            <View style={styles.gradeContainer}>
              <ThemedText type="caption" style={styles.gradeLabel}>Final Grade:</ThemedText>
              <View style={[
                styles.gradeBadge, 
                { backgroundColor: course.isPassed ? Colors.light.success : Colors.light.error }
              ]}>
                <ThemedText type="caption" style={styles.gradeText}>
                  {course.finalGrade.toFixed(1)}
                </ThemedText>
              </View>
              {course.isPassed && (
                <IconSymbol name="checkmark.circle.fill" size={16} color={Colors.light.success} style={styles.passedIcon} />
              )}
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
          <ThemedText type="default" style={styles.loadingText}>Loading classes...</ThemedText>
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
            onPress={() => fetchCourses()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (courses.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="book.closed" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>No classes enrolled yet</ThemedText>
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
        {/* Pending Courses Section */}
        {pendingCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol name="clock.fill" size={20} color={Colors.light.warning} />
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Pending Enrollment ({pendingCourses.length})
              </ThemedText>
            </View>
            <ThemedText type="caption" style={styles.sectionDescription}>
              Tap on a course to enter enrollment key
            </ThemedText>
            {pendingCourses.map((course, index) => renderCourseCard(course, index, true))}
          </View>
        )}

        {/* Enrolled Courses Section */}
        {enrolledCourses.length > 0 && (
          <View style={styles.section}>
            {pendingCourses.length > 0 && (
              <View style={styles.sectionHeader}>
                <IconSymbol name="checkmark.circle.fill" size={20} color={Colors.light.success} />
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Enrolled Classes ({enrolledCourses.length})
                </ThemedText>
              </View>
            )}
            {enrolledCourses.map((course, index) => renderCourseCard(course, index, false))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">My Classes</ThemedText>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: primaryColor }]}
            onPress={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {renderContent()}
      </SafeAreaView>

      {/* Enroll Key Modal */}
      <EnrollKeyModal
        visible={isModalVisible}
        course={selectedPendingCourse}
        onClose={handleModalClose}
        onSubmit={handleEnrollWithKey}
      />
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
  refreshButton: {
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
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    opacity: 0.6,
    marginBottom: Spacing.md,
    marginLeft: 28,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '500',
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
  instanceName: {
    opacity: 0.6,
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoIcon: {
    marginRight: Spacing.xs,
  },
  infoText: {
    opacity: 0.6,
    flex: 1,
  },
  pendingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  pendingText: {
    color: Colors.light.warning,
    fontWeight: '600',
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  gradeLabel: {
    opacity: 0.6,
    marginRight: Spacing.sm,
  },
  gradeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  gradeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  passedIcon: {
    marginLeft: Spacing.xs,
  },
  viewAssignmentsAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewAssignmentsText: {
    color: Colors.light.primary,
    fontWeight: '600',
    flex: 1,
  },
});
