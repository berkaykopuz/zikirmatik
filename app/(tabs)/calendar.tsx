import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

// constants/specialDays.ts

export interface SpecialDay {
  title: string;
  description: string;
  advice: string; // O güne özel tavsiye ve yapılacaklar
  dhikr?: string; // O gün için önerilen kısa zikir veya dua
}

export const SPECIAL_DAYS: Record<string, SpecialDay> = {
  '2026-01-15': {
    title: 'Miraç Kandili',
    description: 'Peygamber Efendimizin göğe yükseliş mucizesinin yıl dönümü.',
    advice: 'Bu gece bolca kaza namazı kılınmalı, Kur\'an-ı Kerim okunmalı ve geçmiş günahlar için tövbe edilmelidir. Peygamberimize (s.a.v.) bolca salavat getirmek çok faziletlidir.',
    dhikr: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed',
  },
  '2026-02-02': {
    title: 'Berat Kandili',
    description: 'Ramazan ayının habercisi, kurtuluş ve bağışlanma gecesi.',
    advice: 'Bu gece "Beraat" (kurtuluş) gecesidir. Yüce Allah\'tan af dilenmeli, dargınlar barışmalı. Peygamberimiz bu gece "Allah\'ım! Azabından affına, gazabından rızana sığınırım" diye dua ederdi.',
    dhikr: 'Estağfirullah el-Azîm ve etûbü ileyh',
  },
  '2026-02-19': {
    title: 'Ramazan Başlangıcı',
    description: 'On bir ayın sultanı Ramazan ayının ilk günü.',
    advice: 'Oruç ibadetine halis bir niyetle başlanmalı. Teravih namazlarına özen gösterilmeli ve her gün en azından bir miktar Kur\'an (mukabele) okunmalıdır.',
    dhikr: 'Allahümme leke sumtü ve bike âmentü',
  },
  '2026-03-16': {
    title: 'Kadir Gecesi',
    description: 'Kur\'an-ı Kerim\'in indirilmeye başlandığı, bin aydan hayırlı gece.',
    advice: 'Bu gece sabaha kadar ibadetle değerlendirilmelidir. Peygamber Efendimizin Hz. Aişe validemize öğrettiği şu dua çokça okunmalıdır: "Allah\'ım! Sen affedicisin, affı seversin, beni affet."',
    dhikr: 'Allahümme inneke afüvvün tuhibbül afve fa\'fu annî',
  },
  '2026-03-19': {
    title: 'Arefe (Ramazan)',
    description: 'Ramazan Bayramı öncesi Arefe günü.',
    advice: 'Bin İhlas-ı Şerif okumak bugünün önemli adetlerindendir. Kabir ziyaretleri yapılmalı, ölmüşlerimizin ruhuna Fatiha okunmalıdır.',
    dhikr: 'İhlas Suresi (1000 defa tavsiye edilir)',
  },
  '2026-03-20': {
    title: 'Ramazan Bayramı (1. Gün)',
    description: 'Ramazan Bayramının 1. Günü. Sevdiklerinizle bayramlaşmayı unutmayın.',
    advice: 'Sabah bayram namazı kılınmalı. Anne-baba ve akrabalar ziyaret edilmeli, çocuklara hediyeler verilerek sevindirilmelidir. Küsler barışmalıdır.',
    dhikr: 'Allahü Ekber Allahü Ekber Lâ ilâhe illallahu vallahu ekber',
  },
  '2026-03-21': {
    title: 'Ramazan Bayramı (2. Gün)',
    description: 'Ramazan Bayramının 2. Günü.',
    advice: 'Sıla-i rahim (akraba ziyareti) ibadetine devam edilmeli. Hasta ve yaşlılar ziyaret edilerek hayır duaları alınmalıdır.',
    dhikr: 'Sübhanallahi ve bihamdihi',
  },
  '2026-03-22': {
    title: 'Ramazan Bayramı (3. Gün)',
    description: 'Ramazan Bayramının 3. ve son günü.',
    advice: 'Bayramın son gününde de tebessüm sadakasını eksik etmeyin. Fakir ve muhtaçlara yardım elini uzatmaya devam edin.',
    dhikr: 'Elhamdülillah',
  },
  '2026-05-26': {
    title: 'Arefe (Kurban)',
    description: 'Kurban Bayramı öncesi Arefe günü.',
    advice: 'Sabah namazından itibaren "Teşrik Tekbirleri"ne (Allâhü ekber, Allâhü ekber, Lâ ilâhe illallâhü vallâhü ekber...) başlanmalı ve bayramın 4. günü ikindi namazına kadar her farz namazdan sonra getirilmelidir.',
    dhikr: 'Allâhü ekber, Allâhü ekber, Lâ ilâhe illallâhü vallâhü ekber',
  },
  '2026-05-27': {
    title: 'Kurban Bayramı (1. Gün)',
    description: 'Kurban Bayramının 1. Günü.',
    advice: 'Kurban ibadeti yerine getirilmeli. Kurban eti fakirlerle, komşularla ve ev halkıyla paylaşılmalı. Teşrik tekbirleri unutulmamalıdır.',
    dhikr: 'Teşrik Tekbirleri (Farz namazları sonrası)',
  },
  '2026-05-28': {
    title: 'Kurban Bayramı (2. Gün)',
    description: 'Kurban Bayramının 2. Günü.',
    advice: 'Kurban kesimi devam edebilir. Akraba ziyaretleri yapılmalı ve Allah\'a şükür edilmelidir. Teşrik tekbirlerine devam edilmelidir.',
    dhikr: 'Elhamdülillah alâ külli hâl',
  },
  '2026-05-29': {
    title: 'Kurban Bayramı (3. Gün)',
    description: 'Kurban Bayramının 3. Günü.',
    advice: 'Bayram coşkusu paylaşarak çoğaltılmalı. Bugün de kurban kesilebilir. Teşrik tekbirlerine her farz namazı sonrası devam edilmelidir.',
    dhikr: 'Sübhanallah',
  },
  '2026-05-30': {
    title: 'Kurban Bayramı (4. Gün)',
    description: 'Kurban Bayramının 4. ve son günü.',
    advice: 'İkindi namazı ile birlikte Teşrik tekbirleri sona erer. Bayramın manevi atmosferini günlük hayata taşımaya niyet edilmelidir.',
    dhikr: 'Lâ havle velâ kuvvete illâ billâh',
  },
  '2026-06-16': {
    title: 'Hicri Yılbaşı',
    description: 'Hicri 1448 yılının başlangıcı (1 Muharrem).',
    advice: 'Yeni Hicri yılın hayırlara vesile olması için dua edilmeli. Geçen yılın muhasebesi yapılmalı. Muharrem ayı Allah\'ın ayı olarak bilinir, bu ayda oruç tutmak çok faziletlidir.',
    dhikr: 'Hasbünallâhu ve ni\'mel vekîl',
  },
  '2026-06-25': {
    title: 'Aşure Günü',
    description: 'Muharrem ayının 10. günü, bereket ve paylaşma günü.',
    advice: 'Bugün oruç tutmak sünnettir (bir önceki veya bir sonraki günle birleştirerek). Evde aşure pişirip dağıtmak, sadaka vermek bereket vesilesidir.',
    dhikr: 'Sübhanallahi mil\'el mizan ve müntehe\'l-ilm',
  },
  '2026-08-24': {
    title: 'Mevlid Kandili',
    description: 'Peygamber Efendimizin dünyayı şereflendirdiği veladet gecesi.',
    advice: 'Peygamber Efendimizin (s.a.v.) hayatı ve güzel ahlakı üzerine tefekkür edilmeli, O\'nu anlamaya çalışmalı. Bol bol Salavat-ı Şerife getirilmelidir.',
    dhikr: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âlihî ve sahbihî ve sellim',
  },
  '2026-12-10': {
    title: 'Üç Ayların Başlangıcı ve Regaib Kandili',
    description: 'Mübarek üç ayların başlangıcı ve Regaib gecesi.',
    advice: 'Recep ayının ilk cuma gecesidir. Allah\'a rağbet etme, O\'na yönelme gecesidir. Peygamberimizin duası okunur: "Allahım! Recep ve Şaban\'ı bize mübarek kıl ve bizi Ramazan\'a ulaştır."',
    dhikr: 'Allahümme bârik lenâ fî Recebe ve Şa\'bân ve belliğnâ Ramadân',
  },
};

