import { supabase } from '../config/supabase';

export interface WalletCard {
  id: string;
  user_id: string;
  card_name: string;
  card_type: 'loyalty' | 'student_id' | 'discount';
  barcode_data?: string;
  barcode_format?: string;
  card_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class WalletService {
  // Get all cards for current user
  async getCards(): Promise<WalletCard[]> {
    try {
      const { data, error } = await supabase
        .from('wallet_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get a single card by ID
  async getCard(id: string): Promise<WalletCard | null> {
    try {
      const { data, error } = await supabase
        .from('wallet_cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Add a new card
  async addCard(card: Omit<WalletCard, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<WalletCard> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wallet_cards')
        .insert({
          ...card,
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

  // Update a card
  async updateCard(id: string, updates: Partial<WalletCard>): Promise<WalletCard> {
    try {
      const { data, error } = await supabase
        .from('wallet_cards')
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

  // Delete a card
  async deleteCard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wallet_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}

export default new WalletService();
