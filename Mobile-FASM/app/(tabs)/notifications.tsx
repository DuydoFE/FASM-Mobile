import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotificationsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Thông báo</ThemedText>
      <ThemedText style={styles.subtitle}>Các thông báo mới sẽ xuất hiện ở đây.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  subtitle: {
    marginTop: 12,
  },
});
