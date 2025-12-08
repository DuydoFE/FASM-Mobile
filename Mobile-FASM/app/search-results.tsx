import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { searchInstructor } from '@/services/search.service';
import {
    SearchAssignment,
    SearchCriteria,
    SearchData,
    SearchFeedback,
    SearchSubmission,
    SearchSummary,
} from '@/types/api.types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SearchResultType = 'all' | 'assignments' | 'submissions' | 'feedback' | 'criteria' | 'summaries';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query } = useLocalSearchParams<{ query: string }>();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [activeTab, setActiveTab] = useState<SearchResultType>('all');
  
  const backgroundColor = useThemeColor({}, 'background');
  const backgroundSecondary = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await searchInstructor(query || '');
      if (response.statusCode === 200 && response.data) {
        setSearchData(response.data);
      } else {
        setError(response.message || 'Failed to fetch search results');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  const getTotalCount = () => {
    if (!searchData) return 0;
    return (
      searchData.assignments.length +
      searchData.submissions.length +
      searchData.feedback.length +
      searchData.criteria.length +
      searchData.summaries.length
    );
  };

  const tabs: { key: SearchResultType; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: getTotalCount() },
    { key: 'assignments', label: 'Assignments', count: searchData?.assignments.length || 0 },
    { key: 'submissions', label: 'Submissions', count: searchData?.submissions.length || 0 },
    { key: 'feedback', label: 'Feedback', count: searchData?.feedback.length || 0 },
    { key: 'criteria', label: 'Criteria', count: searchData?.criteria.length || 0 },
    { key: 'summaries', label: 'Summaries', count: searchData?.summaries.length || 0 },
  ];

  const renderAssignmentItem = (item: SearchAssignment) => (
    <TouchableOpacity
      key={`assignment-${item.assignmentId}`}
      style={[styles.resultItem, { backgroundColor: backgroundSecondary }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: Colors.light.primary }]} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.resultTitle}>
            {item.title}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: Colors.light.primary + '20' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: Colors.light.primary }]}>
              Assignment
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultSubtitle}>
          {item.courseName}
        </ThemedText>
        {item.descriptionSnippet && (
          <ThemedText type="caption" numberOfLines={2} style={styles.resultDescription}>
            {item.descriptionSnippet}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
    </TouchableOpacity>
  );

  const renderSubmissionItem = (item: SearchSubmission) => (
    <TouchableOpacity
      key={`submission-${item.submissionId}`}
      style={[styles.resultItem, { backgroundColor: backgroundSecondary }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: Colors.light.success }]} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.resultTitle}>
            {item.title || item.assignmentTitle}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: Colors.light.success + '20' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: Colors.light.success }]}>
              Submission
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultSubtitle}>
          {item.studentName} • {item.courseName}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultDescription}>
          Submitted: {new Date(item.submittedAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
    </TouchableOpacity>
  );

  const renderFeedbackItem = (item: SearchFeedback) => (
    <TouchableOpacity
      key={`feedback-${item.feedbackId}`}
      style={[styles.resultItem, { backgroundColor: backgroundSecondary }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: Colors.light.accent }]} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.resultTitle}>
            {item.title}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: Colors.light.accent + '20' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: Colors.light.accent }]}>
              Feedback
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultSubtitle}>
          {item.assignmentTitle} • {item.courseName}
        </ThemedText>
        {item.content && (
          <ThemedText type="caption" numberOfLines={2} style={styles.resultDescription}>
            {item.content}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
    </TouchableOpacity>
  );

  const renderCriteriaItem = (item: SearchCriteria) => (
    <TouchableOpacity
      key={`criteria-${item.criteriaId}`}
      style={[styles.resultItem, { backgroundColor: backgroundSecondary }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: Colors.light.warning }]} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.resultTitle}>
            {item.title}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: Colors.light.warning + '20' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: Colors.light.warning }]}>
              Criteria
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultSubtitle}>
          {item.rubricTitle} • {item.courseName}
        </ThemedText>
        <ThemedText type="caption" numberOfLines={2} style={styles.resultDescription}>
          {item.description}
        </ThemedText>
        <View style={styles.criteriaInfo}>
          <ThemedText type="caption" style={styles.criteriaScore}>
            Max Score: {item.maxScore} | Weight: {item.weight}%
          </ThemedText>
        </View>
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
    </TouchableOpacity>
  );

  const renderSummaryItem = (item: SearchSummary) => (
    <TouchableOpacity
      key={`summary-${item.summaryId}`}
      style={[styles.resultItem, { backgroundColor: backgroundSecondary }]}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: '#8B5CF6' }]} />
      <View style={styles.resultContent}>
        <View style={styles.resultHeader}>
          <ThemedText type="defaultSemiBold" numberOfLines={1} style={styles.resultTitle}>
            {item.title}
          </ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: '#8B5CF620' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: '#8B5CF6' }]}>
              Summary
            </ThemedText>
          </View>
        </View>
        <ThemedText type="caption" numberOfLines={1} style={styles.resultSubtitle}>
          {item.assignmentTitle} • {item.courseName}
        </ThemedText>
        {item.content && (
          <ThemedText type="caption" numberOfLines={2} style={styles.resultDescription}>
            {item.content}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
    </TouchableOpacity>
  );

  const renderSection = (
    title: string,
    items: any[],
    renderItem: (item: any) => React.ReactNode,
    color: string
  ) => {
    if (items.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIndicator, { backgroundColor: color }]} />
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {title}
          </ThemedText>
          <View style={[styles.countBadge, { backgroundColor: color + '20' }]}>
            <ThemedText style={[styles.countText, { color }]}>{items.length}</ThemedText>
          </View>
        </View>
        {items.map(renderItem)}
      </View>
    );
  };

  const renderAllResults = () => {
    if (!searchData) return null;

    return (
      <>
        {renderSection('Assignments', searchData.assignments, renderAssignmentItem, Colors.light.primary)}
        {renderSection('Submissions', searchData.submissions, renderSubmissionItem, Colors.light.success)}
        {renderSection('Feedback', searchData.feedback, renderFeedbackItem, Colors.light.accent)}
        {renderSection('Criteria', searchData.criteria, renderCriteriaItem, Colors.light.warning)}
        {renderSection('Summaries', searchData.summaries, renderSummaryItem, '#8B5CF6')}
      </>
    );
  };

  const renderFilteredResults = () => {
    if (!searchData) return null;

    switch (activeTab) {
      case 'assignments':
        return searchData.assignments.map(renderAssignmentItem);
      case 'submissions':
        return searchData.submissions.map(renderSubmissionItem);
      case 'feedback':
        return searchData.feedback.map(renderFeedbackItem);
      case 'criteria':
        return searchData.criteria.map(renderCriteriaItem);
      case 'summaries':
        return searchData.summaries.map(renderSummaryItem);
      default:
        return renderAllResults();
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <IconSymbol name="magnifyingglass" size={48} color={Colors.light.icon} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No results found
      </ThemedText>
      <ThemedText type="caption" style={styles.emptyText}>
        Try adjusting your search query or filters
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText type="subtitle" numberOfLines={1}>
            Search Results
          </ThemedText>
          <ThemedText type="caption" numberOfLines={1}>
            "{query}"
          </ThemedText>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: primaryColor + '20' },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  activeTab === tab.key && { color: primaryColor, fontWeight: '600' },
                ]}
              >
                {tab.label}
              </ThemedText>
              {tab.count > 0 && (
                <View
                  style={[
                    styles.tabBadge,
                    { backgroundColor: activeTab === tab.key ? primaryColor : Colors.light.icon + '30' },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.tabBadgeText,
                      { color: activeTab === tab.key ? '#FFFFFF' : textColor },
                    ]}
                  >
                    {tab.count}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>Searching...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={Colors.light.error} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: primaryColor }]}
            onPress={fetchSearchResults}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : getTotalCount() === 0 ? (
        renderEmptyState()
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderFilteredResults()}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerContent: {
    flex: 1,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tabsContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
  },
  tabText: {
    fontSize: 14,
  },
  tabBadge: {
    marginLeft: Spacing.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
  },
  countBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    minHeight: 40,
    borderRadius: 2,
    marginRight: Spacing.md,
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultTitle: {
    flex: 1,
    fontSize: 15,
    marginRight: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultSubtitle: {
    opacity: 0.7,
    marginBottom: 4,
  },
  resultDescription: {
    opacity: 0.6,
    lineHeight: 18,
  },
  criteriaInfo: {
    marginTop: 4,
  },
  criteriaScore: {
    opacity: 0.8,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    marginTop: Spacing.md,
    textAlign: 'center',
    opacity: 0.7,
  },
  retryButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.md,
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: 'center',
    opacity: 0.6,
  },
});