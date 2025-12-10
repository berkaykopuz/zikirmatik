import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ESMA_UL_HUSNA, EsmaUlHusnaItem } from '@/constants/esmaulhusna';
import { ZIKHR_ITEMS, ZikhrItem } from '@/constants/zikhrs';
import { useZikhr } from '@/context/ZikhrContext';

const FAVORITES_STORAGE_KEY = '@zikirmatik/favoriteZikhrNames';
const ESMAUL_HUSNA_FAVORITES_STORAGE_KEY = '@zikirmatik/favoriteEsmaulHusnaNames';
const COMPLETED_FILTERS = {
  all: { label: 'Toplam', durationMs: null },
  daily: { label: 'Günlük', durationMs: 24 * 60 * 60 * 1000 },
  monthly: { label: 'Aylık', durationMs: 30 * 24 * 60 * 60 * 1000 },
  threeMonths: { label: '3 Aylık', durationMs: 90 * 24 * 60 * 60 * 1000 },
  yearly: { label: 'Yıllık', durationMs: 365 * 24 * 60 * 60 * 1000 },
} as const;

type CompletedFilter = keyof typeof COMPLETED_FILTERS;

export default function ZikhrsScreen() {
  const router = useRouter();
  const {
    zikhrs,
    setSelectedZikhr: setRunningZikhr,
    addZikhr,
    deleteZikhr,
    completedZikhrs,
    zikhrProgress,
    resetZikhrProgress,
    updateZikhrCount,
    getZikhrCount,
  } = useZikhr();

  const [isModalVisible, setModalVisible] = useState(false);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [previewZikhr, setPreviewZikhr] = useState<ZikhrItem | null>(null);
  const [newZikhrName, setNewZikhrName] = useState('');
  const [newZikhrCount, setNewZikhrCount] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [favoriteNames, setFavoriteNames] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'esmaulhusna' | 'completed'>('available');
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>('all');
  const [isFilterMenuVisible, setFilterMenuVisible] = useState(false);
  const [esmaulHusnaSearchQuery, setEsmaulHusnaSearchQuery] = useState('');
  const [selectedEsmaulHusna, setSelectedEsmaulHusna] = useState<EsmaUlHusnaItem | null>(null);
  const [isEsmaulHusnaModalVisible, setEsmaulHusnaModalVisible] = useState(false);
  const [esmaulHusnaFavoriteNames, setEsmaulHusnaFavoriteNames] = useState<string[]>([]);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editTargetName, setEditTargetName] = useState<string | null>(null);
  const [editCountInput, setEditCountInput] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const persistFavorites = useCallback(async (names: string[]) => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.warn('Favori zikirler kaydedilemedi', error);
    }
  }, []);

  const persistEsmaulHusnaFavorites = useCallback(async (names: string[]) => {
    try {
      await AsyncStorage.setItem(ESMAUL_HUSNA_FAVORITES_STORAGE_KEY, JSON.stringify(names));
    } catch (error) {
      console.warn('Favori Esmaül Hüsna kaydedilemedi', error);
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

  useEffect(() => {
    const loadEsmaulHusnaFavorites = async () => {
      try {
        const stored = await AsyncStorage.getItem(ESMAUL_HUSNA_FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const onlyStrings = parsed.filter((item) => typeof item === 'string');
            setEsmaulHusnaFavoriteNames(onlyStrings);
          }
        }
      } catch (error) {
        console.warn('Favori Esmaül Hüsna yüklenemedi', error);
      }
    };

    void loadEsmaulHusnaFavorites();
  }, []);

  useEffect(() => {
    setEsmaulHusnaFavoriteNames((prev) => {
      if (!prev.length) return prev;
      const validNames = prev.filter((name) => ESMA_UL_HUSNA.some((item) => item.name === name));
      if (validNames.length === prev.length) {
        return prev;
      }
      void persistEsmaulHusnaFavorites(validNames);
      return validNames;
    });
  }, [persistEsmaulHusnaFavorites]);

  const favoriteSet = useMemo(() => new Set(favoriteNames), [favoriteNames]);
  const esmaulHusnaFavoriteSet = useMemo(() => new Set(esmaulHusnaFavoriteNames), [esmaulHusnaFavoriteNames]);

  const favoriteItems = useMemo(
    () =>
      favoriteNames
        .map((name) => zikhrs.find((item) => item.name === name))
        .filter((item): item is ZikhrItem => Boolean(item)),
    [favoriteNames, zikhrs],
  );

  // Create a set of Esmaul Husna names to filter them out from zikhrs list
  const esmaulHusnaNamesSet = useMemo(() => {
    return new Set(ESMA_UL_HUSNA.map((item) => item.name));
  }, []);

  const sortedZikhrs = useMemo(() => {
    // Filter out Esmaul Husna items from zikhrs list
    const filteredZikhrs = zikhrs.filter((item) => !esmaulHusnaNamesSet.has(item.name));
    
    if (!favoriteNames.length) {
      return filteredZikhrs;
    }
    const favoritesOrdered: ZikhrItem[] = [];
    favoriteNames.forEach((name) => {
      const found = filteredZikhrs.find((item) => item.name === name);
      if (found) {
        favoritesOrdered.push(found);
      }
    });
    const remaining = filteredZikhrs.filter((item) => !favoriteSet.has(item.name));
    return [...favoritesOrdered, ...remaining];
  }, [favoriteNames, favoriteSet, zikhrs, esmaulHusnaNamesSet]);

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
  const selectedProgress = selected ? zikhrProgress[selected.name] ?? 0 : 0;
  const selectedTarget = selected ? getZikhrCount(selected.name, selected.count ?? 0) : 0;
  const selectedRemaining = selected ? Math.max(selectedTarget - selectedProgress, 0) : 0;
  const hasSelectedPartialProgress = Boolean(selected) && selectedProgress > 0 && selectedRemaining > 0;
  const isSelectedComplete = Boolean(selected) && selectedProgress > 0 && selectedRemaining === 0;
  const modalActionLabel = hasSelectedPartialProgress ? 'Devam Et' : 'Başlat';

  const resetCreateForm = () => {
    setNewZikhrName('');
    setNewZikhrCount('');
    setCreateError(null);
  };

  const closeEditModal = useCallback(() => {
    setEditModalVisible(false);
    setEditTargetName(null);
    setEditCountInput('');
    setEditError(null);
  }, []);

  const openEditCountModal = useCallback((name: string, currentCount: number) => {
    setEditTargetName(name);
    setEditCountInput(String(currentCount));
    setEditError(null);
    setEditModalVisible(true);
  }, []);

  const handleSaveEditedCount = useCallback(() => {
    if (!editTargetName) return;

    const parsed = Number.parseInt(editCountInput, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setEditError('Lütfen 0\'dan büyük bir sayı girin.');
      return;
    }

    updateZikhrCount(editTargetName, parsed);

    // Keep currently previewed entities in sync locally
    setPreviewZikhr((prev) =>
      prev && prev.name === editTargetName ? { ...prev, count: parsed } : prev
    );
    setSelectedEsmaulHusna((prev) =>
      prev && prev.name === editTargetName ? { ...prev, count: parsed } : prev
    );

    closeEditModal();
  }, [editTargetName, editCountInput, updateZikhrCount, closeEditModal]);

  const closeCreateModal = () => {
    resetCreateForm();
    setCreateModalVisible(false);
  };

  const handleStartSelectedZikhr = () => {
    if (selected) {
      if (isSelectedComplete) {
        resetZikhrProgress(selected.name);
      }
      setRunningZikhr(selected);
    }

    // reset values after selecting it
    setModalVisible(false);
    setPreviewZikhr(null);
    router.replace('/'); // navigate to main screen
  };


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

  const filteredCompletedHistory = useMemo(() => {
    const selectedFilter = COMPLETED_FILTERS[completedFilter];
    if (!selectedFilter || selectedFilter.durationMs === null) {
      return completedHistory;
    }
    const threshold = Date.now() - selectedFilter.durationMs;
    return completedHistory.filter((entry) => {
      const completedTime = new Date(entry.completedAt).getTime();
      if (Number.isNaN(completedTime)) {
        return false;
      }
      return completedTime >= threshold;
    });
  }, [completedHistory, completedFilter]);

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

  const filteredEsmaulHusna = useMemo(() => {
    return ESMA_UL_HUSNA.filter(
      (item) =>
        item.name.toLowerCase().includes(esmaulHusnaSearchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(esmaulHusnaSearchQuery.toLowerCase())
    );
  }, [esmaulHusnaSearchQuery]);

  const sortedEsmaulHusna = useMemo(() => {
    if (!esmaulHusnaFavoriteNames.length) {
      return filteredEsmaulHusna;
    }
    const favoritesOrdered: EsmaUlHusnaItem[] = [];
    esmaulHusnaFavoriteNames.forEach((name) => {
      const found = filteredEsmaulHusna.find((item) => item.name === name);
      if (found) {
        favoritesOrdered.push(found);
      }
    });
    const remaining = filteredEsmaulHusna.filter((item) => !esmaulHusnaFavoriteSet.has(item.name));
    return [...favoritesOrdered, ...remaining];
  }, [filteredEsmaulHusna, esmaulHusnaFavoriteNames, esmaulHusnaFavoriteSet]);

  const handleStartEsmaulHusna = useCallback(() => {
    if (!selectedEsmaulHusna) return;

    // Check if this Esmaul Husna already exists in zikhrs
    const existingZikhr = zikhrs.find((z) => z.name === selectedEsmaulHusna.name);
    
    if (existingZikhr) {
      // Use existing zikhr
      const currentProgress = zikhrProgress[existingZikhr.name] ?? 0;
      const remaining = Math.max(existingZikhr.count - currentProgress, 0);
      const isComplete = currentProgress > 0 && remaining === 0;
      
      if (isComplete) {
        // Reset if complete
        resetZikhrProgress(existingZikhr.name);
      }
      setRunningZikhr(existingZikhr);
    } else {
      // Add new zikhr if it doesn't exist
      const newZikhr = {
        name: selectedEsmaulHusna.name,
        description: selectedEsmaulHusna.meaning,
        count: getZikhrCount(selectedEsmaulHusna.name, selectedEsmaulHusna.count),
      };
      addZikhr(newZikhr);
      setRunningZikhr(newZikhr);
    }

    setSelectedEsmaulHusna(null);
    setEsmaulHusnaModalVisible(false);
    router.replace('/');
  }, [selectedEsmaulHusna, zikhrs, zikhrProgress, addZikhr, resetZikhrProgress, setRunningZikhr, router, getZikhrCount]);

  const openEsmaulHusnaDetails = useCallback((item: EsmaUlHusnaItem) => {
    setSelectedEsmaulHusna(item);
    setEsmaulHusnaModalVisible(true);
  }, []);

  // Calculate Esmaul Husna modal progress info
  const esmaulHusnaSelectedProgress = useMemo(() => {
    if (!selectedEsmaulHusna) return 0;
    // Check if it exists in zikhrs
    const existingZikhr = zikhrs.find((z) => z.name === selectedEsmaulHusna.name);
    if (existingZikhr) {
      return zikhrProgress[existingZikhr.name] ?? 0;
    }
    return 0;
  }, [selectedEsmaulHusna, zikhrs, zikhrProgress]);

  const esmaulHusnaSelectedTarget = selectedEsmaulHusna
    ? getZikhrCount(selectedEsmaulHusna.name, selectedEsmaulHusna.count ?? 0)
    : 0;
  const esmaulHusnaSelectedRemaining = selectedEsmaulHusna
    ? Math.max(esmaulHusnaSelectedTarget - esmaulHusnaSelectedProgress, 0)
    : 0;
  const hasEsmaulHusnaPartialProgress =
    Boolean(selectedEsmaulHusna) && esmaulHusnaSelectedProgress > 0 && esmaulHusnaSelectedRemaining > 0;
  const isEsmaulHusnaComplete =
    Boolean(selectedEsmaulHusna) && esmaulHusnaSelectedProgress > 0 && esmaulHusnaSelectedRemaining === 0;
  const esmaulHusnaModalActionLabel = hasEsmaulHusnaPartialProgress ? 'Devam Et' : 'Başlat';

  const toggleEsmaulHusnaFavorite = useCallback(
    (name: string) => {
      setEsmaulHusnaFavoriteNames((prev) => {
        const exists = prev.includes(name);
        const updated = exists ? prev.filter((item) => item !== name) : [name, ...prev];
        void persistEsmaulHusnaFavorites(updated);
        return updated;
      });
    },
    [persistEsmaulHusnaFavorites],
  );

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
          style={[styles.tabButton, activeTab === 'esmaulhusna' && styles.activeTabButton]}
          activeOpacity={0.85}
          onPress={() => setActiveTab('esmaulhusna')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'esmaulhusna' && styles.activeTabButtonText]}>
            Esmaül Hüsna
          </Text>
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
            const currentProgress = zikhrProgress[item.name] ?? 0;
            const remaining = Math.max(item.count - currentProgress, 0);
            const progressRatio = item.count > 0 ? Math.min(currentProgress / item.count, 1) : 0;
            return (
              <TouchableOpacity
                key={`zikhr-${item.name}`}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openZikhrDetails(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                  </View>
                  <TouchableOpacity
                    hitSlop={10}
                    style={styles.favoriteIconButton}
                    activeOpacity={0.5}
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
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardDesc} numberOfLines={2} ellipsizeMode="tail">
                  {item.description}
                </Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                  </View>
                <View style={styles.progressMetaRow}>
                  <Text style={styles.progressLabel}>
                    {currentProgress}/{item.count} tamamlandı
                  </Text>
                  <Pressable
                    hitSlop={10}
                    style={styles.editIconButton}
                    onPress={(event) => {
                      event.stopPropagation();
                      openEditCountModal(item.name, item.count);
                    }}
                  >
                    <AntDesign name="edit" size={18} color="#ffbf00" />
                  </Pressable>
                </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : activeTab === 'esmaulhusna' ? (
        <View style={styles.esmaulHusnaSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#a7acb5" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="İsim veya anlam ara..."
              placeholderTextColor="#6f737a"
              value={esmaulHusnaSearchQuery}
              onChangeText={setEsmaulHusnaSearchQuery}
            />
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {sortedEsmaulHusna.map((item) => {
              const isFavorite = esmaulHusnaFavoriteSet.has(item.name);
              const currentProgress = zikhrProgress[item.name] ?? 0;
              const effectiveCount = getZikhrCount(item.name, item.count);
              const progressRatio = effectiveCount > 0 ? Math.min(currentProgress / effectiveCount, 1) : 0;
              return (
                <TouchableOpacity
                  key={`esmaul-${item.name}`}
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() => openEsmaulHusnaDetails(item)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={10}
                      style={styles.favoriteIconButton}
                      activeOpacity={0.5}
                      onPress={(event) => {
                        event.stopPropagation();
                        toggleEsmaulHusnaFavorite(item.name);
                      }}
                    >
                      <Ionicons
                        name={isFavorite ? 'star' : 'star-outline'}
                        size={20}
                        color={isFavorite ? '#ffbf00' : '#6f737a'}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cardDesc} numberOfLines={2} ellipsizeMode="tail">
                    {item.meaning}
                  </Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                      <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                    </View>
                    <View style={styles.progressMetaRow}>
                      <Text style={styles.progressLabel}>
                        {currentProgress}/{effectiveCount} tamamlandı
                      </Text>
                      <Pressable
                        hitSlop={10}
                        style={styles.editIconButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          openEditCountModal(item.name, effectiveCount);
                        }}
                      >
                        <AntDesign name="edit" size={18} color="#ffbf00" />
                      </Pressable>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.completedSection}>
          <View style={styles.filterTray}>
            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.85}
              onPress={() => setFilterMenuVisible((prev) => !prev)}
            >
              <Ionicons name="filter" size={16} color="#0b2f1b" />
              <Text style={styles.filterButtonText}>Filtre: {COMPLETED_FILTERS[completedFilter].label}</Text>
              <Ionicons name={isFilterMenuVisible ? 'chevron-up' : 'chevron-down'} size={16} color="#0b2f1b" />
            </TouchableOpacity>
            {isFilterMenuVisible ? (
              <View style={styles.filterOptions}>
                {Object.entries(COMPLETED_FILTERS).map(([value, config]) => {
                  const isActive = value === completedFilter;
                  return (
                    <Pressable
                      key={value}
                      style={[styles.filterOption, isActive && styles.filterOptionActive]}
                      onPress={() => {
                        setCompletedFilter(value as CompletedFilter);
                        setFilterMenuVisible(false);
                      }}
                    >
                      <Text style={[styles.filterOptionText, isActive && styles.filterOptionTextActive]}>
                        {config.label}
                      </Text>
                      {isActive ? <Ionicons name="checkmark" size={16} color="#03c459" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
          <ScrollView contentContainerStyle={styles.list}>
            {filteredCompletedHistory.length === 0 ? (
              <View style={[styles.card, styles.emptyHistoryCard]}>
                <Text style={styles.emptyHistoryTitle}>Seçilen filtre için kayıt yok</Text>
                <Text style={styles.emptyHistoryDesc}>
                  {COMPLETED_FILTERS[completedFilter].label} aralığında tamamlanan zikir bulunamadı.
                </Text>
              </View>
            ) : (
              filteredCompletedHistory.map((entry) => (
                <View key={entry.id} style={[styles.card, styles.completedCard]}>
                  <View style={styles.completedHeader}>
                    <Text
                      style={[styles.cardTitle, styles.completedTitle]}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {entry.name}
                    </Text>
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
        </View>
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
                <View style={styles.modalInfoValueRow}>
                  <Text style={styles.modalInfoValue}>{selectedTarget}</Text>
                  {selected ? (
                    <Pressable
                      hitSlop={10}
                      style={styles.editIconButton}
                      onPress={() => openEditCountModal(selected.name, selectedTarget)}
                    >
                      <AntDesign name="edit" size={18} color="#ffbf00" />
                    </Pressable>
                  ) : null}
                </View>
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
                  <Text style={styles.modalRunButtonText}>{modalActionLabel}</Text>
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

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
          <Pressable style={styles.modalBackdropPressable} onPress={closeEditModal}>
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.modalTitle}>Zikir Adedini Düzenle</Text>
              {editTargetName ? (
                <Text style={[styles.modalDescription, { marginBottom: 12 }]}>{editTargetName}</Text>
              ) : null}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Yeni Adet</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Örn. 33"
                  placeholderTextColor="#6f737a"
                  value={editCountInput}
                  onChangeText={setEditCountInput}
                  keyboardType="numeric"
                />
              </View>
              {editError ? <Text style={styles.modalErrorText}>{editError}</Text> : null}
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.modalCancelButton} activeOpacity={0.9} onPress={closeEditModal}>
                  <Text style={styles.modalCancelButtonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalRunButton} activeOpacity={0.9} onPress={handleSaveEditedCount}>
                  <Text style={styles.modalRunButtonText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </BlurView>
      </Modal>

      <Modal
        visible={isEsmaulHusnaModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEsmaulHusnaModalVisible(false);
          setSelectedEsmaulHusna(null);
        }}
      >
        <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={() => {
              setEsmaulHusnaModalVisible(false);
              setSelectedEsmaulHusna(null);
            }}
          >
            <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
              {selectedEsmaulHusna && (
                <>
                  <Text style={styles.modalTitle}>{selectedEsmaulHusna.name}</Text>
                  <Text style={styles.modalDescription}>{selectedEsmaulHusna.meaning}</Text>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                    <View style={styles.modalInfoValueRow}>
                      <Text style={styles.modalInfoValue}>{esmaulHusnaSelectedTarget}</Text>
                      <Pressable
                        hitSlop={10}
                        style={styles.editIconButton}
                        onPress={() =>
                          openEditCountModal(selectedEsmaulHusna.name, esmaulHusnaSelectedTarget)
                        }
                      >
                        <AntDesign name="edit" size={18} color="#ffbf00" />
                      </Pressable>
                    </View>
                  </View>
                  <View style={styles.modalButtonsRow}>
                    <TouchableOpacity
                      style={styles.modalRunButton}
                      activeOpacity={0.9}
                      onPress={handleStartEsmaulHusna}
                    >
                      <Text style={styles.modalRunButtonText}>{esmaulHusnaModalActionLabel}</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
  completedSection: {
    flex: 1,
  },
  esmaulHusnaSection: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#e6e7e9',
    fontSize: 15,
  },
  countBadge: {
    backgroundColor: '#26292f',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#a7acb5',
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
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
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
  },
  completedTitle: {
    flex: 1,
    flexShrink: 1,
    lineHeight: 20,
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
  progressContainer: {
    marginTop: 12,
    gap: 6,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#3a3d42',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#03c459',
  },
  progressLabel: {
    fontSize: 12,
    color: '#a7acb5',
    fontWeight: '500',
  },
  progressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  editIconButton: {
    padding: 4,
    marginLeft: 'auto',
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
  filterTray: {
    marginBottom: 12,
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffbf00',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: '700',
    color: '#0b2f1b',
  },
  filterOptions: {
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterOptionActive: {
    backgroundColor: '#26292f',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#e6e7e9',
  },
  filterOptionTextActive: {
    color: '#03c459',
    fontWeight: '700',
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
  modalInfoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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


