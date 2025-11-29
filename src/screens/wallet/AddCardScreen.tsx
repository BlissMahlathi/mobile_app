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
import walletService from '../../services/walletService';
import authService from '../../services/authService';

export default function AddCardScreen({ navigation }: any) {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState<'student-id' | 'loyalty' | 'discount'>('loyalty');

  const handleAddCard = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    try {
      await addDoc(collection(db, 'cards'), {
        userId: user.uid,
        name: cardName,
        cardNumber: cardNumber || null,
        type: cardType,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Card added successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add card');
      console.error(error);
    }
  };

  const cardTypes = [
    { value: 'student-id', label: 'Student ID', icon: 'school' },
    { value: 'loyalty', label: 'Loyalty Card', icon: 'gift' },
    { value: 'discount', label: 'Discount Card', icon: 'pricetag' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Card Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., University ID, Starbucks Rewards"
          value={cardName}
          onChangeText={setCardName}
        />

        <Text style={styles.label}>Card Number (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter card number"
          value={cardNumber}
          onChangeText={setCardNumber}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Card Type *</Text>
        <View style={styles.typeContainer}>
          {cardTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                cardType === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setCardType(type.value as any)}
            >
              <Ionicons
                name={type.icon as any}
                size={24}
                color={cardType === type.value ? '#fff' : '#4CAF50'}
              />
              <Text
                style={[
                  styles.typeText,
                  cardType === type.value && styles.typeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScanCard')}
        >
          <Ionicons name="barcode-outline" size={20} color="#4CAF50" />
          <Text style={styles.scanButtonText}>Or Scan Barcode</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeContainer: {
    marginTop: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
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
    marginLeft: 12,
    fontWeight: '500',
  },
  typeTextActive: {
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
  },
  scanButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    marginLeft: 8,
  },
});
