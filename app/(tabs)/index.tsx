import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DEVICE_WIDTH = width * 0.6;
const DEVICE_HEIGHT = DEVICE_WIDTH * 1.0;
const DAILY_TARGET = 10000;

export default function HomeScreen() {
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(DAILY_TARGET);

  const progress = Math.min(count / target, 1);
  const progressPercentage = Math.round(progress * 100);

  const increment = () => {
    setCount((prev) => prev + 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const reset = () => {
    setCount(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  // Sample hadith - in a real app, this would come from an API or database
  const dailyHadith = {
    text: 'Kim bir Müslüman ayıbı örterse. Allah da dünya ve ahirette onu aynısını örter.',
    source: 'Hadis-i Şerif',
  };

  // Format count with leading zeros (like LED display)
  const formatCount = (num: number) => {
    return String(num).padStart(5, '0');
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Physical Zikirmatik Device */}
      <View style={styles.deviceContainer}>
        <View style={styles.device}>
          {/* Green LED Display */}
          <View style={styles.displayContainer}>
            <Text style={styles.ledDisplay}>{formatCount(count)}</Text>
          </View>


          {/* Main Counting Button (Large Center Button) */}
          <TouchableOpacity 
            style={styles.mainButton}
            onPress={increment}
            activeOpacity={0.8}
          >
            <View style={styles.mainButtonInner}>
              <View style={styles.mainButtonPattern} />
            </View>
          </TouchableOpacity>

          {/* Reset Button (Small Side Button) */}
          <TouchableOpacity 
            style={styles.resetButtonSmall}
            onPress={reset}
            activeOpacity={0.7}
          />
        </View>
      </View>

      {/* Current Count and Daily Goal */}
      <View style={styles.statsSection}>
        <Text style={styles.largeCount}>{count.toLocaleString()}</Text>
        <Text style={styles.dailyGoalText}>Daily Goal: {target.toLocaleString()}</Text>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: '#e8ca8e',
                }
              ]}
            />
          </View>
          <Text style={styles.progressBarLabel}>ZİKİRLERİM</Text>
        </View>
      </View>

      {/* Daily Hadith Section */}
      <View style={styles.hadithSection}>
        <Text style={styles.hadithTitle}>Günün Hadisi</Text>
        <Text style={styles.hadithText}>{dailyHadith.text}</Text>
        <Text style={styles.hadithSource}>— {dailyHadith.source}</Text>
      </View>
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
    marginBottom: 15,
    paddingHorizontal: 8,
    // LED display effect
    borderWidth: 1.5,
    borderColor: '#003300',
  },
  ledDisplay: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003300',
    fontFamily: 'DS-Digital',
    letterSpacing: 1.5,
  },
  progressCircleContainer: {
    width: 120,
    height: 120,
    marginBottom: 30,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#3A3A3A',
    overflow: 'hidden',
  },
  progressCircleFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 60,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 1,
  },
  mainButton: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#c7c7c7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    marginTop: 60,
  },
  mainButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#c7c7c7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainButtonPattern: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
    // Concentric circle pattern
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
});
