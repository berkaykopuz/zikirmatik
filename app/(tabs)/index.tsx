import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
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
  const {
    selectedZikhr,
    setSelectedZikhr,
    addCompletedZikhr,
    zikhrProgress,
    updateZikhrProgress,
    resetZikhrProgress,
  } = useZikhr();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DAILY_TARGET);
  const [isZikirInfoVisible, setZikirInfoVisible] = useState(false);
  const [isHadithInfoVisible, setHadithInfoVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(true);

  const router = useRouter();

  useEffect(() => {
    if (!selectedZikhr) {
      setTarget(DAILY_TARGET);
      setCount(0);
      setHasCompleted(false);
      return;
    }

    const nextTarget = selectedZikhr.count;
    const storedProgress = zikhrProgress[selectedZikhr.name] ?? 0;

    setTarget(nextTarget);
    setCount(storedProgress);
    setHasCompleted(storedProgress >= nextTarget && nextTarget > 0);
  }, [selectedZikhr, zikhrProgress]);


  const progress = Math.min(count / target, 1);
  const strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
  const remainingCount = Math.max(target - count, 0);

  // Notify user when it is completed
  const notifyCompletion = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Alert.alert('Tebrikler!', selectedZikhr?.name + ' zikrini tamamladınız.');
  }, [selectedZikhr?.name]);

  // Check in every step if it is completed
  const increment = () => {

    setCount((prev) => {

      if (!selectedZikhr) {
        router.push("/zikhrs");
        return prev;
      }

      const updated = prev + 1;
      updateZikhrProgress(selectedZikhr.name, Math.min(updated, target));
      if (!hasCompleted && updated >= target && target > 0) {
        setHasCompleted(true);
        addCompletedZikhr(selectedZikhr);
        notifyCompletion();
        
        // Clear selected zikhr and restart the dikhrmatik
        setSelectedZikhr(null);
        router.replace('/zikhrs');
      }
      return updated;
    });
  };

  // Reset Zikirmatik
  const reset = () => {
    if (!selectedZikhr) return;

    Alert.alert(
      'Sıfırla',
      'Zikir sayacını sıfırlamak istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            setCount(0);
            setHasCompleted(false);
            resetZikhrProgress(selectedZikhr.name);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          },
        },
      ],
      { cancelable: true }
    );
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
        message: `${selectedZikhr?.description}\n\n— Zikir Adeti: ${selectedZikhr?.count}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Play n Pause the music automatically
  const player = useAudioPlayer(require('@/assets/music/ney.mp3'));

  useEffect(() => {
    if (isSoundPlaying) {
      player.play();
    } else {
      player.pause();
    }

    return () => {
      player.pause();
    };
  }, [isSoundPlaying, player]);

  return (
    <View style={styles.container}>
      {/* Sound and Settings Icons */}
      <View style={styles.topButtonsRow}>
        <TouchableOpacity
          style={[styles.iconButton, styles.soundButton]}
          onPress={() => setIsSoundPlaying((prev) => !prev)}
          activeOpacity={0.7}
        >
          <MaterialIcons name={isSoundPlaying ? 'volume-up' : 'volume-off'} size={30} color="#e6e7e9" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            // TODO: Navigate to settings screen
            Alert.alert('Ayarlar', 'Ayarlar sayfası yakında eklenecek.');
          }}
          activeOpacity={0.5}
        >
          <MaterialIcons name="settings" size={30} color="#e6e7e9" />
        </TouchableOpacity>
      </View>

    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Zikir Info Banner */}
      <TouchableOpacity
        style={styles.zikirBar}
        onPress={() => {
          if (!selectedZikhr) {
            router.push("/zikhrs"); 
            return;
          }
          setZikirInfoVisible(true)
          }
        }
        activeOpacity={0.85}
      >
        <View style={styles.zikirBarCenter}>
          <Text style={[styles.zikirBarName, styles.zikirTextGlowing]}>
            {selectedZikhr ? selectedZikhr.name : "Zikir Seç"}
          </Text>
          <Text style={styles.zikirBarGoal}>
            {selectedZikhr ? `Kalan Hedef: ${remainingCount}` : "Bir zikir seçiniz"}
          </Text>

        </View>
        {/*<TouchableOpacity           Dikhr sharing can be put in some other time.
              style={styles.shareButton}
              onPress={shareZikhr}
              activeOpacity={0.7}
            >
              <MaterialIcons name="share" size={22} color="#e6e7e9" />
        </TouchableOpacity>*/}
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
            <Pressable 
              style={({ pressed }) => [
                styles.mainButton,
                pressed && styles.mainButtonPressed
              ]}
              onPressIn={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              onPress={increment}
            >
              <View style={styles.mainButtonInner}>
                <View style={styles.mainButtonPattern} />
              </View>
            </Pressable>
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
              style={styles.hadithShareButton}
              onPress={(e) => {
                e.stopPropagation();
                shareHadith();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.hadithShareButtonText}>PAYLAŞ</Text>
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
                {selectedZikhr && (
                  <>
                    <Text style={styles.modalTitle}>{selectedZikhr.name}</Text>
                    <Text style={styles.modalDescription}>{selectedZikhr.description}</Text>
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                      <Text style={styles.modalInfoValue}>{selectedZikhr.count}</Text>
                    </View>
                  </>
                )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2025',
  },
  scrollView: {
    flex: 1,
  },
  topButtonsRow: {
    position: 'absolute',
    top: 45,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
  },
  soundButton: {
    marginRight: 12,
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
  mainButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
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
  hadithShareButton: {
    position: 'absolute',
    right: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffbf00',
    borderRadius: 6,
  },
  hadithShareButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#0b2f1b',
    letterSpacing: 0.5,
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
