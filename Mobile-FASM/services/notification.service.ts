import { Notification, NotificationListResponse } from '@/types/api.types';
import apiClient from './api';

/**
 * Notification Service
 * Handles API calls for user notifications
 */

const ENDPOINTS = {
  getMyNotifications: '/api/Notifications/my-notifications',
  markAsRead: (notificationId: number) => `/api/Notifications/${notificationId}/read`,
  markAllAsRead: '/api/Notifications/mark-all-read',
};

/**
 * Get all notifications for the current user
 * @param unreadOnly - If true, only return unread notifications
 * @returns Promise with the list of notifications
 */
export const getMyNotifications = async (
  unreadOnly: boolean = false
): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<NotificationListResponse>(
      ENDPOINTS.getMyNotifications,
      {
        params: { unreadOnly },
      }
    );
    
    if (response.data.statusCode === 200 && response.data.data) {
      return response.data.data;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param notificationId - The ID of the notification to mark as read
 * @returns Promise with success status
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<boolean> => {
  try {
    const response = await apiClient.put<{ statusCode: number; message: string; errors?: Array<{ message: string }> }>(
      ENDPOINTS.markAsRead(notificationId)
    );
    
    if (response.data.statusCode === 200) {
      return true;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    return false;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns Promise with success status
 */
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const response = await apiClient.put<{ statusCode: number; message: string; errors?: Array<{ message: string }> }>(
      ENDPOINTS.markAllAsRead
    );
    
    if (response.data.statusCode === 200) {
      return true;
    }
    
    // Handle error cases
    if (response.data.errors && response.data.errors.length > 0) {
      throw new Error(response.data.errors[0].message);
    }
    
    return false;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

export default {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};