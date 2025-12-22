import { useRouter } from 'expo-router';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { FeatureCard } from '@/components/home/feature-card';
import { HomeHeader } from '@/components/home/home-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/slices/authSlice';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ThemedView style={styles.container}>
      <HomeHeader />

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {user && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Overview</ThemedText>
            </View>

            <View style={styles.grid}>
              <FeatureCard
                title="My Classes"
                icon="book.fill"
                color={Colors.light.primary}
                onPress={() => router.push('/(tabs)/classes')}
              />
              <FeatureCard
                title="Notifications"
                icon="bell.fill"
                color={Colors.light.warning}
                onPress={() => router.push('/(tabs)/notifications')}
              />
            </View>
          </View>
        )}
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
    justifyContent: 'space-around',
  },
});