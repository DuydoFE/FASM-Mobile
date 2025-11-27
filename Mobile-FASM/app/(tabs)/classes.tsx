import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ClassesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Lớp học</ThemedText>
      <ThemedText style={styles.subtitle}>Danh sách lớp của bạn sẽ hiển thị ở đây.</ThemedText>
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
