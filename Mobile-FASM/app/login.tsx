import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { authService } from '@/services/auth.service';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

export default function LoginScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const inputBg = useThemeColor({ light: '#F3F4F6', dark: '#1F2937' }, 'background');

  /**
   * Handle user login
   * Validates input and calls authentication service
   */
  const handleLogin = async () => {
    console.log('handleLogin called');
    
    // Validate input
    if (!studentId.trim()) {
      Alert.alert('Validation Error', 'Please enter your student ID');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Validation Error', 'Please enter your password');
      return;
    }

    console.log('Starting login with:', { studentId: studentId.trim() });
    setIsLoading(true);

    try {
      // Call login service
      const response = await authService.login(studentId.trim(), password);

      console.log('Login response received:', {
        statusCode: response.statusCode,
        hasData: !!response.data,
        errors: response.errors,
      });

      if (response.statusCode === 200 && response.data) {
        // Login successful - Save user data to Redux store
        dispatch(setCredentials(response.data));
        
        Alert.alert(
          'Login Successful',
          `Welcome back, ${response.data.firstName} ${response.data.lastName}!`,
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      } else {
        // Login failed - show error message
        const errorMessage = response.errors.length > 0
          ? response.errors[0].message
          : response.message || 'Login failed';
        
        console.log('Login failed with message:', errorMessage);
        Alert.alert('Login Failed', errorMessage);
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Login catch block error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please check console for details.'
      );
    } finally {
      setIsLoading(false);
      console.log('Login attempt finished');
    }
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
              <TouchableOpacity
                onPress={() => {
                  if (navigation.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(tabs)');
                  }
                }}
                style={styles.backButton}
              >
                <IconSymbol name="arrow.left" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.logoSection}>
              <View style={[styles.logoContainer, { backgroundColor: primaryColor }]}>
                <IconSymbol name="book.fill" size={40} color="#FFFFFF" />
              </View>
              <ThemedText type="largeTitle" style={styles.appName}>
                FASM
              </ThemedText>
              <ThemedText style={styles.appTagline}>
                Fast Assignment Management System
              </ThemedText>
            </View>

            <View style={styles.formSection}>
              <View style={styles.welcomeContainer}>
                <ThemedText type="title">Welcome Back!</ThemedText>
                <ThemedText style={styles.subtitle}>
                  Sign in to continue your learning journey
                </ThemedText>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Student ID
                </ThemedText>
                <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
                  <IconSymbol name="person.fill" size={20} color={placeholderColor} style={styles.inputIcon} />
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
                    placeholder="Enter your password"
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
                <TouchableOpacity style={styles.forgotPassword}>
                  <ThemedText type="small" style={{ color: primaryColor }}>
                    Forgot Password?
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: primaryColor },
                  isLoading && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={styles.loginButtonText}>
                    Sign In
                  </ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
                <ThemedText type="small" style={styles.dividerText}>
                  OR
                </ThemedText>
                <View style={[styles.dividerLine, { backgroundColor: borderColor }]} />
              </View>

              <TouchableOpacity
                style={[styles.socialButton, { borderColor }]}
                activeOpacity={0.7}
              >
                <View style={styles.socialIconPlaceholder}>
                  <ThemedText type="defaultSemiBold" style={{ color: '#EA4335' }}>G</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold">Continue with Google</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <ThemedText type="default">Don't have an account? </ThemedText>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <ThemedText type="defaultSemiBold" style={{ color: primaryColor }}>
                  Sign Up
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
    marginTop: Spacing.lg,
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
  welcomeContainer: {
    marginBottom: Spacing.xl,
  },
  subtitle: {
    marginTop: Spacing.xs,
    opacity: 0.6,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: Spacing.sm,
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
  loginButtonDisabled: {
    opacity: 0.6,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    opacity: 0.5,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  socialIconPlaceholder: {
    marginRight: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
});
