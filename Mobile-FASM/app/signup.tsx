import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({ light: '#F3F4F6', dark: '#1F2937' }, 'background');

  const handleSignup = () => {
    // Implement signup logic here
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <IconSymbol name="arrow.left" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.logoSection}>
              <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                <IconSymbol name="person.badge.plus" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="largeTitle" style={styles.appName}>
                Create Account
              </ThemedText>
              <ThemedText style={styles.appTagline}>
                Join FASM today
              </ThemedText>
            </View>

            <View style={styles.formSection}>
              
              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Full Name
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
                  <IconSymbol name="person.fill" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={placeholderColor}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Student ID
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
                  <IconSymbol name="number" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Enter your student ID"
                    placeholderTextColor={placeholderColor}
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Password
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
                  <IconSymbol name="lock.fill" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Create a password"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <IconSymbol
                      name={showPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={placeholderColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Confirm Password
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
                  <IconSymbol name="lock.fill" size={20} color={placeholderColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: textColor }]}
                    placeholder="Confirm your password"
                    placeholderTextColor={placeholderColor}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <IconSymbol
                      name={showConfirmPassword ? 'eye.slash.fill' : 'eye.fill'}
                      size={20}
                      color={placeholderColor}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.loginButton, { backgroundColor: primaryColor }]}
                onPress={handleSignup}
                activeOpacity={0.8}
              >
                <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
                  Sign Up
                </ThemedText>
              </TouchableOpacity>

            </View>

            <View style={styles.footer}>
              <ThemedText type="default">Already have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.back()}>
                <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.light.md,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  appTagline: {
    opacity: 0.6,
  },
  formSection: {
    marginTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  eyeIcon: {
    padding: Spacing.sm,
  },
  loginButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadows.light.md,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
});