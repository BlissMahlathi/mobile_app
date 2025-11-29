import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import budgetService from '../services/budgetService';
import authService from '../services/authService';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: Date;
}

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [timeRange]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDate: Date;

      if (timeRange === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else if (timeRange === 'month') {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      } else {
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      const txData = await budgetService.getTransactions(startDate);
      setTransactions(txData.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        category: t.category_id || 'Other',
        date: new Date(t.date),
      })));
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate expenses by category for pie chart
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryColors = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
  ];

  const pieData = Object.entries(expensesByCategory).map(([name, amount], index) => ({
    name,
    amount,
    color: categoryColors[index % categoryColors.length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  // Calculate weekly spending for line chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailyExpenses = last7Days.map(date => {
    const dayExpenses = transactions
      .filter(t => 
        t.type === 'expense' &&
        t.date.toDateString() === date.toDateString()
      )
      .reduce((sum, t) => sum + t.amount, 0);
    return dayExpenses;
  });

  const lineChartData = {
    labels: last7Days.map(d => d.toLocaleDateString('en', { weekday: 'short' })),
    datasets: [{
      data: dailyExpenses.length > 0 ? dailyExpenses : [0],
    }],
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Your financial overview</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: '#4CAF50' }]}>
          <Ionicons name="wallet" size={32} color="#fff" />
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={styles.summaryAmount}>${balance.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#2196F3' }]}>
          <Ionicons name="trending-up" size={32} color="#fff" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: '#f44336' }]}>
          <Ionicons name="trending-down" size={32} color="#fff" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      {/* Spending Trend */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Spending Trend (7 Days)</Text>
        {dailyExpenses.some(val => val > 0) ? (
          <LineChart
            data={lineChartData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No spending data for the past 7 days</Text>
          </View>
        )}
      </View>

      {/* Category Breakdown */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Spending by Category</Text>
        {pieData.length > 0 ? (
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={styles.chart}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Ionicons name="pie-chart-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>No expense categories yet</Text>
          </View>
        )}
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.chartTitle}>Quick Stats</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Transactions</Text>
            <Text style={styles.statValue}>{transactions.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg. Daily Spending</Text>
            <Text style={styles.statValue}>
              ${(dailyExpenses.reduce((a, b) => a + b, 0) / 7).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Top Category</Text>
            <Text style={styles.statValue}>
              {pieData.length > 0 
                ? pieData.sort((a, b) => b.amount - a.amount)[0].name
                : 'N/A'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Savings Rate</Text>
            <Text style={styles.statValue}>
              {totalIncome > 0 
                ? `${((balance / totalIncome) * 100).toFixed(1)}%`
                : '0%'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color="#FF9800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Budget Tip</Text>
            <Text style={styles.tipText}>
              Try to save at least 20% of your income each month for emergencies.
            </Text>
          </View>
        </View>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 8,
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  chartSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    textAlign: 'center',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tipsSection: {
    padding: 16,
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
