import { supabase } from '../config/supabase';

export interface GroceryList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  completed_at?: string;
  total_amount?: number;
}

export interface GroceryItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  estimated_price?: number;
  is_purchased: boolean;
  created_at: string;
  purchased_at?: string;
}

export interface GroceryListWithItems extends GroceryList {
  items: GroceryItem[];
}

class GroceryService {
  // === Lists ===
  
  async getLists(): Promise<GroceryList[]> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getList(id: string): Promise<GroceryListWithItems | null> {
    try {
      const { data: list, error: listError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('id', id)
        .single();

      if (listError) throw listError;

      const { data: items, error: itemsError } = await supabase
        .from('grocery_items')
        .select('*')
        .eq('list_id', id)
        .order('created_at');

      if (itemsError) throw itemsError;

      return {
        ...list,
        items: items || []
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async createList(name: string): Promise<GroceryList> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure user profile exists in users table
      await this.ensureUserProfile(user);

      const { data, error } = await supabase
        .from('grocery_lists')
        .insert({
          name,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Ensure user profile exists in users table
  private async ensureUserProfile(user: any): Promise<void> {
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user profile:', checkError);
        return;
      }

      if (!existingProfile) {
        const { error } = await supabase.from('users').insert({
          id: user.id,
          email: user.email || '',
          display_name: user.email?.split('@')[0] || 'User',
          created_at: new Date().toISOString(),
          monthly_budget: 0,
        });
        
        if (error && error.code !== '23505') {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error: any) {
      // Ignore errors - profile might already exist
      console.error('Error ensuring user profile:', error);
    }
  }

  async updateList(id: string, updates: Partial<GroceryList>): Promise<GroceryList> {
    try {
      const { data, error } = await supabase
        .from('grocery_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteList(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // === Items ===
  
  async addItem(listId: string, item: Omit<GroceryItem, 'id' | 'list_id' | 'created_at' | 'purchased_at'>): Promise<GroceryItem> {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .insert({
          ...item,
          list_id: listId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async updateItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
    try {
      const { data, error } = await supabase
        .from('grocery_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async toggleItemPurchased(id: string): Promise<GroceryItem> {
    try {
      const { data: item } = await supabase
        .from('grocery_items')
        .select('is_purchased')
        .eq('id', id)
        .single();

      const newPurchasedState = !item?.is_purchased;

      const { data, error } = await supabase
        .from('grocery_items')
        .update({
          is_purchased: newPurchasedState,
          purchased_at: newPurchasedState ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('grocery_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // === Checkout ===
  
  async completeCheckout(listId: string, totalAmount: number, categoryId?: string): Promise<void> {
    try {
      // Update the list as completed
      await this.updateList(listId, {
        completed_at: new Date().toISOString(),
        total_amount: totalAmount
      });

      // If a category is provided, create a transaction
      if (categoryId && totalAmount > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            category_id: categoryId,
            amount: totalAmount,
            type: 'expense',
            description: 'Grocery shopping',
            date: new Date().toISOString()
          });
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new GroceryService();
