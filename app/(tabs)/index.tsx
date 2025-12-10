import { BeadCounter } from '@/components/BeadCounter';
import { useZikhr } from '@/context/ZikhrContext';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { VolumeManager } from 'react-native-volume-manager';

import { ZikhrHomeWidget } from "@/widgets/ZikhrHomeWidget";
import { requestWidgetUpdate } from "react-native-android-widget";

import { getDailyHadith } from '@/constants/hadiths';

const { width } = Dimensions.get('window');
const DEVICE_WIDTH = width * 0.6;
const DEVICE_HEIGHT = DEVICE_WIDTH * 1.2;
const DAILY_TARGET = 10000;
const MAIN_BUTTON_SIZE = 75;
const PROGRESS_RING_STROKE = 6;
const PROGRESS_RING_GAP = 4; // visual gap between button edge and ring inner edge
const PROGRESS_RING_SIZE = PROGRESS_RING_STROKE + MAIN_BUTTON_SIZE + (2 * PROGRESS_RING_GAP);
const PROGRESS_RING_RADIUS = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;
let lastPressTime = 0;

export default function HomeScreen() {
  const {
    selectedZikhr,
    setSelectedZikhr,
    addCompletedZikhr,
    zikhrProgress,
    updateZikhrProgress,
    resetZikhrProgress,
    soundEnabled,
    setSoundEnabled,
    sfxEnabled,
    volumeCountEnabled,
    vibrationEnabled,
    appearanceMode,
    backgroundImage,
  } = useZikhr();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DAILY_TARGET);
  const [isZikirInfoVisible, setZikirInfoVisible] = useState(false);
  const [isHadithInfoVisible, setHadithInfoVisible] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const isInitialLoadRef = useRef(true);
  const previousZikhrNameRef = useRef<string | null>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const router = useRouter();

  // SYNC ANDROID WIDGET 
  const syncWidget = useCallback(async () => {
    if (!selectedZikhr) return;

    try {
      // Persist widget data to AsyncStorage FIRST so widget handler can read it
      await AsyncStorage.multiSet([
        ["activeZikrName", selectedZikhr.name],
        ["activeZikrCount", String(count)],
        ["activeZikrTarget", String(target)],
      ]);

      // Update the widget via requestWidgetUpdate
      // Use React.createElement to avoid React Compiler optimizations that conflict with widget context
      // This will trigger the widget handler which reads from AsyncStorage
      await requestWidgetUpdate({
        widgetName: "ZikhrHome",
        renderWidget: () =>
          React.createElement(ZikhrHomeWidget, {
            zikrName: selectedZikhr.name,
            count: count,
            target: target,
          }),
        // optional but nice for debugging
        widgetNotFound: () => {
          console.log("No ZikhrHome widget on the home screen");
        },
      });
    } catch (e) {
      console.warn("Widget sync failed", e);
    }
  }, [selectedZikhr, count, target]);

  // Load zikhr data when selectedZikhr changes (only when switching zikhrs, not when progress updates)
  useEffect(() => {
    const currentZikhrName = selectedZikhr?.name ?? null;
    
    // Only run if the zikhr name actually changed
    if (previousZikhrNameRef.current === currentZikhrName && selectedZikhr?.count === target) {
      return;
    }
    
    previousZikhrNameRef.current = currentZikhrName;
    
    if (!selectedZikhr) {
      setTarget(DAILY_TARGET);
      setCount(0);
      setHasCompleted(false);
      isInitialLoadRef.current = true;
      // Clear widget data when no zikr is selected
      AsyncStorage.multiSet([
        ["activeZikrName", ""],
        ["activeZikrCount", "0"],
        ["activeZikrTarget", String(DAILY_TARGET)],
      ]).catch(() => {});
      return;
    }

    const nextTarget = selectedZikhr.count;
    const storedProgress = zikhrProgress[selectedZikhr.name] ?? 0;

    setTarget(nextTarget);
    setCount(storedProgress);
    setHasCompleted(storedProgress >= nextTarget && nextTarget > 0);
    isInitialLoadRef.current = true;
    
    // Persist widget data when zikr is selected (widget handler reads from AsyncStorage)
    AsyncStorage.multiSet([
      ["activeZikrName", selectedZikhr.name],
      ["activeZikrCount", String(storedProgress)],
      ["activeZikrTarget", String(nextTarget)],
    ]).then(() => {
      // Sync widget after data is persisted and state is updated
      // Use setTimeout to ensure state updates have been applied
      setTimeout(() => {
        if (selectedZikhr) {
          syncWidget();
        }
      }, 0);
    }).catch(() => {});
    
    // Reset flag after a brief delay to allow initial load to complete
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedZikhr?.name, selectedZikhr?.count, zikhrProgress]); // Include zikhrProgress to read latest value, but use ref to prevent re-runs

  const progress = target > 0 ? Math.min(count / target, 1) : 0;
  const strokeDashoffset = PROGRESS_RING_CIRCUMFERENCE * (1 - progress);
  const remainingCount = Math.max(target - count, 0);

  // Notify user when it is completed
  const notifyCompletion = useCallback(() => {
    if (vibrationEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    }
    Alert.alert('Tebrikler!', selectedZikhr?.name + ' zikrini tamamladınız.');
  }, [selectedZikhr?.name, vibrationEnabled]);

  // Sync progress to context when count changes (but not when loading from context)
  useEffect(() => {
    if (!selectedZikhr || isInitialLoadRef.current) return;

    // Widget Synchronization - sync immediately when count changes
    syncWidget();
    
    // Only update if count is different from stored progress to avoid loops
    const storedProgress = zikhrProgress[selectedZikhr.name] ?? 0;
    if (count !== storedProgress) {
      // Defer context update to avoid updating during render
      queueMicrotask(() => {
        updateZikhrProgress(selectedZikhr.name, count);
        
        // Check for completion
        if (!hasCompleted && count === target && target > 0) {
          setHasCompleted(true);
          addCompletedZikhr(selectedZikhr);
          notifyCompletion();
        }
      });
    }
  }, [count, selectedZikhr, target, hasCompleted, zikhrProgress, updateZikhrProgress, addCompletedZikhr, notifyCompletion, syncWidget]);


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
          onPress: async () => {
            setCount(0);
            setHasCompleted(false);
            resetZikhrProgress(selectedZikhr.name);
            if (vibrationEnabled) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }
            // Widget will sync via useEffect when count changes to 0
          },
        },
      ],
      { cancelable: true }
    );
  };

  const dailyHadith = getDailyHadith();

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
  
  // Boncuk (bead click) sound effect
  const boncukPlayer = useAudioPlayer(require('@/assets/music/bead.mp3'));

  const increment = useCallback(() => {

    if (vibrationEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    
    // Play bead-boncuk sound effect if sound is enabled
    if (sfxEnabled) {
      try {
        boncukPlayer.seekTo(0);
        boncukPlayer.play();
      } catch (e) {
        // Ignore errors if player is not ready
      }
    }

    // Update local state - useEffect will handle context updates
    setCount((prev) => prev + 1);
  }, [selectedZikhr, sfxEnabled, boncukPlayer]);

  useEffect(() => {
    try {
      if (soundEnabled) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      // Ignore errors if player is released
    }

    return () => {
      try {
        player.pause();
      } catch (e) {
        // Ignore errors during cleanup
      }
    };
  }, [soundEnabled, player]);

  // Volume button listener to increment zikhr
  useEffect(() => {
    if (!volumeCountEnabled) return;

    VolumeManager.showNativeVolumeUI({ enabled: false });

    VolumeManager.setVolume(0.2);

    const volumeListener = VolumeManager.addVolumeListener((result) => {
      
      const now = Date.now();

      if (now - lastPressTime < 120) return;

      lastPressTime = now;

      setTimeout(() => VolumeManager.setVolume(0.2), 1);

      increment();
    });

    return () => {
      volumeListener.remove();
      VolumeManager.showNativeVolumeUI({ enabled: true });
    };

  }, [selectedZikhr, increment, volumeCountEnabled]);

  const getBackgroundImage = () => {
    switch (backgroundImage) {
      case 'kaaba':
        return require('@/assets/images/backgrounds/kaaba.png');
      case 'medina':
        return require('@/assets/images/backgrounds/medina.png');
      case 'nature':
        return require('@/assets/images/backgrounds/nature.png');
      default:
        return null;
    }
  };

  const bgImageSource = getBackgroundImage();

  function renderContent() {
    return (
      <>
        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSoundEnabled(!soundEnabled)}
          >
            <MaterialCommunityIcons
              name={soundEnabled ? "music" : "music-off"}
              size={24}
              color={backgroundImage ? "#FFFFFF" : "#e6e7e9"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/settings')}
          >
            <MaterialIcons name="settings" size={24} color={backgroundImage ? "#FFFFFF" : "#e6e7e9"} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          <TouchableOpacity
            style={styles.zikirBar}
            onPress={() => {
              if (!selectedZikhr) {
                router.push('/zikhrs');
              }
              else{
                setZikirInfoVisible(true);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.zikirBarCenter}>
              <Text style={[styles.zikirBarName, styles.zikirTextGlowing]}>{selectedZikhr?.name || 'Zikir Seç'}</Text>
              <Text style={styles.zikirBarGoal}>Kalan Hedef: {remainingCount}</Text>
            </View>
            <Text style={styles.infoHint}>ⓘ</Text>
          </TouchableOpacity>

          <View style={styles.deviceContainer}>
            <View style={styles.device}>
              <View style={styles.deviceInnerGlow} />
              <View style={styles.deviceTopHighlight} />

              <View style={styles.displayContainer}>
                <Text style={styles.ledDisplay}>{formatCount(count)}</Text>
              </View>

              <View style={styles.mainButtonWrapper}>
                <View style={styles.progressRing}>
                  {appearanceMode === 'beads' ? (
                    <BeadCounter
                      count={count}
                      target={target}
                      size={PROGRESS_RING_SIZE}
                      strokeWidth={PROGRESS_RING_STROKE}
                    />
                  ) : (
                    <Svg width={PROGRESS_RING_SIZE} height={PROGRESS_RING_SIZE}>
                      <Circle
                        cx={PROGRESS_RING_SIZE / 2}
                        cy={PROGRESS_RING_SIZE / 2}
                        r={PROGRESS_RING_RADIUS}
                        stroke="#3a3d42"
                        strokeWidth={PROGRESS_RING_STROKE}
                        fill="none"
                      />
                      <Circle
                        cx={PROGRESS_RING_SIZE / 2}
                        cy={PROGRESS_RING_SIZE / 2}
                        r={PROGRESS_RING_RADIUS}
                        stroke="#098441"
                        strokeWidth={PROGRESS_RING_STROKE}
                        fill="none"
                        strokeDasharray={PROGRESS_RING_CIRCUMFERENCE}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        rotation="-90"
                        origin={`${PROGRESS_RING_SIZE / 2}, ${PROGRESS_RING_SIZE / 2}`}
                      />
                    </Svg>
                  )}
                </View>

                <Animated.View
                  style={[
                    styles.mainButton,
                    {
                      transform: [{ scale: buttonScale }],
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.mainButtonTouchable}
                    onPress={increment}
                    onPressIn={() => {
                      Animated.spring(buttonScale, {
                        toValue: 0.95,
                        useNativeDriver: true,
                        tension: 300,
                        friction: 10,
                      }).start();
                    }}
                    onPressOut={() => {
                      Animated.spring(buttonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 300,
                        friction: 10,
                      }).start();
                    }}
                  >
                    <View style={styles.mainButtonInner}>
                      <View style={styles.mainButtonPattern} />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.resetButtonSmall}
                  onPress={reset}
                >
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView >

        <TouchableOpacity
          style={styles.hadithSection}
          onPress={() => setHadithInfoVisible(true)}
          activeOpacity={0.9}
        >
          <View style={styles.hadithHeader}>
            <Text style={styles.hadithTitle}>Günün Anlatısı</Text>
            <Image
              source={require('@/assets/images/hadith-arabic.png')}
              style={styles.hadithArabicImage}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.hadithShareButton} onPress={shareHadith}>
              <Text style={styles.hadithShareButtonText}>PAYLAŞ</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hadithText} numberOfLines={2}>{dailyHadith.text}</Text>
          <Text style={styles.hadithSource}>{dailyHadith.source}</Text>
        </TouchableOpacity>
      </>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {bgImageSource ? (
        <ImageBackground source={bgImageSource} style={{ flex: 1 }} resizeMode="cover">
          <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            {renderContent()}
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.container}>
          {renderContent()}
        </View>
      )}

      {/* Modals */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isZikirInfoVisible}
        onRequestClose={() => setZikirInfoVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" experimentalBlurMethod="dimezisBlurView" />
          <Pressable style={styles.modalBackdropPressable} onPress={() => setZikirInfoVisible(false)}>
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>{selectedZikhr?.name}</Text>
              <Text style={styles.modalDescription}>{selectedZikhr?.description}</Text>

              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                <Text style={styles.modalInfoValue}>{target}</Text>
              </View>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setZikirInfoVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isHadithInfoVisible}
        onRequestClose={() => setHadithInfoVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <BlurView intensity={50} style={StyleSheet.absoluteFill} tint="dark" experimentalBlurMethod="dimezisBlurView" />
          <Pressable style={styles.modalBackdropPressable} onPress={() => setHadithInfoVisible(false)}>
            <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Günün Anlatısı</Text>
              <Text style={styles.modalDescription}>{dailyHadith.text}</Text>
              <Text style={[styles.hadithSource, { textAlign: 'center', marginTop: 10 }]}>{dailyHadith.source}</Text>

              <TouchableOpacity
                style={[styles.modalCloseButton, { marginTop: 20 }]}
                onPress={() => setHadithInfoVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Modal>
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
    fontSize: 22,
    fontWeight: '600',
    color: '#ffbf00',
    letterSpacing: 0.5,
  },
  zikirTextGlowing: {
    textShadowColor: '#ca9b0fff',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 9
  },
  zikirBarGoal: {
    fontSize: 14,
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
    marginBottom: 30,
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
    width: '70%',
    height: 60,
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
    fontSize: 42,
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
  mainButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    right: -20,
    top: 0,
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
    width: '90%',
    backgroundColor: '#2c2f34',
    borderRadius: 12,
    padding: 12,
    bottom: 15,
    position: "absolute",
    left: '5%',
  },
  hadithHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    position: 'relative',
  },
  hadithTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffbf00',
    textAlign: 'left',
  },
  hadithArabicImage: {
    height: 30,
    width: 80,
    left:2,
  },
  shareButton: {
    position: 'absolute',
    right: 1,
    borderRadius: 4,
  },
  hadithShareButton: {
    position: 'absolute',
    right: 0,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#ffbf00',
    borderRadius: 6,
  },
  hadithShareButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0b2f1b',
    letterSpacing: 0.5,
  },
  hadithText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#e6e7e9',
    textAlign: 'justify',
    marginBottom: 8,
  },
  hadithSource: {
    fontSize: 11,
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
