import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * AnalyticsCard - Displays analytics data with optional chart visualization
 *
 * @param {string} title - Card title
 * @param {string} subtitle - Optional subtitle/description
 * @param {string} value - Main metric value
 * @param {string} change - Percentage change (e.g., "+12.5%" or "-5.2%")
 * @param {string} chartType - Type of chart: 'bar', 'line', 'pie', 'none'
 * @param {Array} data - Data array for chart visualization
 * @param {string} icon - Emoji icon for the card
 */
export default function AnalyticsCard({
  title = '',
  subtitle = '',
  value = '0',
  change = '',
  chartType = 'none',
  data = [],
  icon = '📊'
}) {
  const isPositiveChange = change.startsWith('+');
  const isNegativeChange = change.startsWith('-');

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 60 : 0;
          return (
            <View key={index} style={styles.barWrapper}>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    { height: `${height}%` },
                    index === data.length - 1 && styles.barHighlight
                  ]}
                />
              </View>
              <Text style={styles.barLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));

    return (
      <View style={styles.lineChartContainer}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 50 : 0;
          const isLast = index === data.length - 1;

          return (
            <View key={index} style={styles.linePointWrapper}>
              <View
                style={[
                  styles.linePoint,
                  { bottom: `${height}%` },
                  isLast && styles.linePointHighlight
                ]}
              />
              {index < data.length - 1 && (
                <View
                  style={[
                    styles.lineSegment,
                    {
                      bottom: `${height}%`,
                      height: Math.abs(height - (data[index + 1].value / maxValue * 50))
                    }
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) return null;

    return (
      <View style={styles.pieChartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.pieItem}>
            <View style={[styles.pieIndicator, { backgroundColor: item.color || '#8B5CF6' }]} />
            <Text style={styles.pieLabel}>{item.label}</Text>
            <Text style={styles.pieValue}>{item.value}%</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {change && (
          <View style={[
            styles.changeBadge,
            isPositiveChange && styles.changeBadgePositive,
            isNegativeChange && styles.changeBadgeNegative
          ]}>
            <Text style={[
              styles.changeText,
              isPositiveChange && styles.changeTextPositive,
              isNegativeChange && styles.changeTextNegative
            ]}>
              {change}
            </Text>
          </View>
        )}
      </View>

      {/* Chart */}
      {chartType !== 'none' && renderChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  value: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F59E0B',
    marginRight: 12,
  },
  changeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  changeBadgePositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  changeBadgeNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
  },
  changeTextPositive: {
    color: '#10B981',
  },
  changeTextNegative: {
    color: '#EF4444',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    paddingTop: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '100%',
    height: 60,
    justifyContent: 'flex-end',
    paddingHorizontal: 4,
  },
  bar: {
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barHighlight: {
    backgroundColor: '#F59E0B',
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  lineChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 70,
    position: 'relative',
  },
  linePointWrapper: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  linePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.5)',
    position: 'absolute',
  },
  linePointHighlight: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F59E0B',
  },
  lineSegment: {
    width: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    position: 'absolute',
  },
  pieChartContainer: {
    marginTop: 8,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieIndicator: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 8,
  },
  pieLabel: {
    flex: 1,
    fontSize: 13,
    color: '#CCC',
  },
  pieValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
  },
});
