import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import walletService, { WalletCard } from '../services/walletService';

export default function WalletScreen({ navigation }: any) {
  const [cards, setCards] = useState<WalletCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const loadCards = async () => {
    try {
      if (!refreshing) setLoading(true);
      const walletCards = await walletService.getCards();
      
      // Convert WalletCard to Card format
      const formattedCards: Card[] = walletCards.map((wc: WalletCard) => ({
        id: wc.id,
        name: wc.card_name,
        type: wc.card_type === 'student_id' ? 'student-id' : wc.card_type,
        cardNumber: wc.card_number,
        barcodeData: wc.barcode_data,
        barcodeType: wc.barcode_format,
        createdAt: new Date(wc.created_at)
      }));
      
      setCards(formattedCards);
    } catch (error) {
      console.error('Error loading cards:', error);
      Alert.alert('Error', 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await walletService.deleteCard(cardId);
              await loadCards(); // Reload cards after deletion
            } catch (error) {
              Alert.alert('Error', 'Failed to delete card');
            }
          }
        }
      ]
    );
  };

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

  const renderCard = ({ item }: { item: WalletCard }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CardDetail', { card: item })}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getCardIcon(item.card_type) as any} 
            size={40} 
            color="#4CAF50" 
          />
          {item.barcode_data && (
            <View style={styles.barcodeBadge}>
              <Ionicons name="barcode-outline" size={12} color="#4CAF50" />
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.card_name}</Text>
          <Text style={styles.cardType}>
            {item.card_type?.replace('-', ' ').toUpperCase()}
          </Text>
          {item.card_number && (
            <Text style={styles.cardNumber}>****{item.card_number.slice(-4)}</Text>
          )}
          {item.barcode_data && (
            <View style={styles.scannable}>
              <Ionicons name="scan" size={14} color="#4CAF50" />
              <Text style={styles.scannableText}>Scannable</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => handleDeleteCard(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={24} color="#f44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#666' }}>Loading cards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <Text style={styles.subtitle}>{cards.length} cards</Text>
      </View>

      {cards.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No cards yet</Text>
          <Text style={styles.emptySubtext}>
            Add your student ID and loyalty cards
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCard')}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => navigation.navigate('ScanCard')}
        >
          <Ionicons name="barcode-outline" size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  barcodeBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 2,
  },
  cardInfo: {
    flex: 1,
    marginLeft: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardType: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scannable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  scannableText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scanButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
