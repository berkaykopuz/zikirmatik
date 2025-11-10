import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Modal, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

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
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DAILY_TARGET);
  const [isZikirInfoVisible, setZikirInfoVisible] = useState(false);

  const progress = Math.min(count / target, 1);
  const strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
  const remainingCount = Math.max(target - count, 0);

  const increment = () => {
    setCount((prev) => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const reset = () => {
    setCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const dailyHadith = {
    text: 'Kim bir Müslüman ayıbı örterse. Allah da dünya ve ahirette onu aynısını örter.',
    source: 'Hadis-i Şerif',
  };

  const zikirInfo = {
    name: 'Subhanallah',
    description:
      'Subhanallah zikri, Allah’ın her türlü eksiklikten münezzeh olduğunu hatırlamak için söylenir. Her tekrar eden, Allah’ın büyüklüğünü ve kusursuzluğunu kalbinde tazeler.',
  };

  const formatCount = (num: number) => {
    return String(num).padStart(5, '0');
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
          <Text style={styles.zikirBarName}>{zikirInfo.name}</Text>
          <Text style={styles.zikirBarGoal}>Kalan Hedef: {remainingCount}</Text>
        </View>
        <Text style={styles.infoHint}>ⓘ</Text>
      </TouchableOpacity>

      {/* Physical Zikirmatik Device */}
      <View style={styles.deviceContainer}>
        <View style={styles.device}>
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
      <View style={styles.hadithSection}>
        <Text style={styles.hadithTitle}>Günün Hadisi</Text>
        <Text style={styles.hadithText}>{dailyHadith.text}</Text>
        <Text style={styles.hadithSource}>— {dailyHadith.source}</Text>
      </View>

      <Modal
        visible={isZikirInfoVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setZikirInfoVisible(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setZikirInfoVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{zikirInfo.name}</Text>
            <Text style={styles.modalDescription}>{zikirInfo.description}</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setZikirInfoVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseButtonText}>Kapat</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
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
    marginBottom: 20,
  },
  device: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    backgroundColor: '#000000',
    borderRadius: DEVICE_WIDTH * 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 25,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    // Subtle highlight on top edge
    borderTopWidth: 1,
    borderTopColor: '#2a2b30',
  },
  displayContainer: {
    width: '70%',
    height: 45,
    backgroundColor: '#03c459',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    // LED display effect
    borderWidth: 1.5,
    borderColor: '#003300',
  },
  ledDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003300',
    fontFamily: 'serif',
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
    width: MAIN_BUTTON_SIZE - 7,
    height: MAIN_BUTTON_SIZE - 7,
    borderRadius: (MAIN_BUTTON_SIZE - 7) / 2,
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
    marginTop: 15,
  },
  hadithTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e6e7e9',
    marginBottom: 10,
    textAlign: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.6)',
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
