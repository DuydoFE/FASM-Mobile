import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function DetailsScreen() {
  const params = useLocalSearchParams(); // Hook để nhận tham số
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Details Screen</ThemedText>
      <ThemedText style={styles.text}>
        Đã nhận được ID: {params.id}
      </ThemedText>
      <ThemedText style={styles.text}>
        Đã nhận được Tên: {params.name}
      </ThemedText>
      
      <Button title="Go Back" onPress={() => router.back()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    marginTop: 10,
  },
});