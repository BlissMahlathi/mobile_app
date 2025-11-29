import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  // Request permissions
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
      });
    }

    return true;
  }

  // Send local notification
  async sendLocalNotification(title: string, body: string, data?: any) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // Schedule notification
  async scheduleNotification(
    title: string,
    body: string,
    trigger: Date | number,
    data?: any
  ) {
    try {
      const notificationTrigger =
        typeof trigger === 'number'
          ? { seconds: trigger }
          : { date: trigger };

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: notificationTrigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Budget alert notification
  async sendBudgetAlert(spent: number, budget: number, category?: string) {
    const percentage = (spent / budget) * 100;
    let title = 'Budget Alert!';
    let body = '';

    if (percentage >= 100) {
      body = category
        ? `You've exceeded your ${category} budget by $${(spent - budget).toFixed(2)}!`
        : `You've exceeded your monthly budget by $${(spent - budget).toFixed(2)}!`;
    } else if (percentage >= 80) {
      body = category
        ? `You've used ${percentage.toFixed(0)}% of your ${category} budget.`
        : `You've used ${percentage.toFixed(0)}% of your monthly budget.`;
    } else {
      return; // Don't send notification if under 80%
    }

    await this.sendLocalNotification(title, body, {
      type: 'budget_alert',
      category,
    });
  }

  // Discount notification
  async sendDiscountNotification(storeName: string, discount: string) {
    await this.sendLocalNotification(
      '🎉 Discount Available!',
      `${storeName} has ${discount} off for students!`,
      { type: 'discount', storeName }
    );
  }

  // Daily budget reminder
  async scheduleDailyReminder(hour: number = 20, minute: number = 0) {
    const trigger = {
      hour,
      minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Budget Check-in',
        body: 'Have you tracked all your expenses today?',
        sound: true,
      },
      trigger,
    });
  }

  // Weekly summary notification
  async scheduleWeeklySummary(dayOfWeek: number = 0, hour: number = 10) {
    const trigger = {
      weekday: dayOfWeek, // 0 = Sunday, 1 = Monday, etc.
      hour,
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekly Budget Summary',
        body: 'Check out your spending summary for this week!',
        sound: true,
      },
      trigger,
    });
  }

  // Cancel all notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification listener
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ) {
    return Notifications.addNotificationReceivedListener(callback);
  }

  // Get notification response listener
  addNotificationResponseReceivedListener(
    callback: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

export default new NotificationService();
