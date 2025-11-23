import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useZikhr } from '@/context/ZikhrContext';

const REMINDERS_STORAGE_KEY = '@zikirmatik/reminders';

type Reminder = {
  id: string;
  zikhrName: string;
  scheduleType: 'daily' | 'relative';
  time?: string; // For daily reminders (HH:mm format)
  offsetValue?: number; // For relative reminders
  offsetUnit?: 'minute' | 'hour' | 'day'; // For relative reminders
  scheduledFor?: string; // ISO date string for when the reminder is scheduled
  message?: string;
  enabled: boolean;
  notificationId?: string; // ID from expo-notifications
  createdAt: string; // ISO date string
};

type PermissionStatus = 'undetermined' | 'granted' | 'denied';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function PermissionStatusComponent({ status }: { status: PermissionStatus }) {
  if (status === 'granted') return null;

  return (
    <View style={[styles.permissionPill, status === 'denied' && styles.permissionPillError]}>
      <MaterialIcons
        name={status === 'denied' ? 'error-outline' : 'info-outline'}
        size={16}
        color="#e6e7e9"
        style={styles.permissionIcon}
      />
      <Text style={styles.permissionText}>
        {status === 'denied'
          ? 'Bildirim izni reddedildi. Ayarlardan izin verin.'
          : 'Bildirimler için izin gerekli.'}
      </Text>
    </View>
  );
}

