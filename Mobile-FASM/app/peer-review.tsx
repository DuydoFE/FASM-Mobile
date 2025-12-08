import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { generateAICriteriaFeedback, getRandomReview, submitReview } from '@/services/assignment.service';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { AICriteriaFeedback, CriteriaFeedback, RandomReviewAssignment, RandomReviewRubricCriteria } from '@/types/api.types';

// Type for submitted review result
interface SubmittedReviewResult {
  assignmentTitle: string;
  studentName: string;
  generalFeedback: string;
  criteriaFeedbacks: Array<{
    criteriaId: number;
    title: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  totalScore: number;
  maxTotalScore: number;
}

export default function PeerReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    assignmentId: string;
  }>();

  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  const currentUser = useSelector(selectCurrentUser);

  const [reviewData, setReviewData] = useState<RandomReviewAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<number, string>>({});
  const [feedbacks, setFeedbacks] = useState<Record<number, string>>({});
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [aiSummaries, setAiSummaries] = useState<Record<number, AICriteriaFeedback>>({});
  const [showResultModal, setShowResultModal] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<SubmittedReviewResult | null>(null);

  const assignmentId = params.assignmentId ? parseInt(params.assignmentId, 10) : null;

  const fetchRandomReview = async () => {
    if (!assignmentId) {
      setError('Invalid assignment');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await getRandomReview(assignmentId);
      setReviewData(data);
      
      // Initialize scores and feedbacks for each criteria
      const initialScores: Record<number, string> = {};
      const initialFeedbacks: Record<number, string> = {};
      data.rubric.criteria.forEach((criteria) => {
        initialScores[criteria.criteriaId] = '0';
        initialFeedbacks[criteria.criteriaId] = '';
      });
      setScores(initialScores);
      setFeedbacks(initialFeedbacks);
    } catch (err: any) {
      setError(err.message || 'Failed to load review. Please try again.');
      console.error('Error fetching random review:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomReview();
  }, [assignmentId]);

  const handleScoreChange = (criteriaId: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setScores((prev) => ({
      ...prev,
      [criteriaId]: numericValue,
    }));
  };

  const handleFeedbackChange = (criteriaId: number, value: string) => {
    setFeedbacks((prev) => ({
      ...prev,
      [criteriaId]: value,
    }));
  };

  const handleSubmitReview = async () => {
    if (!reviewData || !currentUser) {
      Alert.alert('Error', 'Unable to submit review. Please try again.');
      return;
    }

    // Validate scores
    try {
      const criteriaFeedbacksList: CriteriaFeedback[] = reviewData.rubric.criteria.map((criteria) => {
        const score = parseInt(scores[criteria.criteriaId] || '0', 10);
        if (score < 0 || score > criteria.maxScore) {
          throw new Error(`Score for "${criteria.title}" must be between 0 and ${criteria.maxScore}`);
        }
        return {
          criteriaId: criteria.criteriaId,
          score,
          feedback: feedbacks[criteria.criteriaId] || '',
        };
      });

      setIsSubmitting(true);
      await submitReview({
        reviewAssignmentId: reviewData.reviewAssignmentId,
        reviewerUserId: currentUser.userId,
        generalFeedback,
        criteriaFeedbacks: criteriaFeedbacksList,
      });

      // Calculate totals and prepare result data
      let totalScore = 0;
      let maxTotalScore = 0;
      const resultCriteriaFeedbacks = reviewData.rubric.criteria.map((criteria) => {
        const score = parseInt(scores[criteria.criteriaId] || '0', 10);
        totalScore += score;
        maxTotalScore += criteria.maxScore;
        return {
          criteriaId: criteria.criteriaId,
          title: criteria.title,
          score,
          maxScore: criteria.maxScore,
          feedback: feedbacks[criteria.criteriaId] || '',
        };
      });

      // Set result data and show modal
      setSubmittedResult({
        assignmentTitle: reviewData.assignmentTitle,
        studentName: reviewData.studentName,
        generalFeedback,
        criteriaFeedbacks: resultCriteriaFeedbacks,
        totalScore,
        maxTotalScore,
      });
      setShowResultModal(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResultModal = () => {
    setShowResultModal(false);
    setSubmittedResult(null);
    router.back();
  };

  const renderResultModal = () => {
    if (!submittedResult) return null;

    const scorePercentage = submittedResult.maxTotalScore > 0
      ? Math.round((submittedResult.totalScore / submittedResult.maxTotalScore) * 100)
      : 0;

    return (
      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseResultModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: cardBg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.resultHeader}>
                <IconSymbol name="checkmark.circle.fill" size={48} color={Colors.light.success} />
                <ThemedText type="title" style={styles.resultTitle}>
                  Review Submitted!
                </ThemedText>
                <ThemedText type="caption" style={styles.resultSubtitle}>
                  {submittedResult.assignmentTitle} - {submittedResult.studentName}
                </ThemedText>
              </View>

              {/* Total Score Card */}
              <View style={[styles.totalScoreCard, { backgroundColor: Colors.light.primary }]}>
                <ThemedText type="caption" style={styles.totalScoreLabel}>
                  Total Score
                </ThemedText>
                <ThemedText type="title" style={styles.totalScoreValue}>
                  {submittedResult.totalScore} / {submittedResult.maxTotalScore}
                </ThemedText>
                <ThemedText type="caption" style={styles.totalScorePercentage}>
                  ({scorePercentage}%)
                </ThemedText>
              </View>

              {/* Criteria Results Table */}
              <View style={styles.resultTableContainer}>
                <ThemedText type="subtitle" style={styles.tableTitle}>
                  Criteria Scores
                </ThemedText>
                
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader, { borderColor }]}>
                  <ThemedText type="caption" style={[styles.tableCell, styles.criteriaCell, styles.headerText]}>
                    Criteria
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.tableCell, styles.scoreCell, styles.headerText]}>
                    Score
                  </ThemedText>
                  <ThemedText type="caption" style={[styles.tableCell, styles.feedbackCell, styles.headerText]}>
                    Feedback
                  </ThemedText>
                </View>

                {/* Table Rows */}
                {submittedResult.criteriaFeedbacks.map((item, index) => (
                  <View
                    key={item.criteriaId}
                    style={[
                      styles.tableRow,
                      { borderColor },
                      index % 2 === 0 && styles.tableRowEven
                    ]}
                  >
                    <ThemedText type="default" style={[styles.tableCell, styles.criteriaCell]}>
                      {item.title}
                    </ThemedText>
                    <View style={[styles.tableCell, styles.scoreCell]}>
                      <ThemedText type="default" style={styles.scoreBadge}>
                        {item.score}/{item.maxScore}
                      </ThemedText>
                    </View>
                    <ThemedText
                      type="caption"
                      style={[styles.tableCell, styles.feedbackCell]}
                      numberOfLines={2}
                    >
                      {item.feedback || '-'}
                    </ThemedText>
                  </View>
                ))}
              </View>

              {/* General Feedback */}
              {submittedResult.generalFeedback ? (
                <View style={[styles.generalFeedbackResult, { borderColor }]}>
                  <ThemedText type="subtitle" style={styles.generalFeedbackResultTitle}>
                    General Feedback
                  </ThemedText>
                  <ThemedText type="default" style={styles.generalFeedbackResultText}>
                    {submittedResult.generalFeedback}
                  </ThemedText>
                </View>
              ) : null}

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeResultButton, { backgroundColor: primaryColor }]}
                onPress={handleCloseResultModal}
              >
                <ThemedText type="default" style={styles.closeResultButtonText}>
                  Done
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const handleCreateSummaryAI = async () => {
    if (!reviewData) {
      Alert.alert('Error', 'No submission data available.');
      return;
    }

    try {
      setIsGeneratingAI(true);
      const aiResult = await generateAICriteriaFeedback(reviewData.submissionId);
      
      // Check for error message from API
      if (aiResult.errorMessage) {
        Alert.alert('Info', aiResult.errorMessage);
        return;
      }

      // Check if feedbacks array exists and has items
      if (!aiResult.feedbacks || aiResult.feedbacks.length === 0) {
        Alert.alert('Info', 'AI analysis returned no results. Please try again later.');
        return;
      }

      // Map AI results to a dictionary by criteriaId
      const aiSummaryMap: Record<number, AICriteriaFeedback> = {};
      aiResult.feedbacks.forEach((result) => {
        aiSummaryMap[result.criteriaId] = result;
      });
      setAiSummaries(aiSummaryMap);

      // Optionally auto-fill scores and feedbacks from AI
      const newScores: Record<number, string> = { ...scores };
      const newFeedbacks: Record<number, string> = { ...feedbacks };
      aiResult.feedbacks.forEach((result) => {
        newScores[result.criteriaId] = String(result.score);
        newFeedbacks[result.criteriaId] = result.summary;
      });
      setScores(newScores);
      setFeedbacks(newFeedbacks);

      Alert.alert('Success', 'AI summary generated successfully!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate AI summary. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleOpenFile = async () => {
    if (reviewData?.fileUrl) {
      try {
        await Linking.openURL(reviewData.fileUrl);
      } catch (err) {
        Alert.alert('Error', 'Could not open file');
      }
    }
  };

  const handleDownloadFile = async () => {
    if (reviewData?.fileUrl) {
      try {
        await Linking.openURL(reviewData.fileUrl);
      } catch (err) {
        Alert.alert('Error', 'Could not download file');
      }
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'notreviewed':
      case 'not reviewed':
        return Colors.light.warning;
      case 'reviewed':
        return Colors.light.success;
      case 'pending':
        return Colors.light.primary;
      default:
        return Colors.light.icon;
    }
  };

  const renderCriteriaCard = (criteria: RandomReviewRubricCriteria) => {
    const currentScore = parseInt(scores[criteria.criteriaId] || '0', 10);
    const aiSummary = aiSummaries[criteria.criteriaId];

    return (
      <View
        key={criteria.criteriaId}
        style={[styles.criteriaCard, { backgroundColor: cardBg, borderColor }]}
      >
        {/* Criteria Header */}
        <View style={styles.criteriaHeader}>
          <View style={styles.criteriaInfo}>
            <ThemedText type="subtitle" style={styles.criteriaTitle}>
              {criteria.title}
            </ThemedText>
            <ThemedText type="caption" style={styles.criteriaDescription}>
              {criteria.description}
            </ThemedText>
          </View>
        </View>

        {/* Weight Progress Bar */}
        <View style={styles.weightContainer}>
          <View style={styles.weightBar}>
            <View
              style={[
                styles.weightFill,
                { width: `${criteria.weight}%`, backgroundColor: Colors.light.primary },
              ]}
            />
          </View>
          <ThemedText type="caption" style={styles.weightText}>
            {criteria.weight}%
          </ThemedText>
        </View>

        {/* AI Summary Section */}
        <View style={[styles.aiSummaryContainer, aiSummary && styles.aiSummaryContainerActive]}>
          <IconSymbol name="bolt.fill" size={20} color={aiSummary ? Colors.light.success : Colors.light.icon} />
          <View style={styles.aiSummaryContent}>
            {aiSummary ? (
              <>
                <ThemedText type="caption" style={styles.aiSummaryTitle}>
                  AI Score: {aiSummary.score}/{aiSummary.maxScore}
                </ThemedText>
                <ThemedText type="caption" style={styles.aiSummaryText}>
                  {aiSummary.summary}
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText type="caption" style={styles.aiSummaryTitle}>
                  No AI summary yet
                </ThemedText>
                <ThemedText type="caption" style={styles.aiSummarySubtitle}>
                  Click 'Create Summary AI' to analyze
                </ThemedText>
              </>
            )}
          </View>
        </View>

        {/* Feedback Input */}
        <TextInput
          style={[
            styles.feedbackInput,
            { borderColor, color: textColor, backgroundColor: cardBg },
          ]}
          value={feedbacks[criteria.criteriaId]}
          onChangeText={(value) => handleFeedbackChange(criteria.criteriaId, value)}
          placeholder="Enter your feedback for this criteria..."
          placeholderTextColor={Colors.light.icon}
          multiline
          numberOfLines={3}
        />

        {/* Score Input */}
        <View style={styles.scoreContainer}>
          <TextInput
            style={[
              styles.scoreInput,
              { borderColor, color: textColor, backgroundColor: cardBg },
            ]}
            value={scores[criteria.criteriaId]}
            onChangeText={(value) => handleScoreChange(criteria.criteriaId, value)}
            keyboardType="numeric"
            maxLength={3}
            placeholder="0"
            placeholderTextColor={Colors.light.icon}
          />
          <ThemedText type="default" style={styles.scoreMax}>
            / {criteria.maxScore}
          </ThemedText>
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
            Loading review...
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
            onPress={fetchRandomReview}
          >
            <ThemedText type="default" style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (!reviewData) {
      return (
        <View style={styles.centerContainer}>
          <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
          <ThemedText type="default" style={styles.emptyText}>
            No submissions available for review
          </ThemedText>
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Submission Header Card */}
        <View style={[styles.submissionCard, { backgroundColor: cardBg }, Shadows.light.sm]}>
          <View style={styles.submissionHeader}>
            <View style={styles.avatarContainer}>
              <ThemedText type="title" style={styles.avatarText}>
                {reviewData.studentName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.submissionInfo}>
              <ThemedText type="title" style={styles.assignmentTitle}>
                {reviewData.assignmentTitle} - {reviewData.studentName}
              </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reviewData.status) }]}>
              <ThemedText type="caption" style={styles.statusText}>
                {reviewData.status === 'NotReviewed' ? 'Not Reviewed' : reviewData.status}
              </ThemedText>
            </View>
          </View>

          {/* File Section */}
          <View style={[styles.fileSection, { borderTopColor: borderColor }]}>
            <ThemedText type="default" style={styles.fileName}>
              {reviewData.fileName}
            </ThemedText>
            <View style={styles.fileActions}>
              <TouchableOpacity style={styles.fileButton} onPress={handleOpenFile}>
                <IconSymbol name="eye" size={20} color={Colors.light.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.fileButton} onPress={handleDownloadFile}>
                <IconSymbol name="arrow.down.circle" size={20} color={Colors.light.icon} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.autoScoreButton]}>
            <IconSymbol name="sparkles" size={16} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.autoScoreText}>Auto Score</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.createSummaryButton, { backgroundColor: Colors.light.success }, isGeneratingAI && styles.buttonDisabled]}
            onPress={handleCreateSummaryAI}
            disabled={isGeneratingAI}
          >
            {isGeneratingAI ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <IconSymbol name="wand.and.stars" size={16} color="#FFFFFF" />
            )}
            <ThemedText type="caption" style={styles.createSummaryText}>
              {isGeneratingAI ? 'Generating...' : 'Create Summary AI'}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.resetButton]}>
            <IconSymbol name="arrow.counterclockwise" size={16} color={Colors.light.icon} />
            <ThemedText type="caption" style={styles.resetText}>Reset</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Grading Form Header */}
        <View style={styles.gradingHeader}>
          <View style={styles.gradingColumn}>
            <ThemedText type="subtitle" style={[styles.columnHeader, { color: Colors.light.primary }]}>
              Form Grading
            </ThemedText>
          </View>
          <View style={styles.gradingColumn}>
            <ThemedText type="subtitle" style={[styles.columnHeader, { color: Colors.light.primary }]}>
              AI Summary
            </ThemedText>
          </View>
          <View style={styles.gradingColumn}>
            <ThemedText type="subtitle" style={[styles.columnHeader, { color: Colors.light.primary }]}>
              Score Input
            </ThemedText>
          </View>
        </View>

        {/* Criteria List */}
        {reviewData.rubric.criteria.map(renderCriteriaCard)}

        {/* General Feedback */}
        <View style={[styles.generalFeedbackContainer, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.generalFeedbackTitle}>
            General Feedback
          </ThemedText>
          <TextInput
            style={[
              styles.generalFeedbackInput,
              { borderColor, color: textColor, backgroundColor: cardBg },
            ]}
            value={generalFeedback}
            onChangeText={setGeneralFeedback}
            placeholder="Enter your overall feedback for this submission..."
            placeholderTextColor={Colors.light.icon}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: primaryColor }, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmitReview}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <ThemedText type="default" style={styles.submitButtonText}>
              Submit Review
            </ThemedText>
          )}
        </TouchableOpacity>
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
              Peer Review
            </ThemedText>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        {renderContent()}
        {renderResultModal()}
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
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
  submissionCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  submissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  submissionInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
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
  fileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  fileActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  fileButton: {
    padding: Spacing.xs,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  autoScoreButton: {
    backgroundColor: '#F3F4F6',
  },
  autoScoreText: {
    color: Colors.light.icon,
  },
  createSummaryButton: {
    flex: 1,
    justifyContent: 'center',
  },
  createSummaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
  },
  resetText: {
    color: Colors.light.icon,
  },
  gradingHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  gradingColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
  },
  criteriaCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  criteriaHeader: {
    marginBottom: Spacing.sm,
  },
  criteriaInfo: {
    flex: 1,
  },
  criteriaTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  criteriaDescription: {
    opacity: 0.6,
    fontSize: 13,
    lineHeight: 18,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  weightBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  weightFill: {
    height: '100%',
    borderRadius: 4,
  },
  weightText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  aiSummaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  aiSummaryContent: {
    flex: 1,
  },
  aiSummaryTitle: {
    fontWeight: '600',
    color: '#374151',
  },
  aiSummarySubtitle: {
    opacity: 0.6,
    fontSize: 11,
  },
  aiSummaryContainerActive: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: Colors.light.success,
  },
  aiSummaryText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#374151',
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  scoreInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreMax: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  generalFeedbackContainer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  generalFeedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  generalFeedbackInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    marginTop: Spacing.md,
    fontSize: 22,
    fontWeight: '700',
  },
  resultSubtitle: {
    marginTop: Spacing.xs,
    opacity: 0.7,
    textAlign: 'center',
  },
  totalScoreCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalScoreLabel: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: Spacing.xs,
  },
  totalScoreValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  totalScorePercentage: {
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: Spacing.xs,
  },
  resultTableContainer: {
    marginBottom: Spacing.lg,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    paddingHorizontal: Spacing.xs,
  },
  criteriaCell: {
    flex: 2,
  },
  scoreCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackCell: {
    flex: 2,
  },
  headerText: {
    fontWeight: '600',
    color: '#374151',
  },
  scoreBadge: {
    fontWeight: '600',
    color: Colors.light.primary,
  },
  generalFeedbackResult: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  generalFeedbackResultTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  generalFeedbackResultText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  closeResultButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  closeResultButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});