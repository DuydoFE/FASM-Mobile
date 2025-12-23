import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />

          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          
          <Stack.Screen name="details" options={{ title: 'Chi Tiết Sản Phẩm' }} />
          
          <Stack.Screen
            name="course-assignments"
            options={{
              headerShown: false,
              title: 'Assignments'
            }}
          />
          
          <Stack.Screen
            name="assignment-details"
            options={{
              headerShown: false,
              title: 'Assignment Details'
            }}
          />
          
          <Stack.Screen
            name="instructor-course-assignments"
            options={{
              headerShown: false,
              title: 'Course Assignments'
            }}
          />
          
          <Stack.Screen
            name="instructor-course-rubrics"
            options={{
              headerShown: false,
              title: 'Course Rubrics'
            }}
          />
          
          <Stack.Screen
            name="instructor-manage-student"
            options={{
              headerShown: false,
              title: 'Manage Students'
            }}
          />
          
          <Stack.Screen
            name="instructor-statistic-courseinstance"
            options={{
              headerShown: false,
              title: 'Course Statistics'
            }}
          />
          
          <Stack.Screen
            name="peer-review"
            options={{
              headerShown: false,
              title: 'Peer Review'
            }}
          />
          
          <Stack.Screen
            name="rubric-detail"
            options={{
              headerShown: false,
              title: 'Rubric Details'
            }}
          />
          
          <Stack.Screen
            name="search-results"
            options={{
              headerShown: false,
              title: 'Search Results'
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </Provider>
  );
}