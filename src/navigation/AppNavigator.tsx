import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/WalletScreen';
import BudgetScreen from '../screens/BudgetScreen';
import GroceryListScreen from '../screens/GroceryListScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Wallet stack screens
import AddCardScreen from '../screens/wallet/AddCardScreen';
import ScanCardScreen from '../screens/wallet/ScanCardScreen';
import CardDetailScreen from '../screens/wallet/CardDetailScreen';

// Budget stack screens
import AddTransactionScreen from '../screens/budget/AddTransactionScreen';
import TransactionHistoryScreen from '../screens/budget/TransactionHistoryScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const WalletStack = createStackNavigator();
const BudgetStack = createStackNavigator();

// Wallet Navigator
function WalletNavigator() {
  return (
    <WalletStack.Navigator>
      <WalletStack.Screen 
        name="WalletMain" 
        component={WalletScreen}
        options={{ title: 'Digital Wallet' }}
      />
      <WalletStack.Screen 
        name="AddCard" 
        component={AddCardScreen}
        options={{ title: 'Add Card' }}
      />
      <WalletStack.Screen 
        name="ScanCard" 
        component={ScanCardScreen}
        options={{ title: 'Scan Card' }}
      />
      <WalletStack.Screen 
        name="CardDetail" 
        component={CardDetailScreen}
        options={{ title: 'Card Details' }}
      />
    </WalletStack.Navigator>
  );
}

// Budget Navigator
function BudgetNavigator() {
  return (
    <BudgetStack.Navigator>
      <BudgetStack.Screen 
        name="BudgetMain" 
        component={BudgetScreen}
        options={{ title: 'Budget Calculator' }}
      />
      <BudgetStack.Screen 
        name="AddTransaction" 
        component={AddTransactionScreen}
        options={{ title: 'Add Transaction' }}
      />
      <BudgetStack.Screen 
        name="TransactionHistory" 
        component={TransactionHistoryScreen}
        options={{ title: 'Transaction History' }}
      />
    </BudgetStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Wallet') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Budget') {
            iconName = focused ? 'calculator' : 'calculator-outline';
          } else if (route.name === 'Grocery') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Wallet" component={WalletNavigator} />
      <Tab.Screen name="Budget" component={BudgetNavigator} />
      <Tab.Screen name="Grocery" component={GroceryListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Root Navigator with Auth
export default function AppNavigator({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <Stack.Screen name="Main" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}
