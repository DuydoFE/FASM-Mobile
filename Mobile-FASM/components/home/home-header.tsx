import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function HomeHeader() {
  return (
    <ThemedView style={styles.header}>
      <View style={styles.topRow}>
        <View>
          <ThemedText type="title" style={styles.appName}>
            FASM
          </ThemedText>
          <ThemedText style={styles.welcome}>Chào mừng trở lại!</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.username}>
            StudentSE2 Lastname
          </ThemedText>
        </View>

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

        <TouchableOpacity style={styles.ghostBtn}>
          <ThemedText style={styles.ghostBtnText}>Đăng ký</ThemedText>
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
    fontSize: 20,
  },
  welcome: {
    color: 'rgba(255,255,255,0.95)',
    marginTop: 6,
  },
  username: {
    color: '#fff',
    marginTop: 4,
  },
  actions: {},
  iconBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 8,
    borderRadius: 12,
  },
  authRow: {
    marginTop: 22,
    flexDirection: 'row',
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: '#00b57f',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  ghostBtn: {
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  ghostBtnText: {
    color: '#2b2b2b',
    fontWeight: '600',
  },
});
