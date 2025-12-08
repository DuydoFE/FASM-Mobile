import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

/**
 * InstructorSearchBar Component
 * Search bar specifically for instructor dashboard to search assignments, feedback, criteria, etc.
 */
export function InstructorSearchBar() {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundTertiary = useThemeColor({}, 'backgroundTertiary');
  const iconColor = useThemeColor({}, 'icon');
  
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/search-results',
        params: { query: searchQuery.trim() },
      } as any);
    }
  };

  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: backgroundTertiary }]}>
        <IconSymbol name="magnifyingglass" size={18} color={iconColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search assignments, classes..."
          placeholderTextColor={iconColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7} style={styles.clearButton}>
            <IconSymbol name="xmark.circle.fill" size={18} color={iconColor} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleSearch}
          activeOpacity={0.7}
          style={[styles.searchButton, { backgroundColor: primaryColor }]}
        >
          <IconSymbol name="magnifyingglass" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
    marginRight: Spacing.xs,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});