import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';
import { useZikhr } from '@/context/ZikhrContext';

const FAVORITES_STORAGE_KEY = '@zikirmatik/favoriteZikhrNames';

export default function ZikhrsScreen() {
  const router = useRouter();
  const { zikhrs, setSelectedZikhr: setRunningZikhr, addZikhr, deleteZikhr, completedZikhrs } = useZikhr();

  const [isModalVisible, setModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [previewZikhr, setPreviewZikhr] = useState<ZikhrItem | null>(null);
  const [newZikhrName, setNewZikhrName] = useState('');
  const [newZikhrCount, setNewZikhrCount] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  const persistFavorites = useCallback(async (names: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.warn('Favori zikirler kaydedilemedi', error);
    }
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const onlyStrings = parsed.filter((item) => typeof item === 'string');
            setFavoriteNames(onlyStrings);
          }
        }
      } catch (error) {
        console.warn('Favori zikirler yüklenemedi', error);
      }
    };

    void loadFavorites();
  }, []);

  useEffect(() => {
    setFavoriteNames((prev) => {
      if (!prev.length) return prev;
      const validNames = prev.filter((name) => zikhrs.some((item) => item.name === name));
      if (validNames.length === prev.length) {
        return prev;
      }
      void persistFavorites(validNames);
      return validNames;
    });
  }, [zikhrs, persistFavorites]);

  const favoriteSet = useMemo(() => new Set(favoriteNames), [favoriteNames]);

  const favoriteItems = useMemo(
    () =>
      favoriteNames
        .map((name) => zikhrs.find((item) => item.name === name))
        .filter((item): item is ZikhrItem => Boolean(item)),
    [favoriteNames, zikhrs],
  );

  const sortedZikhrs = useMemo(() => {
    if (!favoriteNames.length) {
      return zikhrs;
    }
    const favoritesOrdered: ZikhrItem[] = [];
    favoriteNames.forEach((name) => {
      const found = zikhrs.find((item) => item.name === name);
      if (found) {
        favoritesOrdered.push(found);
      }
    });
    const remaining = zikhrs.filter((item) => !favoriteSet.has(item.name));
    return [...favoritesOrdered, ...remaining];
  }, [favoriteNames, favoriteSet, zikhrs]);

  const addFavorite = useCallback(
    (name: string) => {
      setFavoriteNames((prev) => {
        if (prev.includes(name)) {
          return prev;
        }
        const updated = [name, ...prev];
        void persistFavorites(updated);
        return updated;
      });
    },
    [persistFavorites],
  );

  const toggleFavorite = useCallback(
    (name: string) => {
      setFavoriteNames((prev) => {
        const exists = prev.includes(name);
        const updated = exists ? prev.filter((item) => item !== name) : [name, ...prev];
        void persistFavorites(updated);
        return updated;
      });
    },
    [persistFavorites],
  );

  const removeFavorite = useCallback(
    (name: string) => {
      setFavoriteNames((prev) => {
        if (!prev.includes(name)) {
          return prev;
        }
        const updated = prev.filter((item) => item !== name);
        void persistFavorites(updated);
        return updated;
      });
    },
    [persistFavorites],
  );

  const openZikhrDetails = useCallback((zikhr: ZikhrItem) => {
    setPreviewZikhr(zikhr);
    setModalVisible(true);
  }, []);

  const selected = previewZikhr;
  const isUserCreated = selected ? !ZIKHR_ITEMS.some((item) => item.name === selected.name) : false;

  const resetCreateForm = () => {
    setNewZikhrName('');
    setNewZikhrCount('');
    setCreateError(null);
  };

  const closeCreateModal = () => {
    resetCreateForm();
    setCreateModalVisible(false);
  };

  const handleStartSelectedZikhr = () => {
    if (selected) {
      setRunningZikhr(selected);
    }

    // reset values after selecting it
    setModalVisible(false);
    setPreviewZikhr(null);
    router.replace('/'); // navigate to main screen
  }

  const handleCreateZikhr = () => {
    const trimmedName = newZikhrName.trim();
    const parsedCount = Number.parseInt(newZikhrCount, 10);

    if (!trimmedName) {
      setCreateError('Lütfen bir zikir adı girin.');
      return;
    }

    if (Number.isNaN(parsedCount) || parsedCount <= 0) {
      setCreateError('Lütfen 0\'dan büyük bir sayı girin.');
      return;
    }

    const newZikhr = {
      name: trimmedName,
      description: 'Kullanıcı tarafından oluşturuldu.',
      count: parsedCount,
    };

    addZikhr(newZikhr);
    addFavorite(newZikhr.name);
    closeCreateModal();
    setModalVisible(false);
    setPreviewZikhr(null);
    router.replace('/');
  };

  const handleDeleteZikhr = () => {
    if (selected) {
      deleteZikhr(selected);
      removeFavorite(selected.name);
      setModalVisible(false);
      setPreviewZikhr(null);
    }
  };

  const completedHistory = useMemo(() => completedZikhrs, [completedZikhrs]);

  const formatCompletedDate = useCallback((isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleString('tr-TR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch (error) {
      return new Date(isoDate).toLocaleString();
    }
  }, []);

  return (
    <View style={styles.container}>
      {/*ZIKIRLER TITLE <Text style={styles.title}></Text>*/} 

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'available' && styles.activeTabButton]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'available' && styles.activeTabButtonText]}>Zikirler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'completed' && styles.activeTabButton]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'completed' && styles.activeTabButtonText]}>
            Tamamlananlar
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'available' ? (
        <ScrollView contentContainerStyle={styles.list}>
          <TouchableOpacity
            style={[styles.card, styles.addCard]}
            activeOpacity={0.85}
            onPress={() => {
              resetCreateForm();
              setCreateModalVisible(true);
            }}
          >
            <Text style={styles.addCardText}>+ Yeni Zikir Oluştur</Text>
          </TouchableOpacity>

          {sortedZikhrs.map((item) => {
            const isFavorite = favoriteSet.has(item.name);
            return (
              <TouchableOpacity
                key={item.name}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openZikhrDetails(item)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Pressable
                    hitSlop={10}
                    style={styles.favoriteIconButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      toggleFavorite(item.name);
                    }}
                  >
                    <Ionicons
                      name={isFavorite ? 'star' : 'star-outline'}
                      size={20}
                      color={isFavorite ? '#ffbf00' : '#6f737a'}
                    />
                  </Pressable>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2} ellipsizeMode="tail">
                  {item.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {completedHistory.length === 0 ? (
            <View style={[styles.card, styles.emptyHistoryCard]}>
              <Text style={styles.emptyHistoryTitle}>Henüz tamamlanan zikir yok</Text>
              <Text style={styles.emptyHistoryDesc}>Bir zikri tamamladığınızda burada görebilirsiniz.</Text>
            </View>
          ) : (
            completedHistory.map((entry) => (
              <View key={entry.id} style={[styles.card, styles.completedCard]}>
                <View style={styles.completedHeader}>
                  <Text style={styles.cardTitle}>{entry.name}</Text>
                  <View style={styles.completedCountBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#0b2f1b" />
                    <Text style={styles.completedCountText}>{entry.count} Adet Çekildi</Text>
                  </View>
                </View>
                <View style={styles.completedFooter}>
                  <Ionicons name="time-outline" size={16} color="#a7acb5" />
                  <Text style={styles.completedMeta}>{formatCompletedDate(entry.completedAt)}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
          <Pressable style={styles.modalBackdropPressable} onPress={() => setModalVisible(false)}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalTitle}>{selected?.name}</Text>
              <Text style={styles.modalDescription}>{selected?.description}</Text>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                <Text style={styles.modalInfoValue}>{selected?.count}</Text>
              </View>
              <View style={styles.modalButtonsRow}>
                {isUserCreated && (
                  <TouchableOpacity
                    style={styles.modalDeleteButton}
                    activeOpacity={0.9}
                    onPress={handleDeleteZikhr}
                  >
                    <Text style={styles.modalDeleteButtonText}>Sil</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.modalRunButton}
                  activeOpacity={0.9}
                  onPress={handleStartSelectedZikhr}
                >
                  <Text style={styles.modalRunButtonText}>Başlat</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>

      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCreateModal}
      >
        <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
          <Pressable style={styles.modalBackdropPressable} onPress={closeCreateModal}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalTitle}>Yeni Zikir</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Zikir Adı</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Örn. Salavat"
                  placeholderTextColor="#6f737a"
                  value={newZikhrName}
                  onChangeText={setNewZikhrName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Zikir Adeti</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Örn. 33"
                  placeholderTextColor="#6f737a"
                  value={newZikhrCount}
                  onChangeText={setNewZikhrCount}
                  keyboardType="numeric"
                />
              </View>
              {createError ? <Text style={styles.modalErrorText}>{createError}</Text> : null}
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalRunButton} activeOpacity={0.9} onPress={handleCreateZikhr}>
                  <Text style={styles.modalRunButtonText}>Başlat</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2025',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffbf00',
    marginBottom: 12,
    marginTop: 15,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 999,
    backgroundColor: '#2c2f34',
    padding: 4,
    marginBottom: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#ffbf00',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a7acb5',
  },
  activeTabButtonText: {
    color: '#0b2f1b',
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  addCard: {
    borderStyle: 'dashed',
    borderColor: '#4a4d55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffbf00',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e6e7e9',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#a7acb5',
    lineHeight: 19,
  },
  favoriteIconButton: {
    padding: 6,
    borderRadius: 999,
  },
  completedCard: {
    gap: 8,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  completedCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#03c459',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  completedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0b2f1b',
  },
  completedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  completedMeta: {
    fontSize: 12,
    color: '#a7acb5',
  },
  emptyHistoryCard: {
    alignItems: 'center',
    gap: 6,
  },
  emptyHistoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e6e7e9',
  },
  emptyHistoryDesc: {
    fontSize: 13,
    color: '#a7acb5',
    textAlign: 'center',
  },

  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdropPressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#1f2025',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffbf00',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: '#e6e7e9',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#26292f',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#3a3d42',
    marginBottom: 16,
  },
  modalInfoLabel: {
    fontSize: 14,
    color: '#a7acb5',
    fontWeight: '600',
  },
  modalInfoValue: {
    fontSize: 16,
    color: '#ffbf00',
    fontWeight: '700',
    letterSpacing: 1,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  modalRunButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#03c459',
    borderRadius: 999,
    minWidth: 120,
    alignItems: 'center',
  },
  modalRunButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b2f1b',
  },
  modalCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2c2f34',
    borderRadius: 999,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  modalCancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e6e7e9',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    color: '#a7acb5',
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#26292f',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3d42',
    paddingVertical: 10,
    paddingHorizontal: 14,
    color: '#e6e7e9',
    fontSize: 14,
  },
  modalErrorText: {
    fontSize: 12,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDeleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ef4444',
    borderRadius: 999,
    minWidth: 120,
    alignItems: 'center',
  },
  modalDeleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0b2f1b',
  },
});


