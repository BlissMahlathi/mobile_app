import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import walletService from '../services/walletService';
import authService from '../services/authService';

interface Card {
  id: string;
  name: string;
  type: 'student-id' | 'loyalty' | 'discount';
  cardNumber?: string;
  barcodeData?: string;
  barcodeType?: string;
  createdAt: Date;
}

export default function WalletScreen({ navigation }: any) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const q = query(
      collection(db, 'cards'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cardsData: Card[] = [];
      snapshot.forEach((doc) => {
        cardsData.push({ id: doc.id, ...doc.data() } as Card);
      });
      setCards(cardsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
              await deleteDoc(doc(db, 'cards', cardId));
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

  const renderCard = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('CardDetail', { card: item })}
    >
      <View style={styles.cardContent}>
        <Ionicons 
          name={getCardIcon(item.type) as any} 
          size={40} 
          color="#4CAF50" 
        />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.name}</Text>
          <Text style={styles.cardType}>
            {item.type.replace('-', ' ').toUpperCase()}
          </Text>
          {item.cardNumber && (
            <Text style={styles.cardNumber}>****{item.cardNumber.slice(-4)}</Text>
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
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <Text style={styles.subtitle}>{cards.length} cards</Text>
      </View>

      {cards.length === 0 && !loading ? (
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
