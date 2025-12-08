import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  addStudentToCourse,
  deleteStudentFromCourse,
  getStudentsByCourseInstance,
} from '@/services/student-management.service';
import { CourseStudentForInstructor } from '@/types/api.types';

export default function InstructorManageStudentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    courseInstanceId: string;
    courseName?: string;
    courseCode?: string;
    courseInstanceName?: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const [students, setStudents] = useState<CourseStudentForInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Add student modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newStudentCode, setNewStudentCode] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const modalAnimation = useRef(new Animated.Value(0)).current;

  // Dropdown menu state
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top?: number; bottom?: number; right: number }>({ right: 0 });
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const courseInstanceId = params.courseInstanceId ? parseInt(params.courseInstanceId, 10) : null;
  
  // Get course info from params (fallback) or from student data (primary)
  const courseInfoFromStudents = students.length > 0 ? students[0] : null;
  const courseName = courseInfoFromStudents?.courseName || params.courseName || 'Course';
  const courseCode = courseInfoFromStudents?.courseCode || params.courseCode || '';
  const courseInstanceName = courseInfoFromStudents?.courseInstanceName || params.courseInstanceName || '';

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchStudents = async (showRefresh = false) => {
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

      const data = await getStudentsByCourseInstance(courseInstanceId);
      setStudents(data);
    } catch (err) {
      setError('Failed to load students. Please try again.');
      console.error('Error fetching students:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [courseInstanceId]);

  const handleRefresh = () => {
    fetchStudents(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'enrolled':
      case 'active':
        return Colors.light.success;
      case 'pending':
        return Colors.light.warning;
      case 'dropped':
      case 'withdrawn':
        return Colors.light.error;
      default:
        return Colors.light.icon;
    }
  };

  // Add student modal handlers
  const openAddModal = () => {
    setNewStudentCode('');
    setAddModalVisible(true);
    Animated.spring(modalAnimation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const closeAddModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setAddModalVisible(false);
      setNewStudentCode('');
    });
  };

  const handleAddStudent = async () => {
    if (!newStudentCode.trim()) {
      Alert.alert('Error', 'Please enter a student code');
      return;
    }

    if (!courseInstanceId) {
      Alert.alert('Error', 'Invalid course instance');
      return;
    }

    try {
      setIsAddingStudent(true);
      await addStudentToCourse(courseInstanceId, newStudentCode.trim());
      Alert.alert('Success', 'Student added successfully!');
      closeAddModal();
      fetchStudents(true);
    } catch (err) {
      console.error('Error adding student:', err);
      Alert.alert(
        'Error',
        err instanceof Error ? err.message : 'Failed to add student. Please try again.'
      );
    } finally {
      setIsAddingStudent(false);
    }
  };

  // Dropdown menu handlers
  const DROPDOWN_HEIGHT = 120; // Approximate height of the dropdown menu (only Remove option)
  
  const openDropdown = (studentId: number, event: { nativeEvent: { pageX: number; pageY: number } }) => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const rightOffset = screenWidth - event.nativeEvent.pageX - 24;
    const clickY = event.nativeEvent.pageY;
    
    // Check if there's enough space below for the dropdown
    const spaceBelow = screenHeight - clickY - 20; // 20px padding from bottom
    const shouldShowAbove = spaceBelow < DROPDOWN_HEIGHT;

    if (shouldShowAbove) {
      // Position dropdown above the click point
      setDropdownPosition({
        bottom: screenHeight - clickY + 8,
        top: undefined,
        right: Math.max(16, rightOffset),
      });
    } else {
      // Position dropdown below the click point
      setDropdownPosition({
        top: clickY + 8,
        bottom: undefined,
        right: Math.max(16, rightOffset),
      });
    }

    setDropdownVisible(studentId);

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

  const handleDeleteStudent = (student: CourseStudentForInstructor) => {
    Alert.alert(
      'Remove Student',
      `Are you sure you want to remove "${student.studentName}" from this course? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsActionLoading(student.courseStudentId);
              await deleteStudentFromCourse(
                student.userId,
                student.courseInstanceId,
                student.courseStudentId
              );
              Alert.alert('Success', 'Student removed successfully!');
              fetchStudents(true);
            } catch (err) {
              console.error('Error removing student:', err);
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to remove student. Please try again.'
              );
            } finally {
              setIsActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const renderStudentCard = (student: CourseStudentForInstructor) => {
    const statusColor = getStatusColor(student.status);
    const isCurrentActionLoading = isActionLoading === student.courseStudentId;

    return (
      <View
        key={student.courseStudentId}
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
      >
        {/* Loading Overlay */}
        {isCurrentActionLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={primaryColor} />
          </View>
        )}

        <View style={styles.cardContent}>
          {/* Avatar and Info */}
          <View style={styles.studentInfo}>
            <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
              <ThemedText type="default" style={styles.avatarText}>
                {student.studentName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.infoContainer}>
              <ThemedText type="title" style={styles.studentName}>
                {student.studentName}
              </ThemedText>
              <ThemedText type="caption" style={styles.studentCode}>
                {student.studentCode}
              </ThemedText>
              <ThemedText type="caption" style={styles.studentEmail}>
                {student.studentEmail}
              </ThemedText>
            </View>
          </View>

          {/* Actions */}
          <TouchableOpacity
            style={styles.moreButton}
            onPress={(e) => openDropdown(student.courseStudentId, e)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="ellipsis.vertical" size={18} color={Colors.light.icon} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[styles.cardFooter, { borderTopColor: borderColor }]}>
          <View style={styles.footerItem}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText type="caption" style={styles.footerText}>
              {student.status}
            </ThemedText>
          </View>
          <View style={styles.footerItem}>
            <IconSymbol name="calendar" size={12} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.footerText}>
              Enrolled: {formatDate(student.enrolledAt)}
            </ThemedText>
          </View>
          {student.finalGrade !== null && (
            <View style={styles.footerItem}>
              <IconSymbol name="chart.bar.fill" size={12} color={Colors.light.icon} />
              <ThemedText type="caption" style={styles.footerText}>
                Grade: {student.finalGrade}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderDropdownMenu = () => {
    if (dropdownVisible === null) return null;

    const student = students.find((s) => s.courseStudentId === dropdownVisible);
    if (!student) return null;

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
                ...(dropdownPosition.top !== undefined && { top: dropdownPosition.top }),
                ...(dropdownPosition.bottom !== undefined && { bottom: dropdownPosition.bottom }),
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

            {/* Delete Option */}
            <TouchableOpacity
              style={[styles.dropdownItem, styles.dropdownItemDanger]}
              onPress={() => {
                closeDropdown();
                setTimeout(() => handleDeleteStudent(student), 200);
              }}
              activeOpacity={0.6}
            >
              <View style={[styles.dropdownIconContainer, styles.deleteIconBg]}>
                <IconSymbol name="trash.fill" size={18} color={Colors.light.error} />
              </View>
              <View style={styles.dropdownTextContainer}>
                <ThemedText type="default" style={[styles.dropdownItemText, styles.dropdownItemTextDanger]}>
                  Remove
                </ThemedText>
                <ThemedText type="caption" style={styles.dropdownItemSubtext}>
                  Remove from class
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={`${Colors.light.error}80`} />
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    );
  };

  const renderAddStudentModal = () => {
    const scaleValue = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
    });

    const opacityValue = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Modal
        visible={addModalVisible}
        transparent
        animationType="none"
        onRequestClose={closeAddModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeAddModal} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: cardBg,
                transform: [{ scale: scaleValue }],
                opacity: opacityValue,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <ThemedText type="subtitle" style={styles.modalTitle}>
                Add Student
              </ThemedText>
              <TouchableOpacity onPress={closeAddModal}>
                <IconSymbol name="xmark" size={24} color={Colors.light.icon} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.modalBody}>
              <ThemedText type="default" style={styles.inputLabel}>
                Student Code
              </ThemedText>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    color: textColor,
                  },
                ]}
                placeholder="Enter student code (e.g., SE123456)"
                placeholderTextColor={Colors.light.icon}
                value={newStudentCode}
                onChangeText={setNewStudentCode}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isAddingStudent}
              />
              <ThemedText type="caption" style={styles.inputHint}>
                Enter the student's code to add them to this course
              </ThemedText>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: borderColor }]}
                onPress={closeAddModal}
                disabled={isAddingStudent}
              >
                <ThemedText type="default" style={styles.cancelButtonText}>
                  Cancel
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  { backgroundColor: primaryColor },
                  isAddingStudent && styles.disabledButton,
                ]}
                onPress={handleAddStudent}
                disabled={isAddingStudent}
              >
                {isAddingStudent ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText type="default" style={styles.submitButtonText}>
                    Add Student
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText type="default" style={styles.loadingText}>
            Loading students...
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
            onPress={() => fetchStudents()}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (students.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="person.2.slash" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            No students enrolled yet
          </ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: primaryColor }]}
            onPress={openAddModal}
          >
            <IconSymbol name="plus" size={18} color="#FFFFFF" />
            <ThemedText type="default" style={styles.addButtonText}>
              Add Student
            </ThemedText>
          </TouchableOpacity>
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
        {/* Students List */}
        {filteredStudents.length > 0 ? (
          filteredStudents.map(renderStudentCard)
        ) : (
          <View style={styles.noResultsContainer}>
            <IconSymbol name="magnifyingglass" size={32} color={Colors.light.icon} />
            <ThemedText type="default" style={styles.noResultsText}>
              No students found matching "{searchQuery}"
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
            <ThemedText type="caption" style={styles.courseCode} numberOfLines={1}>
              {courseCode}{courseInstanceName ? ` - ${courseInstanceName}` : ''}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.headerTitle} numberOfLines={1}>
              {courseName}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.addHeaderButton, { backgroundColor: primaryColor }]}
            onPress={openAddModal}
          >
            <IconSymbol name="plus" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {!isLoading && !error && students.length > 0 && (
          <View style={styles.searchContainer}>
            <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor: borderColor }]}>
              <IconSymbol name="magnifyingglass" size={18} color={Colors.light.icon} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="Search students..."
                placeholderTextColor={Colors.light.icon}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <IconSymbol name="xmark.circle.fill" size={18} color={Colors.light.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Student Count */}
        {!isLoading && !error && students.length > 0 && (
          <View style={styles.countContainer}>
            <ThemedText type="default" style={styles.countText}>
              {filteredStudents.length} Student{filteredStudents.length !== 1 ? 's' : ''}
              {searchQuery && ` (filtered from ${students.length})`}
            </ThemedText>
          </View>
        )}

        {renderContent()}

        {/* Modals */}
        {renderAddStudentModal()}
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
    fontWeight: '600',
  },
  courseInstanceName: {
    opacity: 0.6,
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addHeaderButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
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
  addButton: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  noResultsText: {
    opacity: 0.6,
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    marginBottom: 2,
  },
  studentCode: {
    opacity: 0.6,
    fontSize: 13,
  },
  studentEmail: {
    opacity: 0.5,
    fontSize: 12,
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(79, 70, 229, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerText: {
    opacity: 0.6,
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
  // Dropdown styles
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownMenu: {
    position: 'absolute',
    width: 220,
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
  viewIconBg: {
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    ...Shadows.light.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  inputHint: {
    marginTop: Spacing.xs,
    opacity: 0.5,
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  submitButton: {},
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});