export default function ReminderScreen() {
  const { zikhrs } = useZikhr();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const remindersRef = useRef<Reminder[]>([]);
  const [scheduleType, setScheduleType] = useState<'daily' | 'relative'>('daily');
  const [timeInput, setTimeInput] = useState('');
  const [offsetValue, setOffsetValue] = useState('');
  const [offsetUnit, setOffsetUnit] = useState<'minute' | 'hour' | 'day'>('hour');
  const [selectedZikhrName, setSelectedZikhrName] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isZikhrModalVisible, setIsZikhrModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('undetermined');
  const [infoMessage, setInfoMessage] = useState<string>('');

  const zikhrNames = useMemo(() => zikhrs.map((z) => z.name), [zikhrs]);

  // Keep ref in sync with state
  useEffect(() => {
    remindersRef.current = reminders;
  }, [reminders]);

  // Load reminders from storage
  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        if (stored) {
          const parsed: Reminder[] = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReminders(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load reminders from storage', error);
      }
    };

    void loadReminders();
  }, []);

  // Check notification permissions
  useEffect(() => {
    const checkPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined');
    };

    void checkPermissions();
  }, []);

  // Save reminders to storage
  const saveReminders = useCallback(async (items: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to save reminders to storage', error);
    }
  }, []);

  // Listen for notifications and auto-remove one-time reminders
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(async (notification) => {
      const reminderId = notification.request.content.data?.reminderId as string | undefined;
      if (!reminderId) return;

      // Find the reminder using the ref to get the latest state
      const reminder = remindersRef.current.find((r) => r.id === reminderId);
      if (!reminder) return;

      // If it's a one-time reminder (relative), delete it after notification is sent
      if (reminder.scheduleType === 'relative') {
        // Cancel notification if exists
        if (reminder.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
        }

        // Remove from state and storage
        const updated = remindersRef.current.filter((r) => r.id !== reminder.id);
        setReminders(updated);
        await saveReminders(updated);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [saveReminders]);

  // Format time string (HH:mm)
  const formatTimeString = (input: string): string => {
    const cleaned = input.replace(/[^0-9]/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  };

  // Format date time for display
  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
    const month = monthNames[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${hours}:${minutes}`;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Format relative label
  const formatRelativeLabel = (value?: number, unit?: 'minute' | 'hour' | 'day'): string => {
    if (!value || !unit) return '';
    if (unit === 'minute') return `${value} dakika sonra`;
    if (unit === 'hour') return `${value} saat sonra`;
    return `${value} gün sonra`;
  };

  // Calculate next scheduled time for daily reminder
  const calculateNextDailyTime = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const scheduled = new Date();
    scheduled.setHours(hours, minutes || 0, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduled <= now) {
      scheduled.setDate(scheduled.getDate() + 1);
    }

    return scheduled;
  };

  // Calculate scheduled time for relative reminder
  const calculateRelativeTime = (value: number, unit: 'minute' | 'hour' | 'day'): Date => {
    const now = new Date();
    const scheduled = new Date(now);
    if (unit === 'minute') {
      scheduled.setMinutes(scheduled.getMinutes() + value);
    } else if (unit === 'hour') {
      scheduled.setHours(scheduled.getHours() + value);
    } else {
      scheduled.setDate(scheduled.getDate() + value);
    }
    return scheduled;
  };

  // Schedule notification
  const scheduleNotification = async (reminder: Reminder): Promise<string | null> => {
    try {
      let trigger: Notifications.NotificationTriggerInput | null = null;
      let scheduledTime: Date;

      if (reminder.scheduleType === 'daily') {
        if (!reminder.time) return null;
        scheduledTime = calculateNextDailyTime(reminder.time);
        const [hours, minutes] = reminder.time.split(':').map(Number);
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
          hour: hours,
          minute: minutes || 0,
          repeats: true,
        };
      } else {
        if (!reminder.offsetValue || !reminder.offsetUnit) return null;
        scheduledTime = calculateRelativeTime(reminder.offsetValue, reminder.offsetUnit);
        trigger = {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.zikhrName,
          body: reminder.message || 'Zikir zamanı geldi!',
          sound: true,
          data: { reminderId: reminder.id },
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.warn('Failed to schedule notification', error);
      return null;
    }
  };

  // Add reminder
  const addReminder = async () => {
    if (!selectedZikhrName) {
      setInfoMessage('Lütfen bir zikir seçin.');
      return;
    }

    if (scheduleType === 'daily') {
      if (!timeInput || !timeInput.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
        setInfoMessage('Lütfen geçerli bir saat girin (örn: 08:00).');
        return;
      }
    } else {
      const offsetNum = parseInt(offsetValue, 10);
      if (!offsetValue || isNaN(offsetNum) || offsetNum <= 0) {
        setInfoMessage('Lütfen geçerli bir süre girin.');
        return;
      }
    }

    // Request permissions if needed
    if (permissionStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        setPermissionStatus('denied');
        setInfoMessage('Bildirim izni gerekli.');
        return;
      }
      setPermissionStatus('granted');
    }

    setIsSubmitting(true);
    setInfoMessage('');

    try {
      const newReminder: Reminder = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        zikhrName: selectedZikhrName,
        scheduleType,
        time: scheduleType === 'daily' ? timeInput : undefined,
        offsetValue: scheduleType === 'relative' ? parseInt(offsetValue, 10) : undefined,
        offsetUnit: scheduleType === 'relative' ? offsetUnit : undefined,
        message: customMessage.trim() || undefined,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      // Calculate scheduledFor
      if (scheduleType === 'daily') {
        newReminder.scheduledFor = calculateNextDailyTime(timeInput).toISOString();
      } else {
        newReminder.scheduledFor = calculateRelativeTime(
          parseInt(offsetValue, 10),
          offsetUnit,
        ).toISOString();
      }

      // Schedule notification
      const notificationId = await scheduleNotification(newReminder);
      if (notificationId) {
        newReminder.notificationId = notificationId;
      }

      const updated = [...reminders, newReminder];
      setReminders(updated);
      await saveReminders(updated);

      // Reset form
      setSelectedZikhrName('');
      setTimeInput('');
      setOffsetValue('');
      setCustomMessage('');
      setScheduleType('daily');
      setInfoMessage('Hatırlatıcı başarıyla oluşturuldu!');
    } catch (error) {
      console.warn('Failed to add reminder', error);
      setInfoMessage('Hatırlatıcı oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete reminder
  const deleteReminder = async (reminder: Reminder) => {
    try {
      // Cancel notification if exists
      if (reminder.notificationId) {
        await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
      }

      const updated = reminders.filter((r) => r.id !== reminder.id);
      setReminders(updated);
      await saveReminders(updated);
    } catch (error) {
      console.warn('Failed to delete reminder', error);
    }
  };

  // Toggle reminder
  const toggleReminder = async (reminder: Reminder, enabled: boolean) => {
    try {
      const updated = reminders.map((r) => {
        if (r.id === reminder.id) {
          const updatedReminder = { ...r, enabled };
          if (enabled) {
            // Reschedule notification
            scheduleNotification(updatedReminder).then((notificationId) => {
              if (notificationId) {
                const finalUpdated = reminders.map((rem) =>
                  rem.id === reminder.id ? { ...rem, enabled, notificationId } : rem,
                );
                setReminders(finalUpdated);
                void saveReminders(finalUpdated);
              }
            });
          } else {
            // Cancel notification
            if (r.notificationId) {
              Notifications.cancelScheduledNotificationAsync(r.notificationId);
            }
            updatedReminder.notificationId = undefined;
          }
          return updatedReminder;
        }
        return r;
      });

      setReminders(updated);
      await saveReminders(updated);
    } catch (error) {
      console.warn('Failed to toggle reminder', error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yeni Hatırlatıcı</Text>
        <Text style={styles.cardSubtitle}>Günlük bildirim alacağınız zikri ve zamanı seçin.</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hatırlatma Tipi</Text>
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[styles.modeButton, scheduleType === 'daily' && styles.modeButtonActive]}
              onPress={() => setScheduleType('daily')}
            >
              <Text style={[styles.modeButtonText, scheduleType === 'daily' && styles.modeButtonTextActive]}>
                Düzenli Hatırlatıcı
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, scheduleType === 'relative' && styles.modeButtonActive]}
              onPress={() => setScheduleType('relative')}
            >
              <Text style={[styles.modeButtonText, scheduleType === 'relative' && styles.modeButtonTextActive]}>
                Tek Seferlik Hatırlatıcı
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Zikir Seç</Text>
          <TouchableOpacity
            style={styles.zikhrSelector}
            onPress={() => setIsZikhrModalVisible(true)}
            activeOpacity={0.85}
            disabled={!zikhrNames.length}
          >
            <Text style={styles.zikhrSelectorText}>
              {selectedZikhrName || (zikhrNames.length ? 'Zikir seç' : 'Önce bir zikir oluşturmalısınız')}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={22}
              color="#e6e7e9"
            />
          </TouchableOpacity>
        </View>

        {scheduleType === 'daily' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Saat</Text>
            <TextInput
              style={styles.input}
              placeholder="08:00"
              placeholderTextColor="#6f737a"
              keyboardType="numbers-and-punctuation"
              value={timeInput}
              onChangeText={setTimeInput}
              onBlur={() => setTimeInput((prev) => formatTimeString(prev))}
              maxLength={5}
            />
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Ne kadar süre sonra?</Text>
            <View style={styles.relativeRow}>
              <TextInput
                style={[styles.input, styles.relativeInput]}
                placeholder="1"
                placeholderTextColor="#6f737a"
                keyboardType="numeric"
                value={offsetValue}
                onChangeText={(text) => setOffsetValue(text.replace(/[^0-9]/g, '').slice(0, 3))}
              />
              <View style={styles.unitToggle}>
                <TouchableOpacity
                  style={[styles.unitButton, offsetUnit === 'minute' && styles.unitButtonActive]}
                  onPress={() => setOffsetUnit('minute')}
                >
                  <Text style={[styles.unitButtonText, offsetUnit === 'minute' && styles.unitButtonTextActive]}>Dakika</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitButton, offsetUnit === 'hour' && styles.unitButtonActive]}
                  onPress={() => setOffsetUnit('hour')}
                >
                  <Text style={[styles.unitButtonText, offsetUnit === 'hour' && styles.unitButtonTextActive]}>Saat</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.unitButton, offsetUnit === 'day' && styles.unitButtonActive]}
                  onPress={() => setOffsetUnit('day')}
                >
                  <Text style={[styles.unitButtonText, offsetUnit === 'day' && styles.unitButtonTextActive]}>Gün</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.helperText}>
              Hatırlatma {offsetValue || '1'}{' '}
              {offsetUnit === 'minute' ? 'dakika' : offsetUnit === 'hour' ? 'saat' : 'gün'} sonra sadece bir kez gönderilir.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Not (Opsiyonel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Kısa bir hatırlatma mesajı yazabilirsiniz."
            placeholderTextColor="#6f737a"
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            maxLength={100}
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={addReminder}
          activeOpacity={0.85}
          disabled={isSubmitting || !zikhrNames.length}
        >
          <Text style={styles.primaryButtonText}>
            {isSubmitting ? 'Kaydediliyor…' : 'Hatırlatıcı Oluştur'}
          </Text>
        </TouchableOpacity>

        <PermissionStatusComponent status={permissionStatus} />
        {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Aktif Hatırlatıcılar</Text>
        <Text style={styles.listCount}>{reminders.length}</Text>
      </View>

      {reminders.length === 0 ? (
        <View style={[styles.card, styles.emptyState]}>
          <MaterialIcons name="alarm-off" size={32} color="#6f737a" />
          <Text style={styles.emptyTitle}>Henüz hatırlatıcı yok</Text>
          <Text style={styles.emptyDescription}>Zikirlerinizi unutmamak için yukarıdan yeni bir hatırlatıcı ekleyin.</Text>
        </View>
      ) : (
        reminders.map((reminder) => (
          <View key={reminder.id} style={[styles.card, styles.reminderCard]}>
            <View style={styles.reminderHeader}>
              <View>
                <Text style={styles.reminderTime}>
                  {reminder.scheduleType === 'daily' ? reminder.time : formatDateTime(reminder.scheduledFor)}
                </Text>
                <Text style={styles.reminderTitle}>{reminder.zikhrName}</Text>
              </View>
              <Switch
                value={reminder.enabled}
                onValueChange={(value) => void toggleReminder(reminder, value)}
                trackColor={{ false: '#3a3d42', true: '#03c459' }}
                thumbColor={reminder.enabled ? '#e6e7e9' : '#f4f3f4'}
              />
            </View>
            {reminder.message ? <Text style={styles.reminderMessage}>{reminder.message}</Text> : null}
            <View style={styles.reminderFooter}>
              <View style={styles.reminderMetaContainer}>
                <Text style={styles.reminderMeta}>
                  {reminder.scheduleType === 'daily'
                    ? `Günlük tekrar${reminder.scheduledFor ? ` | Sonraki: ${formatDateTime(reminder.scheduledFor)}` : ''}`
                    : `Tek seferlik | ${formatRelativeLabel(reminder.offsetValue, reminder.offsetUnit)}`}
                  {'  '}| Oluşturulduğu Tarih: {formatDate(reminder.createdAt)}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => void deleteReminder(reminder)} 
                hitSlop={10}
              >
                <MaterialIcons name="delete-forever" size={24} color="#ff6b6b" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
      <Modal
        visible={isZikhrModalVisible}
        onRequestClose={() => setIsZikhrModalVisible(false)}
        animationType="slide"
        transparent
      >
        <View style={styles.modalWrapper}>
          <Pressable style={styles.modalBackdrop} onPress={() => setIsZikhrModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zikir seç</Text>
              <TouchableOpacity onPress={() => setIsZikhrModalVisible(false)} hitSlop={10}>
                <MaterialIcons name="close" size={22} color="#e6e7e9" />
              </TouchableOpacity>
            </View>
            {zikhrNames.length ? (
              <ScrollView style={styles.modalList} contentContainerStyle={styles.modalListContent}>
                {zikhrNames.map((name) => {
                  const isActive = selectedZikhrName === name;
                  return (
                    <TouchableOpacity
                      key={name}
                      style={[styles.modalItem, isActive && styles.modalItemActive]}
                      onPress={() => {
                        setSelectedZikhrName(name);
                        setIsZikhrModalVisible(false);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.modalItemText, isActive && styles.modalItemTextActive]}>{name}</Text>
                      {isActive ? <MaterialIcons name="check" size={18} color="#0b2f1b" /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.modalEmpty}>
                <MaterialIcons name="playlist-remove" size={28} color="#a7acb5" />
                <Text style={styles.modalEmptyText}>Önce bir zikir oluşturmalısınız.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f2025',
  },
  content: {
    padding: 18,
    paddingBottom: 26,
    paddingTop: 45,
  },
  card: {
    backgroundColor: '#2c2f34',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e6e7e9',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#a7acb5',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#a7acb5',
    marginBottom: 8,
  },
  zikhrPill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3d42',
    marginRight: 8,
  },
  zikhrPillActive: {
    backgroundColor: '#ffbf00',
    borderColor: '#03c459',
  },
  zikhrPillText: {
    color: '#e6e7e9',
    fontSize: 13,
  },
  zikhrPillTextActive: {
    color: '#0b2f1b',
    fontWeight: '600',
  },
  zikhrSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2025',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3a3d42',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  zikhrSelectorText: {
    color: '#e6e7e9',
    fontSize: 14,
  },
  zikhrPicker: {
    marginTop: 4,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1f2025',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#ffbf00',
  },
  modeButtonText: {
    color: '#a7acb5',
    fontSize: 13,
    fontWeight: '500',
  },
  modeButtonTextActive: {
    color: '#0b2f1b',
  },
  emptyHint: {
    color: '#a7acb5',
    fontSize: 12,
    paddingVertical: 8,
  },
  input: {
    backgroundColor: '#1f2025',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#e6e7e9',
    borderWidth: 1,
    borderColor: '#3a3d42',
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  relativeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relativeInput: {
    flex: 1,
  },
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: '#1f2025',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#3a3d42',
    marginLeft: 12,
  },
  unitButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  unitButtonActive: {
    backgroundColor: '#ffbf00',
  },
  unitButtonText: {
    color: '#a7acb5',
    fontSize: 13,
  },
  unitButtonTextActive: {
    color: '#0b2f1b',
    fontWeight: '600',
  },
  helperText: {
    color: '#a7acb5',
    fontSize: 12,
    marginTop: 6,
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  modalSheet: {
    backgroundColor: '#2c2f34',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: '#3a3d42',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#e6e7e9',
    fontSize: 16,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 320,
  },
  modalListContent: {
    paddingBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3d42',
    marginBottom: 10,
  },
  modalItemActive: {
    backgroundColor: '#ffbf00',
  },
  modalItemText: {
    color: '#e6e7e9',
    fontSize: 14,
  },
  modalItemTextActive: {
    color: '#0b2f1b',
    fontWeight: '600',
  },
  modalEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  modalEmptyText: {
    color: '#a7acb5',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#03c459',
    borderRadius: 12,
    marginTop: 20,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#0b2f1b',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  infoText: {
    marginTop: 12,
    fontSize: 12,
    color: '#a7acb5',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  listTitle: {
    color: '#e6e7e9',
    fontSize: 16,
    fontWeight: '600',
  },
  listCount: {
    color: '#a7acb5',
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    color: '#e6e7e9',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyDescription: {
    color: '#a7acb5',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  reminderCard: {
    paddingBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderTime: {
    fontSize: 20,
    color: '#e6e7e9',
    fontWeight: '700',
  },
  reminderTitle: {
    fontSize: 13,
    color: '#a7acb5',
    marginTop: 4,
  },
  reminderMessage: {
    fontSize: 13,
    color: '#e6e7e9',
    marginTop: 10,
  },
  reminderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  reminderMetaContainer: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  reminderMeta: {
    fontSize: 11,
    color: '#a7acb5',
  },
  deleteButton: {
    flexShrink: 0,
  },
  permissionText: {
    color: '#e6e7e9',
    fontSize: 12,
  },
  permissionIcon: {
    marginRight: 6,
  },
  permissionPill: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3d42',
  },
  permissionPillError: {
    backgroundColor: '#5c2b2b',
  },
});
