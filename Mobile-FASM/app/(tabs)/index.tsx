import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FeatureCard } from '@/components/home/feature-card';
import { HomeHeader } from '@/components/home/home-header';
import { RecentActivity } from '@/components/home/recent-activity';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {

  return (
    <ThemedView style={styles.container}>
      <HomeHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold">Tính năng chính</ThemedText>

          <View style={styles.grid}>
            <FeatureCard title="My Classes" subtitle="5 lớp học" color="#7b61ff" />
            <FeatureCard title="Assignments" subtitle="12 bài tập" color="#ff8a5b" />
            <FeatureCard title="Notifications" subtitle="3 thông báo mới" color="#ffd24a" />
            <FeatureCard title="Grades" subtitle="Xem điểm số" color="#00b57f" />
          </View>
        </View>

        <View style={[styles.section, { marginTop: 6 }]}> 
          <ThemedText type="defaultSemiBold">Hoạt động gần đây</ThemedText>
          <RecentActivity />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 18,
  },
  section: {
    marginTop: 14,
  },
  grid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subtitle: {
    marginVertical: 6,
  },
  scrollContent: {
    paddingBottom: 120,
  },
});