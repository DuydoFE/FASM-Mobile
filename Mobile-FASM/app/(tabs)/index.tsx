import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  const router = useRouter(); // Hook để điều hướng

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to Home Screen</ThemedText>
      <ThemedText style={styles.subtitle}>
        Đây là màn hình chính của ứng dụng.
      </ThemedText>
      
      {/* Nút điều hướng sang màn hình chi tiết và truyền dữ liệu */}
      <Button 
        title="Go to Details screen"
        onPress={() => router.push({
          pathname: "/details",
          params: { id: '123', name: 'Product A' }
        })}
      />
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
  subtitle: {
    marginVertical: 15,
  },
});