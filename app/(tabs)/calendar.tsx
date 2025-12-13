import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, DateData, LocaleConfig } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
/*import { LinearGradient } from 'expo-linear-gradient'; // Optional: for nicer card backgrounds if installed, otherwise View is fine.*/

// Configure Turkish Locale
LocaleConfig.locales['tr'] = {
  monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

// Mock Data for Special Days (In a real app, calculate this or fetch from API)
const SPECIAL_DAYS: Record<string, { title: string; description: string }> = {
  '2025-03-29': { title: 'Ramazan Bayramı', description: 'Ramazan Bayramının 1. Günü. Sevdiklerinizle bayramlaşmayı unutmayın.' },
  '2025-06-06': { title: 'Kurban Bayramı', description: 'Kurban Bayramı Arefesi.' },
};

const SPECIAL_DAYS_NOTIFICATIONS_KEY = '@zikirmatik/specialDaysNotifications';
const ANDROID_CHANNEL_ID = 'zikirmatik-special-days';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Helper to check for Fridays (Weekly special day)
const isFriday = (dateString: string) => {
  const date = new Date(dateString);
  return date.getDay() === 5; // 0 is Sunday, 5 is Friday
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Configure Android notification channel and schedule special day notifications
  useEffect(() => {
    const setupSpecialDayNotifications = async () => {
      try {
        // Configure Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
            name: 'Özel Günler',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#03c459',
            lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
            sound: 'default',
          });
        }

        // Check permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Notification permissions not granted');
          return;
        }

        // Load previously scheduled notification IDs (stored as array of IDs per date)
        const storedIds = await AsyncStorage.getItem(SPECIAL_DAYS_NOTIFICATIONS_KEY);
        const scheduledIds: Record<string, string[]> = storedIds ? JSON.parse(storedIds) : {};

        const now = new Date();
        const today = now.toISOString().split('T')[0];

        // Schedule notifications for each special day
        for (const [dateString, dayInfo] of Object.entries(SPECIAL_DAYS)) {
          // Only schedule if the date is in the future
          if (dateString >= today) {
            // Check if already scheduled
            if (scheduledIds[dateString] && scheduledIds[dateString].length === 2) {
              // Verify both notifications still exist
              try {
                const notifications = await Notifications.getAllScheduledNotificationsAsync();
                const existingIds = scheduledIds[dateString].filter((id: string) =>
                  notifications.some((n: Notifications.NotificationRequest) => n.identifier === id)
                );
                if (existingIds.length < 2) {
                  // Some notifications are missing, reschedule
                  delete scheduledIds[dateString];
                }
              } catch (error) {
                console.warn('Error checking notification:', error);
              }
            }

            // Schedule if not already scheduled (need 2 notifications)
            if (!scheduledIds[dateString] || scheduledIds[dateString].length < 2) {
              const notificationIds: string[] = [];

              // First notification at 8:00 AM
              const morningDate = new Date(dateString);
              morningDate.setHours(13, 0, 0, 0);

              // Second notification at 8:00 PM
              const eveningDate = new Date(dateString);
              eveningDate.setHours(20, 0, 0, 0);

              const notificationTimes = [
                { date: morningDate, label: 'morning' },
                { date: eveningDate, label: 'evening' }
              ];

              for (const { date: notificationDate } of notificationTimes) {
                // Only schedule if the date is in the future
                if (notificationDate > now) {
                  const notificationContent: any = {
                    title: dayInfo.title,
                    body: `${dayInfo.title} Kutlu Olsun. Zikrini çekmeyi unutma!`,
                    sound: true,
                    data: { 
                      type: 'specialDay',
                      date: dateString 
                    },
                  };
                  
                  if (Platform.OS === 'android') {
                    notificationContent.channelId = ANDROID_CHANNEL_ID;
                  }

                  const notificationId = await Notifications.scheduleNotificationAsync({
                    content: notificationContent,
                    trigger: {
                      type: Notifications.SchedulableTriggerInputTypes.DATE,
                      date: notificationDate,
                    },
                  });

                  notificationIds.push(notificationId);
                }
              }

              if (notificationIds.length > 0) {
                scheduledIds[dateString] = notificationIds;
                await AsyncStorage.setItem(SPECIAL_DAYS_NOTIFICATIONS_KEY, JSON.stringify(scheduledIds));
              }
            }
          }
        }

        // Clean up past notifications
        const cleanedIds: Record<string, string[]> = {};
        for (const [dateString, notificationIds] of Object.entries(scheduledIds)) {
          if (dateString >= today) {
            cleanedIds[dateString] = notificationIds;
          } else {
            // Cancel past notifications
            for (const notificationId of notificationIds) {
              try {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
              } catch (error) {
                console.warn('Error canceling past notification:', error);
              }
            }
          }
        }
        await AsyncStorage.setItem(SPECIAL_DAYS_NOTIFICATIONS_KEY, JSON.stringify(cleanedIds));

      } catch (error) {
        console.warn('Error setting up special day notifications:', error);
      }
    };

    void setupSpecialDayNotifications();
  }, []);

  // Generate Marked Dates
  const markedDates = useMemo(() => {
    const marks: any = {};
    const today = new Date().toISOString().split('T')[0];

    // Mark Today with green color (application style)
    marks[today] = { 
      selected: true, 
      selectedColor: '#098441', // Application green color
      marked: true 
    }; 

    // Mark Selected Day (Overrides today if different)
    if (selectedDate && selectedDate !== today) {
      marks[selectedDate] = { 
        ...marks[selectedDate], 
        selected: true, 
        selectedColor: colorScheme === 'dark' ? '#58d5ba' : '#4ab39cff', // Better contrast blue for selection
        disableTouchEvent: true 
      };
    }

    // Mark Special Days (Gold color for registered special days, but not if it's today)
    Object.keys(SPECIAL_DAYS).forEach(date => {
      if (date !== today) {
        marks[date] = {
          ...marks[date],
          customStyles: {
            container: {
              backgroundColor: '#ffbf00', // Gold color for special registered days
              borderRadius: 20,
              elevation: 2
            },
            text: {
              color: 'white',
              fontWeight: 'bold'
            }
          }
        };
      }
    });

    // Mark Fridays dynamically if not already special
    // Note: iterating a whole year is expensive, usually we just mark the current month views
    // For this example, we assume we just check logic on render for the card.
    
    return marks;
  }, [selectedDate, theme]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const getDayContent = (date: string) => {
    // 1. Check Hardcoded Special Days
    if (SPECIAL_DAYS[date]) {
      return SPECIAL_DAYS[date];
    }
    
    // 2. Check Friday
    if (isFriday(date)) {
      return {
        title: 'Hayırlı Cumalar',
        description: 'Cuma günü müminlerin bayramıdır. Kehf suresini okumayı unutmayın.'
      };
    }

    // 3. Default
    return {
      title: 'Günlük Zikir',
      description: 'Bugün için özel bir dini gün bulunmuyor. Günlük zikir hedefinizi tamamladınız mı?'
    };
  };

  const activeContent = getDayContent(selectedDate);

  const handleShare = async () => {
    try {
      const dateStr = new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
      const shareMessage = `${dateStr}\n\n${activeContent.title}\n\n${activeContent.description}`;
      
      await Share.share({
        message: shareMessage,
        title: activeContent.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      
      {/* Calendar Section */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={onDayPress}
          markingType={'custom'}
          markedDates={markedDates}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: colorScheme === 'dark' ? '#4a90e2' : '#0a7ea4', // Better contrast blue
            selectedDayTextColor: '#ffffff', // White text for better readability
            todayTextColor: '#098441', // Green color for today text
            dayTextColor: theme.text,
            textDisabledColor: colorScheme === 'dark' ? '#4a4d52' : '#c0c4c8', // Gray color for days from other months
            arrowColor: theme.tint,
            monthTextColor: theme.text,
            indicatorColor: theme.tint,
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
          hideExtraDays={false}
          enableSwipeMonths={true}
        />
      </View>

      {/* Info Card Section */}
      <View style={[styles.cardContainer, { backgroundColor: colorScheme === 'dark' ? '#2c2f34' : '#f0f4f8' }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardDate, { color: theme.icon }]}>
            {new Date(selectedDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
          <View style={[styles.indicator, { backgroundColor: SPECIAL_DAYS[selectedDate] || isFriday(selectedDate) ? '#2ecc71' : theme.icon }]} />
        </View>

        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {activeContent.title}
        </Text>
        
        <Text style={[styles.cardDescription, { color: theme.text }]}>
          {activeContent.description}
        </Text>

        {/* Share Button */}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#ffbf00' }]}
          onPress={handleShare}
          activeOpacity={0.8}
        >
           <Text style={styles.actionButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1.5, // Takes up more space at the top
    padding: 10,
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1, // Takes up the bottom portion
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: '#3a3d42',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardDate: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.8,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 'auto', // Pushes button to bottom of card
    marginBottom: 20,
    color: '#ffbf00',
  },
  actionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 16,
  }
});