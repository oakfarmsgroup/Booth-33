import React, { useState } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * FilterModal - Reusable filter modal component
 *
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Callback when modal closes
 * @param {function} onApply - Callback when filters are applied
 * @param {Array} filterGroups - Array of filter group objects
 *   {
 *     id: string,
 *     title: string,
 *     type: 'single' | 'multiple' | 'range',
 *     options: Array<{ id, label, value }> // for single/multiple
 *     min: number, max: number, step: number // for range
 *   }
 * @param {Object} initialFilters - Initial filter values
 */
export default function FilterModal({ visible, onClose, onApply, filterGroups = [], initialFilters = {} }) {
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);

  const handleSelectOption = (groupId, optionId, type) => {
    if (type === 'single') {
      setSelectedFilters({
        ...selectedFilters,
        [groupId]: optionId,
      });
    } else if (type === 'multiple') {
      const current = selectedFilters[groupId] || [];
      const isSelected = current.includes(optionId);

      setSelectedFilters({
        ...selectedFilters,
        [groupId]: isSelected
          ? current.filter(id => id !== optionId)
          : [...current, optionId],
      });
    }
  };

  const handleRangeChange = (groupId, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [groupId]: value,
    });
  };

  const handleApply = () => {
    if (onApply) {
      onApply(selectedFilters);
    }
    onClose();
  };

  const handleReset = () => {
    setSelectedFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.keys(selectedFilters).filter(key => {
      const value = selectedFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    }).length;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalTitle}>Filters</Text>
              {getActiveFilterCount() > 0 && (
                <View style={styles.activeFilterBadge}>
                  <Text style={styles.activeFilterText}>{getActiveFilterCount()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Filters Content */}
          <ScrollView
            style={styles.filtersContent}
            showsVerticalScrollIndicator={false}
          >
            {filterGroups.map((group) => (
              <View key={group.id} style={styles.filterGroup}>
                <Text style={styles.filterGroupTitle}>{group.title}</Text>

                {/* Single Select */}
                {group.type === 'single' && (
                  <View style={styles.filterOptions}>
                    {group.options.map((option) => {
                      const isSelected = selectedFilters[group.id] === option.id;
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[styles.filterOption, isSelected && styles.filterOptionActive]}
                          onPress={() => handleSelectOption(group.id, option.id, 'single')}
                        >
                          <Text style={[styles.filterOptionText, isSelected && styles.filterOptionTextActive]}>
                            {option.label}
                          </Text>
                          {isSelected && <Text style={styles.filterOptionCheck}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Multiple Select */}
                {group.type === 'multiple' && (
                  <View style={styles.filterOptions}>
                    {group.options.map((option) => {
                      const current = selectedFilters[group.id] || [];
                      const isSelected = current.includes(option.id);
                      return (
                        <TouchableOpacity
                          key={option.id}
                          style={[styles.filterChip, isSelected && styles.filterChipActive]}
                          onPress={() => handleSelectOption(group.id, option.id, 'multiple')}
                        >
                          <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                            {isSelected && '✓ '}
                            {option.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Range Select */}
                {group.type === 'range' && (
                  <View style={styles.rangeContainer}>
                    <Text style={styles.rangeLabel}>
                      {selectedFilters[group.id] || group.min} {group.unit || ''}
                    </Text>
                    {/* Note: In production, you'd use a slider component here */}
                    <View style={styles.rangeButtons}>
                      <TouchableOpacity
                        style={styles.rangeButton}
                        onPress={() => {
                          const current = selectedFilters[group.id] || group.min;
                          const newValue = Math.max(group.min, current - (group.step || 1));
                          handleRangeChange(group.id, newValue);
                        }}
                      >
                        <Text style={styles.rangeButtonText}>-</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rangeButton}
                        onPress={() => {
                          const current = selectedFilters[group.id] || group.min;
                          const newValue = Math.min(group.max, current + (group.step || 1));
                          handleRangeChange(group.id, newValue);
                        }}
                      >
                        <Text style={styles.rangeButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(139, 92, 246, 0.2)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  activeFilterBadge: {
    backgroundColor: '#EC4899',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalClose: {
    fontSize: 24,
    color: '#888',
    fontWeight: '300',
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterGroup: {
    marginBottom: 32,
  },
  filterGroupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  filterOptionActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  filterOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#CCC',
  },
  filterOptionTextActive: {
    color: '#8B5CF6',
  },
  filterOptionCheck: {
    fontSize: 18,
    color: '#8B5CF6',
    fontWeight: '800',
  },
  filterChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  filterChipActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: '#8B5CF6',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#CCC',
  },
  filterChipTextActive: {
    color: '#8B5CF6',
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 12,
    padding: 16,
  },
  rangeLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  rangeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rangeButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rangeButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
