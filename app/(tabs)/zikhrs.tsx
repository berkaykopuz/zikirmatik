import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';

import { ZIKHR_ITEMS } from '@/constants/zikhrs';
import { useZikhr } from '@/context/ZikhrContext';

export default function ZikhrsScreen() {
  const router = useRouter();
  const { setSelectedZikhr } = useZikhr();

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selected = selectedIndex != null ? ZIKHR_ITEMS[selectedIndex] : null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zikirler</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {ZIKHR_ITEMS.map((item, index) => (
          <TouchableOpacity
            key={item.name}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => {
              setSelectedIndex(index);
              setModalVisible(true);
            }}
          >
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDesc} numberOfLines={2} ellipsizeMode="tail">
              {item.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
                <TouchableOpacity
                  style={styles.modalRunButton}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (selected) {
                      setSelectedZikhr(selected);
                    }
                    // reset values after selecting it
                    setModalVisible(false);
                    setSelectedIndex(null);
                    router.replace('/'); // navigate to main screen
                  }}
                >
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
  
});


