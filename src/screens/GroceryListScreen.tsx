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
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import groceryService, { GroceryItem as ServiceGroceryItem, GroceryListWithItems } from '../services/groceryService';
import budgetService from '../services/budgetService';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLists();
    setRefreshing(false);
  };

  const loadLists = async () => {
    try {
      if (!refreshing) setLoading(true);
      const serviceLists = await groceryService.getLists();
      
      // Load items for each list and convert to component format
      const listsWithItems = await Promise.all(
        serviceLists.map(async (list) => {
          const listWithItems = await groceryService.getList(list.id);
          if (!listWithItems) return null;
          
          const items: GroceryItem[] = listWithItems.items.map((item: ServiceGroceryItem) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            estimatedPrice: item.estimated_price || 0,
            purchased: item.is_purchased
          }));
          
          const totalEstimated = items.reduce((sum, item) => sum + item.estimatedPrice, 0);
          
          return {
            id: list.id,
            name: list.name,
            items,
            totalEstimated,
            actualTotal: list.total_amount,
            completed: !!list.completed_at,
            createdAt: new Date(list.created_at)
          };
        })
      );
      
      setLists(listsWithItems.filter((list): list is GroceryList => list !== null));
    } catch (error) {
      console.error('Error loading grocery lists:', error);
      Alert.alert('Error', 'Failed to load grocery lists');
    } finally {
      setLoading(false);
    }
  };

  const createNewList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    try {
      await groceryService.createList(newListName);
      setNewListName('');
      setShowNewListModal(false);
      await loadLists();
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

    try {
      await groceryService.addItem(listId, {
        name: newItemName,
        quantity: 1,
        estimated_price: price,
        is_purchased: false,
      });

      setNewItemName('');
      setNewItemPrice('');
      await loadLists();
      
      // Update selected list
      const updatedList = await groceryService.getList(listId);
      if (updatedList) {
        const items: GroceryItem[] = updatedList.items.map((item: ServiceGroceryItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          estimatedPrice: item.estimated_price || 0,
          purchased: item.is_purchased
        }));
        
        setSelectedList({
          id: updatedList.id,
          name: updatedList.name,
          items,
          totalEstimated: items.reduce((sum, item) => sum + item.estimatedPrice, 0),
          actualTotal: updatedList.total_amount,
          completed: !!updatedList.completed_at,
          createdAt: new Date(updatedList.created_at)
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const toggleItemPurchased = async (listId: string, itemId: string) => {
    const list = lists.find((l) => l.id === listId);
    if (!list) return;

    const item = list.items.find((i) => i.id === itemId);
    if (!item) return;

    try {
      await groceryService.updateItem(itemId, {
        is_purchased: !item.purchased,
      });

      await loadLists();
      
      // Update selected list
      const updatedList = await groceryService.getList(listId);
      if (updatedList) {
        const items: GroceryItem[] = updatedList.items.map((item: ServiceGroceryItem) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          estimatedPrice: item.estimated_price || 0,
          purchased: item.is_purchased
        }));
        
        setSelectedList({
          id: updatedList.id,
          name: updatedList.name,
          items,
          totalEstimated: items.reduce((sum, item) => sum + item.estimatedPrice, 0),
          actualTotal: updatedList.total_amount,
          completed: !!updatedList.completed_at,
          createdAt: new Date(updatedList.created_at)
        });
      }
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

    try {
      // Update grocery list
      await groceryService.updateList(listId, {
        completed_at: new Date().toISOString(),
        total_amount: amount,
      });

      // Add as expense transaction
      await budgetService.addTransaction({
        type: 'expense',
        amount,
        description: `Grocery shopping - ${selectedList?.name}`,
        date: new Date().toISOString(),
      });

      Alert.alert('Success', 'Checkout completed and budget updated!');
      setCheckoutAmount('');
      setSelectedList(null);
      await loadLists();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete checkout');
    }
  };

  const renderListItem = ({ item }: { item: GroceryList }) => {
    const purchasedCount = item.items.filter(i => i.purchased).length;
    const totalItems = item.items.length;
    const progress = totalItems > 0 ? (purchasedCount / totalItems) * 100 : 0;

    return (
      <TouchableOpacity
        style={styles.listCard}
        onPress={() => setSelectedList(item)}
        activeOpacity={0.7}
      >
        <View style={styles.listHeader}>
          <View style={[styles.iconContainer, item.completed && styles.iconContainerCompleted]}>
            <Ionicons 
              name={item.completed ? "checkmark-circle" : "cart"} 
              size={28} 
              color={item.completed ? "#fff" : "#4CAF50"} 
            />
          </View>
          <View style={styles.listInfo}>
            <View style={styles.listTitleRow}>
              <Text style={styles.listName}>{item.name}</Text>
              {!item.completed && totalItems > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{purchasedCount}/{totalItems}</Text>
                </View>
              )}
            </View>
            <Text style={styles.listMeta}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'} • ${item.totalEstimated.toFixed(2)} estimated
            </Text>
            {!item.completed && progress > 0 && (
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
            )}
            {item.completed && item.actualTotal && (
              <Text style={styles.completedText}>Completed • ${item.actualTotal.toFixed(2)}</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </View>
      </TouchableOpacity>
    );
  };

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

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading grocery lists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Grocery Lists</Text>
          <Text style={styles.subtitle}>{lists.length} active lists</Text>
        </View>
        <TouchableOpacity onPress={() => setShowNewListModal(true)} style={styles.addButton}>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
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
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    padding: 4,
  },
  list: {
    padding: 16,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerCompleted: {
    backgroundColor: '#4CAF50',
  },
  listInfo: {
    flex: 1,
    marginLeft: 12,
  },
  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  completedText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
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
