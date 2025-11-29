import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

export default function ProfileScreen({ navigation }: any) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [discountAlerts, setDiscountAlerts] = useState(true);
  const [dailyReminders, setDailyReminders] = useState(false);

  const user = authService.getCurrentUser();

  useEffect(() => {
    checkNotificationPermissions();
  }, []);

  const checkNotificationPermissions = async () => {
    const hasPermission = await notificationService.requestPermissions();
    setNotificationsEnabled(hasPermission);
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
            // Navigation will be handled by auth state listener
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const toggleDailyReminders = async (value: boolean) => {
    setDailyReminders(value);
    if (value) {
      await notificationService.scheduleDailyReminder(20, 0); // 8 PM
      Alert.alert('Success', 'Daily reminders enabled at 8:00 PM');
    } else {
      await notificationService.cancelAllNotifications();
      Alert.alert('Success', 'Daily reminders disabled');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#4CAF50" />
        </View>
        <Text style={styles.name}>{user?.displayName || 'Student'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#4CAF50" />
            <Text style={styles.settingLabel}>Budget Alerts</Text>
          </View>
          <Switch
            value={budgetAlerts}
            onValueChange={setBudgetAlerts}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="pricetag" size={24} color="#4CAF50" />
            <Text style={styles.settingLabel}>Discount Alerts</Text>
          </View>
          <Switch
            value={discountAlerts}
            onValueChange={setDiscountAlerts}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="time" size={24} color="#4CAF50" />
            <Text style={styles.settingLabel}>Daily Reminders</Text>
          </View>
          <Switch
            value={dailyReminders}
            onValueChange={toggleDailyReminders}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#333" />
          <Text style={styles.menuText}>About</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#f44336" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Budget Buddy v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for Students</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
});
