import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useZikhr } from '@/context/ZikhrContext';

const { width } = Dimensions.get('window');
const DEVICE_WIDTH = width * 0.6;
const DEVICE_HEIGHT = DEVICE_WIDTH * 1.0;
const DAILY_TARGET = 10000;
const MAIN_BUTTON_SIZE = 75;
const PROGRESS_RING_STROKE = 6;
const PROGRESS_RING_GAP = 4; // visual gap between button edge and ring inner edge
const PROGRESS_RING_SIZE = PROGRESS_RING_STROKE + MAIN_BUTTON_SIZE + (2 * PROGRESS_RING_GAP);
const PROGRESS_RING_RADIUS = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

export default function HomeScreen() {
  const { selectedZikhr, addCompletedZikhr } = useZikhr();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(selectedZikhr.count ?? DAILY_TARGET);
  const [isZikirInfoVisible, setZikirInfoVisible] = useState(false);
  const [isHadithInfoVisible, setHadithInfoVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    setTarget(selectedZikhr.count ?? DAILY_TARGET);
    setCount(0);
    setHasCompleted(false);
  }, [selectedZikhr]);

  const progress = Math.min(count / target, 1);
  const strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
  const remainingCount = Math.max(target - count, 0);

  // Notify user when it is completed
  const notifyCompletion = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Tebrikler!', selectedZikhr.name + ' zikrini tamamladınız.');
  }, [selectedZikhr.name]);

  // Check in every step if it is completed
  const increment = () => {
    setCount((prev) => {
      const updated = prev + 1;
      if (!hasCompleted && updated >= target && target > 0) {
        setHasCompleted(true);
        addCompletedZikhr(selectedZikhr);
        notifyCompletion();
      }
      return updated;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Reset Zikirmatik
  const reset = () => {
    setCount(0);
    setHasCompleted(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const dailyHadith = {
    text: 'Kim bir Müslüman ayıbı örterse. Allah da dünya ve ahirette onu aynısını örter.',
    source: 'Hadis-i Şerif',
  };

  const formatCount = (num: number) => {
    return String(num).padStart(5, '0');
  };

  const shareHadith = async () => {
    try {
      const result = await Share.share({
        message: `${dailyHadith.text}\n\n— ${dailyHadith.source}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const shareZikhr = async () => {
    try {
      const result = await Share.share({
        message: `${selectedZikhr.description}\n\n— Zikir Adeti: ${selectedZikhr.count}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Zikir Info Banner */}
      <TouchableOpacity
        style={styles.zikirBar}
        onPress={() => setZikirInfoVisible(true)}
        activeOpacity={0.85}
      >
        <View style={styles.zikirBarCenter}>
          <Text style={[styles.zikirBarName, styles.zikirTextGlowing]}>{selectedZikhr.name}</Text>
          <Text style={styles.zikirBarGoal}>Kalan Hedef: {remainingCount}</Text>
        </View>
        <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareZikhr}
              activeOpacity={0.7}
            >
              <MaterialIcons name="share" size={22} color="#e6e7e9" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Physical Zikirmatik Device */}
      <View style={styles.deviceContainer}>
        <View style={styles.device}>
          {/* Stylistic background layers */}
          <View style={styles.deviceInnerGlow} />
          <View style={styles.deviceTopHighlight} />
          
          {/* Green LED Display */}
          <View style={styles.displayContainer}>
            <Text style={styles.ledDisplay}>{formatCount(count)}</Text>
          </View>


          {/* Main Counting Button (Large Center Button) */}
          <View style={styles.mainButtonWrapper}>
            <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE} style={styles.progressRing}>
              <Circle
                cx={PROGRESS_RING_SIZE / 2}
                cy={PROGRESS_RING_SIZE / 2}
                r={PROGRESS_RING_RADIUS}
                stroke="#3a3b40"
                strokeWidth={PROGRESS_RING_STROKE}
                fill="none"
              />
              <Circle
                cx={PROGRESS_RING_SIZE / 2}
                cy={PROGRESS_RING_SIZE / 2}
                r={PROGRESS_RING_RADIUS}
                stroke="#03c459"
                strokeWidth={PROGRESS_RING_STROKE}
                strokeDasharray={`${PROGRESS_RING_CIRCUMFERENCE} ${PROGRESS_RING_CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${PROGRESS_RING_SIZE / 2} ${PROGRESS_RING_SIZE / 2})`}
              />
            </Svg>
            <TouchableOpacity 
              style={styles.mainButton}
              onPress={increment}
              activeOpacity={0.8}
            >
              <View style={styles.mainButtonInner}>
                <View style={styles.mainButtonPattern} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Reset Button (Small Side Button) */}
          <TouchableOpacity 
            style={styles.resetButtonSmall}
            onPress={reset}
            activeOpacity={0.7}
          />
        </View>
      </View>

      {/* Daily Hadith Section */}
      <TouchableOpacity
        style={styles.hadithSection}
        onPress={() => setHadithInfoVisible(true)}
        activeOpacity={0.85}
      >

          <View style={styles.hadithHeader}>
            <Text style={styles.hadithTitle}>Günün Hadisi</Text>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareHadith}
              activeOpacity={0.7}
            >
              <MaterialIcons name="share" size={22} color="#e6e7e9" />
            </TouchableOpacity>
          </View>

          <Text style={styles.hadithText} numberOfLines={2} ellipsizeMode="tail">{dailyHadith.text}</Text>
          <Text style={styles.hadithSource}>— {dailyHadith.source}</Text>

      </TouchableOpacity>

      {/* Zikir Pop-up Card */}
      <Modal
        visible={isZikirInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZikirInfoVisible(false)}
      >
          <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
            <Pressable style={styles.modalBackdropPressable} onPress={() => setZikirInfoVisible(false)}>
              <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                <Text style={styles.modalTitle}>{selectedZikhr.name}</Text>
                <Text style={styles.modalDescription}>{selectedZikhr.description}</Text>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                  <Text style={styles.modalInfoValue}>{selectedZikhr.count}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setZikirInfoVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCloseButtonText}>Kapat</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </BlurView>

      </Modal>

      {/* Hadith Pop-up Card */}
      <Modal
        visible={isHadithInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHadithInfoVisible(false)}
      >
          <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
            <Pressable style={styles.modalBackdropPressable} onPress={() => setHadithInfoVisible(false)}>
              <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                <Text style={styles.modalTitle}>{dailyHadith.source}</Text>
                <Text style={styles.modalDescription}>{dailyHadith.text}</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setHadithInfoVisible(false)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalCloseButtonText}>Kapat</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </BlurView>

      </Modal>


    </ScrollView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2025',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 15,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zikirBar: {
    width: '70%',
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3d42',
    position: 'relative',
  },
  zikirBarCenter: {
    alignItems: 'center',
  },
  zikirBarName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffbf00',
    letterSpacing: 0.5,
  },
  zikirTextGlowing: {
    textShadowColor: '#ca9b0fff',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 9
  },
  zikirBarGoal: {
    fontSize: 11,
    color: '#a7acb5',
    marginTop: 5,
    letterSpacing: 0.5,
  },
  infoHint: {
    fontSize: 14,
    color: '#e6e7e9',
    opacity: 0.7,
    position: 'absolute',
    right: 18,
    top: '50%',
    marginTop: -10,
  },
  deviceContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  device: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    backgroundColor: '#131313ff',
    borderRadius: DEVICE_WIDTH * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 30,
    paddingBottom: 25,
    position: 'relative',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 12,
    // Multi-layered borders for depth
    borderWidth: 2,
    borderColor: '#1a1a1f',
    // Inner shadow effect using overlay
    overflow: 'hidden',
  },
  deviceInnerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: DEVICE_WIDTH * 0.3,
    borderWidth: 1,
    borderColor: '#2a2b30',
    opacity: 0.3,
  },
  deviceTopHighlight: {
    position: 'absolute',
    top: 0,
    left: '20%',
    right: '20%',
    height: '15%',
    backgroundColor: '#1a1a1f',
    borderTopLeftRadius: DEVICE_WIDTH * 0.3,
    borderTopRightRadius: DEVICE_WIDTH * 0.3,
    opacity: 0.4,
  },
  displayContainer: {
    width: '60%',
    height: 45,
    backgroundColor: '#098441ff',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    // LED display effect
    borderWidth: 1.5,
    borderColor: '#003300',
  },

  //LED TEXT
  ledDisplay: {
    fontSize: 32,
    color: '#003300',
    fontFamily: 'DSdigi',
    letterSpacing: 1.5,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 1,
  },
  mainButtonWrapper: {
    width: PROGRESS_RING_SIZE,
    height: PROGRESS_RING_SIZE,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  progressRing: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  mainButton: {
    width: MAIN_BUTTON_SIZE,
    height: MAIN_BUTTON_SIZE,
    borderRadius: MAIN_BUTTON_SIZE / 2,
    backgroundColor: '#c7c7c7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  mainButtonInner: {
    width: MAIN_BUTTON_SIZE - 10,
    height: MAIN_BUTTON_SIZE - 10,
    borderRadius: (MAIN_BUTTON_SIZE - 10) / 2,
    backgroundColor: '#c7c7c7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainButtonPattern: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: '#1f2025',
    backgroundColor: 'transparent',
  },
  resetButtonSmall: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#c7c7c7',
    borderWidth: 1,
    borderTopColor: '#c7c7c7',
    borderRightColor: '#c7c7c7',
    borderBottomColor: '#c7c7c7',
    borderLeftColor: '#c7c7c7',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  statsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  largeCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e8ca8e',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  dailyGoalText: {
    fontSize: 14,
    color: '#e6e7e9',
    opacity: 0.8,
    marginBottom: 10,
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#c7c7c7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressBarLabel: {
    fontSize: 10,
    color: '#e6e7e9',
    fontWeight: '600',
    opacity: 0.9,
  },
  hadithSection: {
    width: '100%',
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    padding: 15,
    bottom: 15,
    position:"absolute"
  },
  hadithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
    position: 'relative',
  },
  hadithTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffbf00',
    textAlign: 'left',
  },
  shareButton: {
    position: 'absolute',
    right: 1,
    borderRadius: 4,
  },
  hadithText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#e6e7e9',
    textAlign: 'justify',
    marginBottom: 10,
  },
  hadithSource: {
    fontSize: 12,
    color: '#e6e7e9',
    opacity: 0.8,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBackdropWeb: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  modalCloseButton: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#ffbf00',
    borderRadius: 999,
  },
  modalCloseButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0b2f1b',
  },
});
