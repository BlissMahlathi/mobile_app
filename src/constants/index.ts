// App Constants
export const APP_NAME = 'Budget Buddy';
export const APP_VERSION = '1.0.0';

// Transaction Categories
export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Books',
  'Entertainment',
  'Shopping',
  'Bills',
  'Health',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Allowance',
  'Part-time Job',
  'Scholarship',
  'Gift',
  'Investment',
  'Other',
];

// Card Types
export const CARD_TYPES = {
  STUDENT_ID: 'student-id',
  LOYALTY: 'loyalty',
  DISCOUNT: 'discount',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BUDGET_ALERT: 'budget_alert',
  DISCOUNT: 'discount',
  REMINDER: 'reminder',
  WEEKLY_SUMMARY: 'weekly_summary',
};

// Budget Thresholds
export const BUDGET_THRESHOLDS = {
  WARNING: 0.8, // 80%
  CRITICAL: 1.0, // 100%
  OVERSPENT: 1.2, // 120%
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MM/DD/YYYY',
  LONG: 'MMMM DD, YYYY',
  TIME: 'hh:mm A',
  FULL: 'MMMM DD, YYYY hh:mm A',
};

// Firebase Collections
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  CARDS: 'cards',
  GROCERY_LISTS: 'groceryLists',
  NOTIFICATIONS: 'notifications',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please try again.',
  PERMISSION_DENIED: 'Permission denied. Please check your settings.',
  INVALID_INPUT: 'Invalid input. Please check your data.',
  UNKNOWN: 'An unknown error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  TRANSACTION_ADDED: 'Transaction added successfully!',
  CARD_ADDED: 'Card added successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  BUDGET_UPDATED: 'Budget updated successfully!',
};

export default {
  APP_NAME,
  APP_VERSION,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CARD_TYPES,
  NOTIFICATION_TYPES,
  BUDGET_THRESHOLDS,
  DATE_FORMATS,
  COLLECTIONS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
