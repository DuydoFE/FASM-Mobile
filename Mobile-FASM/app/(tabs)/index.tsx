import { useRouter } from 'expo-router';
import React from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { FeatureCard } from '@/components/home/feature-card';
import { HomeHeader } from '@/components/home/home-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
        {!user ? (
          // Not logged in: Show large logo and tagline
          <View style={styles.centerContainer}>
            <Image 
              source={require('@/assets/images/FASM.png')} 
              style={styles.largeLogo}
            />
            <ThemedText type="largeTitle" style={styles.tagline}>
              Fast Assignment
            </ThemedText>
            <ThemedText type="largeTitle" style={styles.tagline}>
              Management System
            </ThemedText>
          </View>
        ) : (
          // Logged in: Show overview
          <View>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Image 
                source={require('@/assets/images/FASM.png')} 
                style={styles.homeLogoLarge}
              />
            </View>

            {/* Welcome Message */}
            <View style={styles.welcomeSection}>
              <ThemedText type="largeTitle" style={styles.welcomeTitle}>
                Welcome, {user?.firstName}!
              </ThemedText>
              <ThemedText type="default" style={styles.welcomeSubtitle}>
                Manage your assignments and collaborate with peers
              </ThemedText>
            </View>

            {/* Overview Section */}
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

            {/* Quick Tips Section */}
            <View style={styles.section}>
              <ThemedText type="subtitle">Quick Tips</ThemedText>
              <View style={styles.tipsContainer}>
                <View style={styles.tipItem}>
                  <IconSymbol name="star.fill" size={20} color={Colors.light.success} />
                  <ThemedText type="default" style={styles.tipText}>
                    Check your classes for new assignments
                  </ThemedText>
                </View>
                <View style={styles.tipItem}>
                  <IconSymbol name="person.2.fill" size={20} color={Colors.light.info} />
                  <ThemedText type="default" style={styles.tipText}>
                    Review and provide feedback to peers
                  </ThemedText>
                </View>
                <View style={styles.tipItem}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color={Colors.light.success} />
                  <ThemedText type="default" style={styles.tipText}>
                    Submit completed assignments on time
                  </ThemedText>
                </View>
              </View>
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
    flexGrow: 1,
    paddingBottom: 120,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  tagline: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  homeLogoLarge: {
    width: 180,
    height: 120,
    resizeMode: 'contain',
  },
  welcomeSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    marginBottom: Spacing.sm,
  },
  welcomeSubtitle: {
    opacity: 0.7,
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
  tipsContainer: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  largeLogo: {
    width: 200,
    height: 140,
    resizeMode: 'contain',
  },
});