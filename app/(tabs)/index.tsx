import { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const DEVICE_WIDTH = width * 0.85;
const DEVICE_HEIGHT = DEVICE_WIDTH * 1.3;
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

          {/* Progress Circle */}
          <View style={styles.progressCircleContainer}>
            <View style={styles.progressCircleBackground}>
              <View 
                style={[
                  styles.progressCircleFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: progress >= 1 ? '#4CAF50' : '#FFD700',
                  }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{progressPercentage}%</Text>
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
                  backgroundColor: progress >= 1 ? '#4CAF50' : '#FFD700',
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
    backgroundColor: '#1E1E1E',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  deviceContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  device: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    backgroundColor: '#000000',
    borderRadius: DEVICE_WIDTH * 0.3,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    // Subtle highlight on top edge
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  displayContainer: {
    width: '85%',
    height: 60,
    backgroundColor: '#00FF00',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
    // LED display effect
    borderWidth: 2,
    borderColor: '#00CC00',
  },
  ledDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003300',
    fontFamily: 'monospace',
    letterSpacing: 2,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#C0C0C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    // Metallic silver effect
    borderWidth: 2,
    borderTopColor: '#E0E0E0',
    borderRightColor: '#E0E0E0',
    borderBottomColor: '#808080',
    borderLeftColor: '#808080',
  },
  mainButtonInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainButtonPattern: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    // Concentric circle pattern
    borderWidth: 2,
    borderColor: '#B0B0B0',
    backgroundColor: 'transparent',
  },
  resetButtonSmall: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C0C0C0',
    borderWidth: 1,
    borderTopColor: '#E0E0E0',
    borderRightColor: '#E0E0E0',
    borderBottomColor: '#808080',
    borderLeftColor: '#808080',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  statsSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  largeCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  dailyGoalText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  progressBarContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#3A3A3A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.9,
  },
  hadithSection: {
    width: '100%',
    backgroundColor: '#3A3A3A',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  hadithTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  hadithText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'justify',
    marginBottom: 12,
  },
  hadithSource: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'right',
    fontStyle: 'italic',
  },
});
