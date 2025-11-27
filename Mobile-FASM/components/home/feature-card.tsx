import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function FeatureCard({ title, subtitle, color }: { title: string; subtitle?: string; color?: string }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      <View style={[styles.iconWrap, { backgroundColor: color ?? '#eee' }]}>
        <IconSymbol name="chevron.left.forwardslash.chevron.right" size={22} color="#fff" />
      </View>
      <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
      {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
  },
  subtitle: {
    color: '#7b7b7b',
    marginTop: 6,
  },
});
