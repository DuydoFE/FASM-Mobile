import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { FeatureCard } from '@/components/home/feature-card';
import { HomeHeader } from '@/components/home/home-header';
import { InstructorSearchBar } from '@/components/home/instructor-search-bar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <HomeHeader showSearch={false} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.searchSection}>
          <InstructorSearchBar />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Instructor Dashboard</ThemedText>
          </View>

          <View style={styles.grid}>
            <FeatureCard
              title="My Classes"
              subtitle="Manage your courses"
              color={Colors.light.primary}
              icon="book.fill"
              onPress={() => router.push('/(tabs)/my-class' as any)}
            />
            <FeatureCard
              title="Assignments"
              subtitle="View & grade"
              color={Colors.light.accent}
              icon="doc.text.fill"
              onPress={() => router.push('/(tabs)/assignments')}
            />
            <FeatureCard
              title="Notifications"
              subtitle="3 New"
              color={Colors.light.warning}
              icon="bell.fill"
              onPress={() => router.push('/(tabs)/notifications')}
            />
            <FeatureCard
              title="Students"
              subtitle="Manage enrollments"
              color={Colors.light.success}
              icon="person.2.fill"
              onPress={() => {
                // Students management not implemented yet
                router.push('/(tabs)/profile');
              }}
            />
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});