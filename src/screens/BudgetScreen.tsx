import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import budgetService from '../services/budgetService';
import authService from '../services/authService';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export default function BudgetScreen({ navigation }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        txData.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txData);
    });

    return () => unsubscribe();
  }, []);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budget Overview</Text>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Ionicons name="trending-up" size={32} color="#4CAF50" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryAmount, { color: '#4CAF50' }]}>
            ${totalIncome.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="trending-down" size={32} color="#f44336" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={[styles.summaryAmount, { color: '#f44336' }]}>
            ${totalExpenses.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="wallet" size={32} color="#2196F3" />
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryAmount, { color: '#2196F3' }]}>
            ${balance.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
        </View>
        
        {Object.keys(expensesByCategory).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No expenses yet</Text>
          </View>
        ) : (
          Object.entries(expensesByCategory).map(([category, amount]) => (
            <View key={category} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category}</Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(amount / totalExpenses) * 100}%` }
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.categoryAmount}>${amount.toFixed(2)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 5).map((transaction) => (
          <View key={transaction.id} style={styles.transactionRow}>
            <View style={styles.transactionIcon}>
              <Ionicons
                name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'}
                size={20}
                color={transaction.type === 'income' ? '#4CAF50' : '#f44336'}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDesc}>{transaction.description}</Text>
              <Text style={styles.transactionCategory}>{transaction.category}</Text>
            </View>
            <Text
              style={[
                styles.transactionAmount,
                { color: transaction.type === 'income' ? '#4CAF50' : '#f44336' }
              ]}
            >
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Transaction</Text>
      </TouchableOpacity>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryInfo: {
    flex: 1,
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
