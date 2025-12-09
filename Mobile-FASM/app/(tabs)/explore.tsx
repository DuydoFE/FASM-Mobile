import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const RESOURCES = [
  {
    id: '1',
    title: 'Library Resources',
    description: 'Access digital textbooks, journals, and research papers.',
    icon: 'book.fill',
    color: Colors.light.primary,
  },
  {
    id: '2',
    title: 'Student Portal',
    description: 'Manage your enrollment, grades, and financial aid.',
    icon: 'person.crop.rectangle.fill',
    color: Colors.light.accent,
  },
  {
    id: '3',
    title: 'Campus Map',
    description: 'Navigate the university campus with ease.',
    icon: 'map.fill',
    color: Colors.light.success,
  },
  {
    id: '4',
    title: 'Events Calendar',
    description: 'Stay updated with upcoming workshops and seminars.',
    icon: 'calendar',
    color: Colors.light.warning,
  },
  {
    id: '5',
    title: 'Career Center',
    description: 'Find internships, jobs, and career guidance.',
    icon: 'briefcase.fill',
    color: Colors.light.info,
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">Explore</ThemedText>
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: Colors.light.backgroundTertiary }]}
            onPress={() => router.push('/search-results?query=')}
          >
            <IconSymbol name="magnifyingglass" size={18} color={Colors.light.icon} style={styles.searchIcon} />
            <ThemedText style={styles.placeholder}>Search resources...</ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.featuredSection}>
            <View style={[styles.featuredCard, { backgroundColor: primaryColor }]}>
              <View style={styles.featuredContent}>
                <ThemedText type="title" style={styles.featuredTitle}>Student Handbook 2024</ThemedText>
                <ThemedText style={styles.featuredSubtitle}>Everything you need to know about campus life.</ThemedText>
                <TouchableOpacity style={styles.readMoreBtn}>
                  <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>Read Now</ThemedText>
                </TouchableOpacity>
              </View>
              <IconSymbol name="book.circle.fill" size={100} color="rgba(255,255,255,0.2)" style={styles.featuredIcon} />
            </View>
          </View>

          <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Links</ThemedText>
          
          <View style={styles.grid}>
            {RESOURCES.map((item) => (
              <TouchableOpacity 
                key={item.id}
                style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
                activeOpacity={0.8}
              >
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}15` }]}>
                  <IconSymbol name={item.icon as any} size={24} color={item.color} />
                </View>
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
                <ThemedText type="caption" style={styles.cardDesc}>{item.description}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  placeholder: {
    opacity: 0.5,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  featuredSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  featuredCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    height: 180,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  featuredContent: {
    zIndex: 1,
    width: '70%',
  },
  featuredTitle: {
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  readMoreBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  featuredIcon: {
    position: 'absolute',
    right: -20,
    bottom: -20,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 160,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDesc: {
    opacity: 0.6,
    lineHeight: 18,
  },
});
