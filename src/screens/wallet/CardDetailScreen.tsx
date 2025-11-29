import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function CardDetailScreen({ route, navigation }: any) {
  const { card } = route.params;

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'student-id':
        return 'school';
      case 'loyalty':
        return 'gift';
      case 'discount':
        return 'pricetag';
      default:
        return 'card';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={getCardIcon(card.type) as any} 
          size={60} 
          color="#4CAF50" 
        />
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardType}>
          {card.type.replace('-', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        
        {card.cardNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Card Number:</Text>
            <Text style={styles.infoValue}>{card.cardNumber}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Added:</Text>
          <Text style={styles.infoValue}>
            {card.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
          </Text>
        </View>
      </View>

      {card.barcodeData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Barcode</Text>
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeType}>{card.barcodeType}</Text>
            <Text style={styles.barcodeData}>{card.barcodeData}</Text>
            {/* In a real app, you would render the actual barcode here */}
            <View style={styles.barcodePlaceholder}>
              <Ionicons name="barcode-outline" size={100} color="#666" />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Share Card</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  cardType: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  barcodeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  barcodeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  barcodeData: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 20,
  },
  barcodePlaceholder: {
    width: 200,
    height: 100,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#4CAF50',
    marginLeft: 12,
    fontWeight: '500',
  },
});