const SPECIAL_DAYS_NOTIFICATIONS_KEY = '@zikirmatik/specialDaysNotifications';
const ANDROID_CHANNEL_ID = 'zikirmatik-special-days';
const ANDROID_NOTIFICATION_SOUND = 'notification'; // matches app.json > expo-notifications.sounds

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
            // Use the same custom notification sound as reminders
            sound: ANDROID_NOTIFICATION_SOUND,
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
                    // Use custom sound on Android, default system sound elsewhere
                    sound: Platform.OS === 'android' ? ANDROID_NOTIFICATION_SOUND : 'default',
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

  const getDayContent = (date: string): SpecialDay => {
    // 1. Check Hardcoded Special Days
    if (SPECIAL_DAYS[date]) {
      return SPECIAL_DAYS[date];
    }
    
    // 2. Check Friday
    if (isFriday(date)) {
      return {
        title: 'Hayırlı Cumalar',
        description: 'Cuma günü müminlerin bayramıdır.',
        advice:
          'Bugünü özellikle Cuma namazı, bol salavat, Kehf Suresi okumak ve dua ile değerlendirmeye niyet edebilirsin.',
        dhikr: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed',
      };
    }

    // 3. Default
    return {
      title: 'Günlük Zikir',
      description: 'Bugün için özel bir dini gün bulunmuyor.',
      advice:
        'Gününe besmele ile başla, kısa aralıklarla zikir çek ve bugün en az bir iyilik yapmaya niyet et.',
      dhikr: 'Subhanallah, Elhamdülillah, Allahu Ekber (her biri 33 defa)',
    };
  };

  const activeContent = getDayContent(selectedDate);

  const handleShare = async () => {
    try {
      const dateStr = new Date(selectedDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const parts: string[] = [
        dateStr,
        '',
        activeContent.title,
        '',
        activeContent.description,
      ];

      if (activeContent.advice) {
        parts.push('', `Tavsiye: ${activeContent.advice}`);
      }

      if (activeContent.dhikr) {
        parts.push('', `Zikir Önerisi: ${activeContent.dhikr}`);
      }

      const shareMessage = parts.join('\n');
      
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
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#ffbf00' }]}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>Paylaş</Text>
          </TouchableOpacity>
          <View
            style={[
              styles.indicator,
              {
                backgroundColor:
                  SPECIAL_DAYS[selectedDate] || isFriday(selectedDate)
                    ? '#2ecc71'
                    : theme.icon,
              },
            ]}
          />
        </View>

        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={styles.cardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {activeContent.title}
          </Text>
          
          <Text style={[styles.cardDescription, { color: theme.text }]}>
            {activeContent.description}
          </Text>

          {activeContent.advice ? (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: theme.icon }]}>TAVSİYE</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>{activeContent.advice}</Text>
            </View>
          ) : null}

          {activeContent.dhikr ? (
            <View style={styles.infoSection}>
              <Text style={[styles.infoLabel, { color: theme.icon }]}>ÖNERİLEN ZİKİR</Text>
              <Text style={[styles.infoText, { color: theme.text }]}>{activeContent.dhikr}</Text>
            </View>
          ) : null}
        </ScrollView>
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
    padding: 0,
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
  cardScroll: {
    flex: 1,
  },
  cardScrollContent: {
    paddingBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
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
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 16,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  actionButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 14,
  }
});