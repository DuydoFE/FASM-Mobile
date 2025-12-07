import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CourseStudent } from '@/types/api.types';

interface EnrollKeyModalProps {
  visible: boolean;
  course: CourseStudent | null;
  onClose: () => void;
  onSubmit: (courseInstanceId: number, enrollKey: string) => Promise<void>;
}

export function EnrollKeyModal({ visible, course, onClose, onSubmit }: EnrollKeyModalProps) {
  const [enrollKey, setEnrollKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const handleSubmit = async () => {
    if (!course || !enrollKey.trim()) {
      setError('Please enter an enrollment key');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit(course.courseInstanceId, enrollKey.trim());
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enroll. Please check your key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEnrollKey('');
    setError(null);
    setIsLoading(false);
    onClose();
  };

  if (!course) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  <IconSymbol name="key.fill" size={24} color={primaryColor} />
                  <ThemedText type="title" style={styles.headerTitle}>
                    Enter Enrollment Key
                  </ThemedText>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <IconSymbol name="xmark" size={20} color={Colors.light.icon} />
                </TouchableOpacity>
              </View>

              {/* Course Info */}
              <View style={styles.courseInfo}>
                <ThemedText type="default" style={styles.courseCode}>
                  {course.courseCode}
                </ThemedText>
                <ThemedText type="subtitle" style={styles.courseName}>
                  {course.courseName}
                </ThemedText>
                <ThemedText type="caption" style={styles.instanceName}>
                  {course.courseInstanceName}
                </ThemedText>
              </View>

              {/* Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor,
                      color: textColor,
                      borderColor: error ? Colors.light.error : borderColor,
                    },
                  ]}
                  placeholder="Enter enrollment key..."
                  placeholderTextColor={Colors.light.icon}
                  value={enrollKey}
                  onChangeText={(text) => {
                    setEnrollKey(text);
                    if (error) setError(null);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {error && (
                  <View style={styles.errorContainer}>
                    <IconSymbol name="exclamationmark.circle" size={14} color={Colors.light.error} />
                    <ThemedText type="caption" style={styles.errorText}>
                      {error}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor }]}
                  onPress={handleClose}
                  disabled={isLoading}
                >
                  <ThemedText type="default" style={styles.cancelButtonText}>
                    Cancel
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.submitButton,
                    { backgroundColor: primaryColor },
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading || !enrollKey.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <ThemedText type="default" style={styles.submitButtonText}>
                      Enroll
                    </ThemedText>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.light.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  courseInfo: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  courseCode: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    marginBottom: 4,
  },
  instanceName: {
    opacity: 0.6,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    gap: 4,
  },
  errorText: {
    color: Colors.light.error,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  submitButton: {
    ...Shadows.light.sm,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});