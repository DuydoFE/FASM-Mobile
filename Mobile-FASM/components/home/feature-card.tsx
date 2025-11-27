import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export function FeatureCard({ 
  title,
  subtitle,
  color,
  icon,
  onPress
}: {
  title: string;
  subtitle?: string;
  color?: string;
  icon?: string;
  onPress?: () => void;
}) {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor }, Shadows.light.sm]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: color ? `${color}20` : '#eee' }]}>
        <IconSymbol 
          name={icon as any || "star.fill"} 
          size={24} 
          color={color || '#000'} 
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
        {subtitle ? <ThemedText type="caption" style={styles.subtitle}>{subtitle}</ThemedText> : null}
      </View>
      <View style={styles.arrow}>
        <IconSymbol name="chevron.right" size={16} color={Colors.light.icon} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    width: '48%',
    marginBottom: Spacing.md,
    position: 'relative',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.6,
  },
  arrow: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
  },
});
