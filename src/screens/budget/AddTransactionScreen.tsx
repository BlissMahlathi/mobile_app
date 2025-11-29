import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import budgetService from '../../services/budgetService';
import authService from '../../services/authService';

const CATEGORIES = {
  income: ['Allowance', 'Part-time Job', 'Scholarship', 'Gift', 'Other'],
  expense: ['Food', 'Transport', 'Books', 'Entertainment', 'Shopping', 'Bills', 'Other'],
};

export default function AddTransactionScreen({ navigation }: any) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');

  const handleAddTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(),
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Transaction added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction');
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
            onPress={() => {
              setType('income');
              setCategory(CATEGORIES.income[0]);
            }}
          >
            <Ionicons
              name="arrow-down"
              size={24}
              color={type === 'income' ? '#fff' : '#4CAF50'}
            />
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
            onPress={() => {
              setType('expense');
              setCategory(CATEGORIES.expense[0]);
            }}
          >
            <Ionicons
              name="arrow-up"
              size={24}
              color={type === 'expense' ? '#fff' : '#f44336'}
            />
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Amount *</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <Text style={styles.label}>Category *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES[type].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Lunch at cafeteria"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <TouchableOpacity style={styles.addButton} onPress={handleAddTransaction}>
          <Text style={styles.addButtonText}>Add Transaction</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  typeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
  },
  categoriesScroll: {
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
