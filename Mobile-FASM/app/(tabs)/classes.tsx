import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const CLASSES = [
  {
    id: '1',
    name: 'Object Oriented Programming',
    code: 'CS101',
    instructor: 'Dr. Alan Turing',
    schedule: 'Mon, Wed 10:00 AM',
    room: 'B204',
    color: Colors.light.primary,
    progress: 0.75,
  },
  {
    id: '2',
    name: 'Database Systems',
    code: 'CS202',
    instructor: 'Prof. Ada Lovelace',
    schedule: 'Tue, Thu 02:00 PM',
    room: 'A101',
    color: Colors.light.accent,
    progress: 0.45,
  },
  {
    id: '3',
    name: 'Mobile Development',
    code: 'SE301',
    instructor: 'Mr. Steve Jobs',
    schedule: 'Fri 09:00 AM',
    room: 'Lab 3',
    color: Colors.light.success,
    progress: 0.90,
  },
  {
    id: '4',
    name: 'Algorithms & Data Structures',
    code: 'CS201',
    instructor: 'Dr. Grace Hopper',
    schedule: 'Mon 01:00 PM',
    room: 'C305',
    color: Colors.light.warning,
    progress: 0.60,
  },
];

export default function ClassesScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">My Classes</ThemedText>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {CLASSES.map((item) => (
            <TouchableOpacity 
              key={item.id}
              style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
              activeOpacity={0.8}
            >
              <View style={[styles.cardBanner, { backgroundColor: item.color }]}>
                <View style={styles.codeBadge}>
                  <ThemedText type="caption" style={styles.codeText}>{item.code}</ThemedText>
                </View>
                <IconSymbol name="book.fill" size={24} color="rgba(255,255,255,0.3)" style={styles.bannerIcon} />
              </View>
              
              <View style={styles.cardContent}>
                <ThemedText type="title" style={styles.className}>{item.name}</ThemedText>
                <ThemedText type="default" style={styles.instructor}>{item.instructor}</ThemedText>
                
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <IconSymbol name="clock" size={14} color={Colors.light.icon} style={styles.infoIcon} />
                    <ThemedText type="caption" style={styles.infoText}>{item.schedule}</ThemedText>
                  </View>
                  <View style={styles.infoItem}>
                    <IconSymbol name="mappin.and.ellipse" size={14} color={Colors.light.icon} style={styles.infoIcon} />
                    <ThemedText type="caption" style={styles.infoText}>{item.room}</ThemedText>
                  </View>
                </View>

                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
                  </View>
                  <ThemedText type="caption" style={styles.progressText}>{Math.round(item.progress * 100)}% Complete</ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.light.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  cardBanner: {
    height: 80,
    padding: Spacing.md,
    position: 'relative',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  codeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  codeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  bannerIcon: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    transform: [{ scale: 2.5 }],
  },
  cardContent: {
    padding: Spacing.md,
  },
  className: {
    fontSize: 18,
    marginBottom: 4,
  },
  instructor: {
    opacity: 0.6,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: Spacing.xs,
  },
  infoText: {
    opacity: 0.6,
  },
  progressContainer: {
    marginTop: Spacing.xs,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    alignSelf: 'flex-end',
    opacity: 0.5,
    fontSize: 11,
  },
});
