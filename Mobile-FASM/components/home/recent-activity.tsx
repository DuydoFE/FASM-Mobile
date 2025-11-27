import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function RecentActivity() {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  
  const items = [
    { 
      id: '1', 
      title: 'Submitted OOP Lab 3', 
      subtitle: '2 hours ago', 
      icon: 'doc.text.fill',
      color: Colors.light.success,
      status: 'Completed'
    },
    { 
      id: '2', 
      title: 'Database Assignment Graded', 
      subtitle: 'Yesterday', 
      icon: 'star.fill',
      color: Colors.light.warning,
      status: '8.5/10'
    },
    { 
      id: '3', 
      title: 'New Feedback from Lecturer', 
      subtitle: '3 days ago', 
      icon: 'bubble.left.fill',
      color: Colors.light.info,
      status: 'Review'
    },
  ];

  return (
    <View>
      {items.map((it, index) => (
        <TouchableOpacity 
          key={it.id} 
          style={[
            styles.item, 
            { backgroundColor, borderColor },
            index !== items.length - 1 && styles.borderBottom
          ]} 
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${it.color}15` }]}>
            <IconSymbol name={it.icon as any} size={20} color={it.color} />
          </View>
          
          <View style={styles.content}>
            <ThemedText type="defaultSemiBold" style={styles.title} numberOfLines={1}>
              {it.title}
            </ThemedText>
            <ThemedText type="caption" style={styles.time}>
              {it.subtitle}
            </ThemedText>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: `${it.color}10` }]}>
            <ThemedText type="caption" style={{ color: it.color, fontWeight: '600' }}>
              {it.status}
            </ThemedText>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 15,
    marginBottom: 2,
  },
  time: {
    opacity: 0.5,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
});
