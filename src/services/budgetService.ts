import { supabase } from '../config/supabase';

export interface BudgetCategory {
  id: string;
  user_id: string;
  name: string;
  color?: string;
  icon?: string;
  budget_limit?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string;
  amount: number;
  type: 'income' | 'expense';
  description?: string;
  date: string;
  created_at: string;
}

export interface CategorySpending {
  category: BudgetCategory;
  total: number;
  percentage: number;
}

class BudgetService {
  // === Categories ===
  
  async getCategories(): Promise<BudgetCategory[]> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addCategory(category: Omit<BudgetCategory, 'id' | 'user_id' | 'created_at'>): Promise<BudgetCategory> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('budget_categories')
        .insert({
          ...category,
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

  async updateCategory(id: string, updates: Partial<BudgetCategory>): Promise<BudgetCategory> {
    try {
      const { data, error } = await supabase
        .from('budget_categories')
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

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('budget_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // === Transactions ===
  
  async getTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('date', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async addTransaction(transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>): Promise<Transaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Ensure user profile exists
      await this.ensureUserProfile(user);

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transaction,
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

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    try {
      const { data, error } = await supabase
        .from('transactions')
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

  async deleteTransaction(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // === Analytics ===

  async getCategorySpending(startDate?: Date, endDate?: Date): Promise<CategorySpending[]> {
    try {
      const [categories, transactions] = await Promise.all([
        this.getCategories(),
        this.getTransactions(startDate, endDate)
      ]);

      const expenses = transactions.filter(t => t.type === 'expense');
      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

      const categoryMap = new Map<string, number>();
      expenses.forEach(transaction => {
        if (transaction.category_id) {
          const current = categoryMap.get(transaction.category_id) || 0;
          categoryMap.set(transaction.category_id, current + transaction.amount);
        }
      });

      return categories
        .map(category => {
          const total = categoryMap.get(category.id) || 0;
          return {
            category,
            total,
            percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0
          };
        })
        .filter(cs => cs.total > 0)
        .sort((a, b) => b.total - a.total);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getMonthlyBalance(): Promise<{ income: number; expenses: number; balance: number }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const transactions = await this.getTransactions(startOfMonth);

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expenses,
        balance: income - expenses
      };
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
}

export default new BudgetService();
