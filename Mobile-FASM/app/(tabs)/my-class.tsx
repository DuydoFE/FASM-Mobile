import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CourseInstructor, getInstructorCourses } from '@/services/course-instructor.service';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';

// Color palette for class cards
const CLASS_COLORS = [
  Colors.light.primary,
  Colors.light.accent,
  Colors.light.success,
  Colors.light.warning,
  '#9333EA', // purple
  '#EC4899', // pink
];

const getColorForIndex = (index: number): string => {
  return CLASS_COLORS[index % CLASS_COLORS.length];
};

export default function MyClassScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const user = useAppSelector(selectCurrentUser);
  
  const [courses, setCourses] = useState<CourseInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
      // Call the instructor courses API with the logged-in user's ID
      const data = await getInstructorCourses(user.userId);
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'ongoing':
      case 'active':
        return Colors.light.success;
      case 'upcoming':
      case 'pending':
        return Colors.light.warning;
      case 'completed':
      case 'ended':
        return Colors.light.primary;
      default:
        return Colors.light.icon;
    }
  };

  const handleCoursePress = (course: CourseInstructor) => {
    router.push({
      pathname: '/course-assignments',
      params: {
        courseInstanceId: course.courseInstanceId.toString(),
      },
    });
  };

  const renderCourseCard = (course: CourseInstructor, index: number) => {
    const cardColor = getColorForIndex(index);
    
    return (
      <TouchableOpacity
        key={course.courseInstanceId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.8}
        onPress={() => handleCoursePress(course)}
      >
        <View style={[styles.cardBanner, { backgroundColor: cardColor }]}>
          <View style={styles.codeBadge}>
            <ThemedText type="caption" style={styles.codeText}>{course.courseCode}</ThemedText>
          </View>
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(course.courseInstanceStatus) }]} />
            <ThemedText type="caption" style={styles.statusText}>{course.courseInstanceStatus}</ThemedText>
          </View>
          <IconSymbol
            name="book.fill"
            size={24}
            color="rgba(255,255,255,0.3)"
            style={styles.bannerIcon}
          />
        </View>
        
        <View style={styles.cardContent}>
          <ThemedText type="title" style={styles.className}>{course.courseName}</ThemedText>
          <ThemedText type="default" style={styles.instanceName}>
            {course.courseInstanceName} • {course.semesterName}
          </ThemedText>
          
          <View style={styles.infoRow}>
            <IconSymbol name="person.2.fill" size={14} color={Colors.light.icon} style={styles.infoIcon} />
            <ThemedText type="caption" style={styles.infoText}>
              {course.studentCount} students enrolled
            </ThemedText>
          </View>
          
          <View style={styles.infoRow}>
            <IconSymbol name="calendar" size={14} color={Colors.light.icon} style={styles.infoIcon} />
            <ThemedText type="caption" style={styles.infoText}>
              {formatDate(course.startDate)} - {formatDate(course.endDate)}
            </ThemedText>
          </View>

          {course.isMainInstructor && (
            <View style={styles.infoRow}>
              <IconSymbol name="star.fill" size={14} color={Colors.light.warning} style={styles.infoIcon} />
              <ThemedText type="caption" style={[styles.infoText, { color: Colors.light.warning }]}>
                Main Instructor
              </ThemedText>
            </View>
          )}

          <View style={styles.viewAction}>
            <IconSymbol name="doc.text.fill" size={14} color={Colors.light.primary} style={styles.infoIcon} />
            <ThemedText type="caption" style={styles.viewActionText}>
              Tap to manage course
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={Colors.light.primary} />
          </View>
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
          <ThemedText type="default" style={styles.emptyText}>No classes assigned yet</ThemedText>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="graduationcap.fill" size={20} color={Colors.light.primary} />
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Teaching ({courses.length} {courses.length === 1 ? 'class' : 'classes'})
            </ThemedText>
          </View>
          {courses.map((course, index) => renderCourseCard(course, index))}
        </View>
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
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  viewActionText: {
    color: Colors.light.primary,
    fontWeight: '600',
    flex: 1,
  },
});