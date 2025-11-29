import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Barcode from 'react-native-barcode-svg';

export default function CardDetailScreen({ route, navigation }: any) {
  const { card } = route.params;
  const [brightness, setBrightness] = useState(1.0);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${card.card_name}\nCard Number: ${card.card_number || 'N/A'}\nBarcode: ${card.barcode_data || 'N/A'}`,
      });
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };

  const increaseBrightness = () => {
    Alert.alert(
      'Brightness Boost',
      'For better scanning, please increase your device brightness to maximum in your device settings.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Ionicons 
          name={getCardIcon(card.card_type) as any} 
          size={60} 
          color="#4CAF50" 
        />
        <Text style={styles.cardName}>{card.card_name}</Text>
        <Text style={styles.cardType}>
          {card.card_type.replace('-', ' ').toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Card Information</Text>
        
        {card.card_number && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Card Number:</Text>
            <Text style={styles.infoValue}>{card.card_number}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Type:</Text>
          <Text style={styles.infoValue}>
            {card.card_type?.replace('-', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Added:</Text>
          <Text style={styles.infoValue}>
            {new Date(card.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {card.barcode_data && (
        <View style={styles.section}>
          <View style={styles.barcodeSectionHeader}>
            <Text style={styles.sectionTitle}>Scannable Barcode</Text>
            <TouchableOpacity onPress={increaseBrightness} style={styles.brightnessButton}>
              <Ionicons name="sunny" size={20} color="#4CAF50" />
              <Text style={styles.brightnessText}>Boost</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.barcodeInstructions}>
            Show this barcode to scanners at shops, gates, or checkpoints
          </Text>
          
          <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeType}>{card.barcode_format}</Text>
            <View style={styles.barcodeWrapper}>
              <Barcode
                value={card.barcode_data}
                format={getBarcodeFormat(card.barcode_format)}
                width={2}
                height={100}
                background="#FFFFFF"
                text={card.barcode_data}
              />
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#4CAF50" />
          <Text style={styles.actionText}>Share Card Details</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color="#999" />
        <Text style={styles.footerText}>
          Keep your screen bright for better barcode scanning
        </Text>
      </View>
    </ScrollView>
  );
}

function getBarcodeFormat(type: string): string {
  // Map barcode types to supported formats
  const formatMap: { [key: string]: string } = {
    'org.gs1.EAN-13': 'EAN13',
    'org.gs1.EAN-8': 'EAN8',
    'org.iso.Code39': 'CODE39',
    'org.iso.Code128': 'CODE128',
    'org.gs1.UPC-A': 'UPC',
    'org.gs1.UPC-E': 'UPC',
    'org.iso.QRCode': 'CODE128', // QR codes aren't supported, fallback to CODE128
  };
  
  return formatMap[type] || 'CODE128'; // Default to CODE128
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
  barcodeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brightnessButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  brightnessText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  barcodeInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
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
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  barcodeWrapper: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    marginVertical: 16,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
    elevation: 4,
  },
  barcodeType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 8,
    fontStyle: 'italic',
  },
});
