import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import budgetService from '../../services/budgetService';
import authService from '../../services/authService';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export default function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        txData.push({
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date(),
        } as Transaction);
      });
      setTransactions(txData);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'transactions', id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter(
    (t) => filter === 'all' || t.type === filter
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Ionicons
            name={item.type === 'income' ? 'arrow-down' : 'arrow-up'}
            size={24}
            color={item.type === 'income' ? '#4CAF50' : '#f44336'}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDesc}>{item.description}</Text>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>
            {item.date.toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              { color: item.type === 'income' ? '#4CAF50' : '#f44336' },
            ]}
          >
            {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'income' && styles.filterButtonActive]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterText, filter === 'income' && styles.filterTextActive]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'expense' && styles.filterButtonActive]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[styles.filterText, filter === 'expense' && styles.filterTextActive]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    padding: 16,
  },
  transactionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: '600',
    color: '#333',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
});
