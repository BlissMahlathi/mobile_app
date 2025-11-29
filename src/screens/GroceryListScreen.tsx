import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import groceryService from '../services/groceryService';
import authService from '../services/authService';

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  purchased: boolean;
}

interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  totalEstimated: number;
  actualTotal?: number;
  completed: boolean;
  createdAt: Date;
}

export default function GroceryListScreen() {
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedList, setSelectedList] = useState<GroceryList | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [checkoutAmount, setCheckoutAmount] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) return;

    const q = query(
      collection(db, 'groceryLists'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listsData: GroceryList[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        listsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as GroceryList);
      });
      setLists(listsData);
    });

    return () => unsubscribe();
  }, []);

  const createNewList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      await addDoc(collection(db, 'groceryLists'), {
        userId: user.uid,
        name: newListName,
        items: [],
        totalEstimated: 0,
        completed: false,
        createdAt: new Date(),
      });

      setNewListName('');
      setShowNewListModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to create list');
    }
  };

  const addItemToList = async (listId: string) => {
    if (!newItemName.trim()) {
      Alert.alert('Error', 'Please enter item name');
      return;
    }

    const price = parseFloat(newItemPrice) || 0;
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: 1,
      estimatedPrice: price,
      purchased: false,
    };

    const updatedItems = [...list.items, newItem];
    const totalEstimated = updatedItems.reduce((sum, item) => sum + item.estimatedPrice, 0);

    try {
      await updateDoc(doc(db, 'groceryLists', listId), {
        items: updatedItems,
        totalEstimated,
      });

      setNewItemName('');
      setNewItemPrice('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const toggleItemPurchased = async (listId: string, itemId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const updatedItems = list.items.map((item) =>
      item.id === itemId ? { ...item, purchased: !item.purchased } : item
    );

    try {
      await updateDoc(doc(db, 'groceryLists', listId), {
        items: updatedItems,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const completeCheckout = async (listId: string) => {
    const amount = parseFloat(checkoutAmount);
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter valid checkout amount');
      return;
    }

    const user = authService.getCurrentUser();
    if (!user) return;

    try {
      // Update grocery list
      await updateDoc(doc(db, 'groceryLists', listId), {
        completed: true,
        actualTotal: amount,
      });

      // Add as expense transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        type: 'expense',
        amount,
        category: 'Food',
        description: `Grocery shopping - ${selectedList?.name}`,
        date: new Date(),
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Checkout completed and budget updated!');
      setCheckoutAmount('');
      setSelectedList(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to complete checkout');
    }
  };

  const renderListItem = ({ item }: { item: GroceryList }) => (
    <TouchableOpacity
      style={styles.listCard}
      onPress={() => setSelectedList(item)}
    >
      <View style={styles.listHeader}>
        <Ionicons name="cart" size={32} color="#4CAF50" />
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{item.name}</Text>
          <Text style={styles.listMeta}>
            {item.items.length} items • ${item.totalEstimated.toFixed(2)} estimated
          </Text>
        </View>
        {item.completed && (
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderGroceryItem = ({ item }: { item: GroceryItem }) => (
    <TouchableOpacity
      style={styles.groceryItem}
      onPress={() => selectedList && toggleItemPurchased(selectedList.id, item.id)}
    >
      <Ionicons
        name={item.purchased ? 'checkmark-circle' : 'ellipse-outline'}
        size={24}
        color={item.purchased ? '#4CAF50' : '#ccc'}
      />
      <Text
        style={[
          styles.itemName,
          item.purchased && styles.itemNamePurchased,
        ]}
      >
        {item.name}
      </Text>
      <Text style={styles.itemPrice}>${item.estimatedPrice.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Grocery Lists</Text>
        <TouchableOpacity onPress={() => setShowNewListModal(true)}>
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {lists.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No grocery lists yet</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowNewListModal(true)}
          >
            <Text style={styles.createButtonText}>Create Your First List</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}

      {/* New List Modal */}
      <Modal visible={showNewListModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Grocery List</Text>
            <TextInput
              style={styles.input}
              placeholder="List name (e.g., Weekly Shopping)"
              value={newListName}
              onChangeText={setNewListName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowNewListModal(false);
                  setNewListName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createButton} onPress={createNewList}>
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List Detail Modal */}
      <Modal visible={!!selectedList} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedList?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedList(null)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {!selectedList?.completed && (
              <View style={styles.addItemSection}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Item name"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />
                <TextInput
                  style={[styles.input, { width: 80 }]}
                  placeholder="Price"
                  value={newItemPrice}
                  onChangeText={setNewItemPrice}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  onPress={() => selectedList && addItemToList(selectedList.id)}
                >
                  <Ionicons name="add-circle" size={32} color="#4CAF50" />
                </TouchableOpacity>
              </View>
            )}

            <FlatList
              data={selectedList?.items || []}
              renderItem={renderGroceryItem}
              keyExtractor={(item) => item.id}
              style={styles.itemsList}
            />

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Estimated Total:</Text>
              <Text style={styles.totalAmount}>
                ${selectedList?.totalEstimated.toFixed(2)}
              </Text>
            </View>

            {!selectedList?.completed && (
              <View style={styles.checkoutSection}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter actual checkout amount"
                  value={checkoutAmount}
                  onChangeText={setCheckoutAmount}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity
                  style={styles.checkoutButton}
                  onPress={() => selectedList && completeCheckout(selectedList.id)}
                >
                  <Text style={styles.checkoutButtonText}>Complete Checkout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  list: {
    padding: 16,
  },
  listCard: {
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
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listInfo: {
    flex: 1,
    marginLeft: 16,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  addItemSection: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsList: {
    maxHeight: 300,
  },
  groceryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  itemNamePurchased: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  checkoutSection: {
    marginTop: 16,
  },
  checkoutButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
