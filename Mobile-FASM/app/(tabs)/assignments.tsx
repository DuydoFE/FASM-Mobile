import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

const ASSIGNMENTS = [
  {
    id: '1',
    title: 'OOP Lab 3: Inheritance',
    course: 'Object Oriented Programming',
    dueDate: '2023-11-15',
    status: 'Pending',
    color: Colors.light.primary,
  },
  {
    id: '2',
    title: 'Database Design Project',
    course: 'Database Systems',
    dueDate: '2023-11-20',
    status: 'In Progress',
    color: Colors.light.accent,
  },
  {
    id: '3',
    title: 'Mobile App UI Mockup',
    course: 'Mobile Development',
    dueDate: '2023-11-10',
    status: 'Submitted',
    color: Colors.light.success,
  },
  {
    id: '4',
    title: 'Algorithm Analysis Report',
    course: 'Algorithms',
    dueDate: '2023-11-25',
    status: 'Pending',
    color: Colors.light.warning,
  },
];

const FILTERS = ['All', 'Pending', 'In Progress', 'Submitted', 'Graded'];

export default function AssignmentsScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const filteredAssignments = activeFilter === 'All' 
    ? ASSIGNMENTS 
    : ASSIGNMENTS.filter(a => a.status === activeFilter);

  const renderAssignmentItem = ({ item }: { item: typeof ASSIGNMENTS[0] }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: cardBg }, Shadows.light.sm]}
      activeOpacity={0.7}
    >
      <View style={[styles.cardHeader, { borderLeftColor: item.color }]}>
        <View style={styles.headerContent}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{item.title}</ThemedText>
          <ThemedText type="caption" style={styles.courseName}>{item.course}</ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${item.color}15` }]}>
          <ThemedText type="caption" style={{ color: item.color, fontWeight: '600' }}>
            {item.status}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.dateContainer}>
          <IconSymbol name="calendar" size={14} color={Colors.light.icon} style={styles.dateIcon} />
          <ThemedText type="caption" style={styles.dateText}>Due: {item.dueDate}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="largeTitle">Assignments</ThemedText>
          <TouchableOpacity style={[styles.addButton, { backgroundColor: primaryColor }]}>
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
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

        <FlatList
          data={filteredAssignments}
          renderItem={renderAssignmentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <IconSymbol name="doc.text" size={48} color={Colors.light.icon} />
              <ThemedText type="subtitle" style={styles.emptyText}>No assignments found</ThemedText>
            </View>
          }
        />
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
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: Spacing.xs,
  },
  dateText: {
    opacity: 0.6,
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
});
