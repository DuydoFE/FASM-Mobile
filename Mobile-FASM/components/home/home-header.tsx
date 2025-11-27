import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.topRow}>
        <ThemedText type="title" style={styles.appName}>
          FASM
        </ThemedText>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.iconBtn}>
            <IconSymbol name="chevron.right" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.authRow}>
        <TouchableOpacity style={styles.primaryBtn}>
          <ThemedText style={styles.primaryBtnText}>Đăng nhập</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: '#7b61ff',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appName: {
    color: '#fff',
    fontSize: 24,
  },
  welcome: {
    display: 'none',
  },
  username: {
    display: 'none',
  },
  actions: {},
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 8,
    borderRadius: 12,
  },
  authRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#00b57f',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  ghostBtn: {
    display: 'none',
  },
  ghostBtnText: {
    display: 'none',
  },
});
