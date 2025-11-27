import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function RecentActivity() {
  const items = [
    { id: '1', title: 'Đã nộp bài tập OOP Lab 3', subtitle: '2 giờ trước', icon: 'chevron.left.forwardslash.chevron.right' },
    { id: '2', title: 'Nhận điểm bài tập Database', subtitle: '1 ngày trước', icon: 'chevron.left.forwardslash.chevron.right' },
    { id: '3', title: 'Có feedback mới từ giảng viên', subtitle: '3 ngày trước', icon: 'chevron.left.forwardslash.chevron.right' },
  ];

  return (
    <View>
      {items.map((it) => (
        <TouchableOpacity key={it.id} style={styles.item} activeOpacity={0.8}>
          <View style={styles.leftIcon}>
            <IconSymbol name={it.icon as any} size={18} color="#7b61ff" />
          </View>
          <View style={styles.content}>
            <ThemedText type="defaultSemiBold">{it.title}</ThemedText>
            <ThemedText style={styles.time}>{it.subtitle}</ThemedText>
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  leftIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(123,97,255,0.08)',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  time: {
    color: '#8a8a8a',
    marginTop: 6,
  },
});
