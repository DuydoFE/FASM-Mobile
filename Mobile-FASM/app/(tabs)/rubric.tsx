import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getRubricsByUserId } from '@/services/rubric.service';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';
import { Rubric } from '@/types/api.types';

const STATUS_COLORS: Record<string, string> = {
  'Upcoming': Colors.light.primary,
  'Active': Colors.light.success,
  'InReview': Colors.light.warning,
  'GradesPublished': Colors.light.accent,
  'Closed': Colors.light.icon,
  'Cancelled': Colors.light.error,
};

const FILTERS = ['All', 'Upcoming', 'Active', 'InReview', 'GradesPublished', 'Closed', 'Cancelled'];

export default function RubricScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  
  const user = useAppSelector(selectCurrentUser);

  useEffect(() => {
    fetchRubrics();
  }, [user?.userId]);

  const fetchRubrics = async () => {
    if (!user?.userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getRubricsByUserId(user.userId);
      if (response.statusCode === 200 && response.data) {
        setRubrics(response.data);
      } else {
        setError(response.message || 'Failed to fetch rubrics');
      }
    } catch (err) {
      setError('Failed to load rubrics. Please try again.');
      console.error('Error fetching rubrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRubrics = activeFilter === 'All' 
    ? rubrics 
    : rubrics.filter(r => r.assignmentStatus === activeFilter);

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || Colors.light.icon;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const router = useRouter();

  const handleRubricPress = (rubricId: number) => {
    router.push(`/rubric-detail?rubricId=${rubricId}`);
  };

  const renderRubricItem = ({ item }: { item: Rubric }) => {
    const statusColor = getStatusColor(item.assignmentStatus);
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
        activeOpacity={0.7}
        onPress={() => handleRubricPress(item.rubricId)}
      >
        <View style={[styles.cardHeader, { borderLeftColor: statusColor }]}>
          <View style={styles.headerContent}>
            <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText type="caption" style={styles.courseName}>{item.className}</ThemedText>
            <ThemedText type="caption" style={styles.templateName}>
              Template: {item.templateTitle}
            </ThemedText>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <ThemedText type="caption" style={{ color: statusColor, fontWeight: '600' }}>
              {item.assignmentStatus}
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.criteriaContainer}>
          <ThemedText type="caption" style={styles.criteriaLabel}>
            Criteria: {item.criteriaCount}
          </ThemedText>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.assignmentInfo}>
            <IconSymbol name="doc.text" size={14} color={Colors.light.icon} style={styles.footerIcon} />
            <ThemedText type="caption" style={styles.assignmentText}>
              {item.assignmentTitle}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText type="subtitle" style={styles.loadingText}>Loading rubrics...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">Rubrics</ThemedText>
          <TouchableOpacity 
            style={[styles.refreshButton, { backgroundColor: primaryColor }]}
            onPress={fetchRubrics}
          >
            <IconSymbol name="arrow.clockwise" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
            {FILTERS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter && { backgroundColor: primaryColor },
                  activeFilter !== filter && { backgroundColor: cardBg, borderWidth: 1, borderColor: Colors.light.border }
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <ThemedText 
                  type="caption" 
                  style={[
                    styles.filterText,
                    activeFilter === filter && { color: '#FFFFFF' }
                  ]}
                >
                  {filter}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <IconSymbol name="exclamationmark.triangle" size={48} color={Colors.light.error} />
            <ThemedText type="subtitle" style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: primaryColor }]}
              onPress={fetchRubrics}
            >
              <ThemedText type="defaultSemiBold" style={{ color: '#FFFFFF' }}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredRubrics}
            renderItem={renderRubricItem}
            keyExtractor={item => item.rubricId.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
                <ThemedText type="subtitle" style={styles.emptyText}>No rubrics found</ThemedText>
              </View>
            }
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    opacity: 0.6,
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
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    paddingLeft: Spacing.sm,
    marginBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  courseName: {
    opacity: 0.6,
    marginBottom: 2,
  },
  templateName: {
    opacity: 0.5,
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  criteriaContainer: {
    marginBottom: Spacing.md,
    paddingLeft: Spacing.sm,
  },
  criteriaLabel: {
    fontWeight: '600',
    opacity: 0.7,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  assignmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    marginRight: Spacing.xs,
  },
  assignmentText: {
    opacity: 0.6,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    marginTop: Spacing.md,
    opacity: 0.5,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  errorText: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    opacity: 0.6,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});