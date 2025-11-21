import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useZikhr } from '@/context/ZikhrContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: false,
  }),
});

type ReminderScheduleType = 'daily' | 'relative';
type ReminderOffsetUnit = 'hour' | 'day';

type Reminder = {
  id: string;
  zikhrName: string;
  time?: string; // HH:mm
  message?: string;
  enabled: boolean;
  notificationId?: string;
  createdAt: string;
  scheduleType: ReminderScheduleType;
  offsetValue?: number;
  offsetUnit?: ReminderOffsetUnit;
  scheduledFor?: string;
  repeats: boolean;
};

const REMINDERS_STORAGE_KEY = '@zikirmatik/reminders';
const CHANNEL_ID = 'zikhr-reminders';

export default function ReminderScreen() {
  const { zikhrs } = useZikhr();
  const [selectedZikhrName, setSelectedZikhrName] = useState(zikhrs[0]?.name ?? '');
  const [isZikhrModalVisible, setIsZikhrModalVisible] = useState(false);
  const [timeInput, setTimeInput] = useState('08:00');
  const [scheduleType, setScheduleType] = useState<ReminderScheduleType>('daily');
  const [offsetValue, setOffsetValue] = useState('1');
  const [offsetUnit, setOffsetUnit] = useState<ReminderOffsetUnit>('day');
  const [customMessage, setCustomMessage] = useState('');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const zikhrNames = useMemo(() => zikhrs.map((item) => item.name), [zikhrs]);

  const persistReminders = useCallback(async (data: Reminder[]) => {
    try {
      await AsyncStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Hatırlatıcılar kaydedilemedi', error);
    }
  }, []);

  const ensurePermissions = useCallback(async () => {
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.status === 'granted') {
        setPermissionStatus('granted');
        return true;
      }
      const result = await Notifications.requestPermissionsAsync();
      const granted = result.status === 'granted';
      setPermissionStatus(granted ? 'granted' : 'denied');
      return granted;
    } catch (error) {
      console.warn('İzinler alınamadı', error);
      setPermissionStatus('denied');
      return false;
    }
  }, []);

  const scheduleReminderNotification = useCallback(
    async (data: {
      zikhrName: string;
      scheduleType: ReminderScheduleType;
      time?: string;
      message?: string;
      offsetValue?: number;
      offsetUnit?: ReminderOffsetUnit;
    }) => {
      const content = {
        title: `${data.zikhrName} zamanı ⏰`,
        body: data.message?.trim() || `${data.zikhrName} zikrini yapmayı unutma.`,
        sound: 'default' as const,
      };

      if (data.scheduleType === 'daily' && data.time) {
        const { hour, minute } = parseTime(data.time);
        const trigger: Notifications.DailyTriggerInput = {
          hour,
          minute,
          repeats: true,
          channelId: Platform.OS === 'android' ? CHANNEL_ID : undefined,
        };
        const notificationId = await Notifications.scheduleNotificationAsync({
          content,
          trigger,
        });
        return { notificationId, scheduledFor: getNextOccurrenceISO(data.time) };
      }

      const offset = calculateOffsetSeconds(data.offsetValue, data.offsetUnit);
      const triggerDate = new Date(Date.now() + offset * 1000);
      const notificationId = await Notifications.scheduleNotificationAsync({
        content,
        trigger: triggerDate,
      });
      return { notificationId, scheduledFor: triggerDate.toISOString() };
    },
    [],
  );

  const cancelNotificationIfNeeded = useCallback(async (notificationId?: string) => {
    if (!notificationId) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.warn('Bildirim iptal edilemedi', error);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      const hasPermission = await ensurePermissions();
      if (!hasPermission) {
        Alert.alert(
          'İzin gerekli',
          'Hatırlatıcılar için bildirim izni gerekli. Lütfen ayarlardan bildirime izin verin.',
        );
      }
    })();
  }, [ensurePermissions]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      void Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Zikir Hatırlatıcıları',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#03c459',
      });
    }
  }, []);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const stored = await AsyncStorage.getItem(REMINDERS_STORAGE_KEY);
        if (!stored) return;
        const parsed: Reminder[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const normalized = parsed.map((item) => ({
            ...item,
            scheduleType: item.scheduleType ?? 'daily',
            repeats: item.repeats ?? true,
          }));
          setReminders(normalized);

          // Make sure reminders have scheduled notifications
          normalized.forEach((item) => {
            if (item.enabled && !item.notificationId) {
              scheduleReminderNotification({
                zikhrName: item.zikhrName,
                scheduleType: item.scheduleType,
                time: item.time,
                message: item.message,
                offsetValue: item.offsetValue,
                offsetUnit: item.offsetUnit,
              })
                .then(({ notificationId, scheduledFor }) => {
                  setReminders((prev) => {
                    const updated = prev.map((reminder) =>
                      reminder.id === item.id
                        ? { ...reminder, notificationId, scheduledFor: scheduledFor ?? reminder.scheduledFor }
                        : reminder,
                    );
                    void persistReminders(updated);
                    return updated;
                  });
                })
                .catch((error) => console.warn('Hatırlatıcı tekrar planlanamadı', error));
            }
          });
        }
      } catch (error) {
        console.warn('Hatırlatıcılar yüklenemedi', error);
      }
    };

    void loadReminders();
  }, [persistReminders, scheduleReminderNotification]);

  useEffect(() => {
    setSelectedZikhrName((prev) => prev || zikhrNames[0] || '');
  }, [zikhrNames]);

  useEffect(() => {
    if (!infoMessage) return;
    const timeout = setTimeout(() => setInfoMessage(null), 3500);
    return () => clearTimeout(timeout);
  }, [infoMessage]);

  const addReminder = async () => {
    if (!selectedZikhrName) {
      Alert.alert('Zikir gerekli', 'Lütfen bir zikir seçin.');
      return;
    }

    let parsedTime: string | null = null;
    let parsedOffset: number | null = null;
    if (scheduleType === 'daily') {
      parsedTime = validateTimeInput(timeInput);
      if (!parsedTime) {
        Alert.alert('Geçersiz saat', 'Lütfen HH:MM formatında bir saat girin.');
        return;
      }
    } else {
      parsedOffset = validateOffsetInput(offsetValue, offsetUnit);
      if (!parsedOffset) {
        Alert.alert(
          'Geçersiz süre',
          offsetUnit === 'hour'
            ? 'Lütfen 1 ile 240 saat arasında bir değer girin.'
            : 'Lütfen 1 ile 30 gün arasında bir değer girin.',
        );
        return;
      }
    }

    const hasPermission = await ensurePermissions();
    if (!hasPermission) {
      Alert.alert('İzin gerekli', 'Bildirim izni olmadan hatırlatıcı oluşturulamaz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { notificationId, scheduledFor } = await scheduleReminderNotification({
        zikhrName: selectedZikhrName,
        scheduleType,
        time: parsedTime ?? undefined,
        message: customMessage,
        offsetValue: parsedOffset ?? undefined,
        offsetUnit: scheduleType === 'relative' ? offsetUnit : undefined,
      });
      const newReminder: Reminder = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        zikhrName: selectedZikhrName,
        time: parsedTime ?? undefined,
        message: customMessage.trim() || undefined,
        enabled: true,
        notificationId,
        createdAt: new Date().toISOString(),
        scheduleType,
        offsetValue: parsedOffset ?? undefined,
        offsetUnit: scheduleType === 'relative' ? offsetUnit : undefined,
        scheduledFor,
        repeats: scheduleType === 'daily',
      };

      setReminders((prev) => {
        const updated = [newReminder, ...prev];
        void persistReminders(updated);
        return updated;
      });

      setCustomMessage('');
      setInfoMessage('Hatırlatıcı kaydedildi.');
    } catch (error) {
      console.warn('Hatırlatıcı eklenemedi', error);
      Alert.alert('Hata', 'Hatırlatıcı oluşturulurken bir sorun oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReminder = async (reminder: Reminder, nextValue: boolean) => {
    if (nextValue) {
      const hasPermission = await ensurePermissions();
      if (!hasPermission) {
        Alert.alert('İzin gerekli', 'Bildirim izni olmadan hatırlatıcı açılamaz.');
        return;
      }
      try {
        const { notificationId, scheduledFor } = await scheduleReminderNotification({
          zikhrName: reminder.zikhrName,
          scheduleType: reminder.scheduleType,
          time: reminder.time,
          message: reminder.message,
          offsetValue: reminder.offsetValue,
          offsetUnit: reminder.offsetUnit,
        });
        setReminders((prev) => {
          const updated = prev.map((item) =>
            item.id === reminder.id
              ? { ...item, enabled: true, notificationId, scheduledFor: scheduledFor ?? item.scheduledFor }
              : item,
          );
          void persistReminders(updated);
          return updated;
        });
      } catch (error) {
        console.warn('Hatırlatıcı açılamadı', error);
        Alert.alert('Hata', 'Hatırlatıcı tekrar planlanamadı.');
      }
      return;
    }

    await cancelNotificationIfNeeded(reminder.notificationId);
    setReminders((prev) => {
      const updated = prev.map((item) =>
        item.id === reminder.id ? { ...item, enabled: false, notificationId: undefined } : item,
      );
      void persistReminders(updated);
      return updated;
    });
  };

  const deleteReminder = async (reminder: Reminder) => {
    await cancelNotificationIfNeeded(reminder.notificationId);
    setReminders((prev) => {
      const updated = prev.filter((item) => item.id !== reminder.id);
      void persistReminders(updated);
      return updated;
    });
    setInfoMessage('Hatırlatıcı silindi.');
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
              Hatırlatma {offsetValue || '1'} {offsetUnit === 'hour' ? 'saat' : 'gün'} sonra sadece bir kez gönderilir.
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

        <PermissionStatus status={permissionStatus} />
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
              <Text style={styles.reminderMeta}>
                {reminder.scheduleType === 'daily'
                  ? `Günlük tekrar${reminder.scheduledFor ? ` | Sonraki: ${formatDateTime(reminder.scheduledFor)}` : ''}`
                  : `Tek seferlik | ${formatRelativeLabel(reminder.offsetValue, reminder.offsetUnit)}`}
                {'  '}| Oluşturuldu: {formatDate(reminder.createdAt)}
              </Text>
              <TouchableOpacity onPress={() => void deleteReminder(reminder)} hitSlop={10}>
                <MaterialIcons name="delete-forever" size={20} color="#ff6b6b" />
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

function validateTimeInput(value: string): string | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function parseTime(time: string) {
  const [hourStr, minuteStr] = time.split(':');
  return { hour: Number(hourStr), minute: Number(minuteStr) };
}

function formatTimeString(value: string) {
  const match = /^(\d{1,2}):?(\d{0,2})/.exec(value.trim());
  if (!match) return value;
  const hour = Math.min(23, Math.max(0, Number(match[1])));
  const minute = Math.min(59, Math.max(0, Number(match[2] || '0')));
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return dateString;
  }
}

function formatDateTime(dateString?: string) {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
}

function validateOffsetInput(value: string, unit: ReminderOffsetUnit): number | null {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed <= 0) return null;
  const max = unit === 'hour' ? 240 : 30;
  if (parsed > max) return null;
  return Math.round(parsed);
}

function calculateOffsetSeconds(value?: number, unit?: ReminderOffsetUnit) {
  if (!value || !unit) {
    return 3600;
  }
  const multiplier = unit === 'hour' ? 3600 : 86400;
  return value * multiplier;
}

function getNextOccurrenceISO(time: string) {
  const { hour, minute } = parseTime(time);
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 1);
  }
  return target.toISOString();
}

function formatRelativeLabel(value?: number, unit?: ReminderOffsetUnit) {
  if (!value || !unit) return 'Tek seferlik';
  const unitLabel = unit === 'hour' ? 'saat' : 'gün';
  return `${value} ${unitLabel} sonra`;
}

function PermissionStatus({ status }: { status: 'unknown' | 'granted' | 'denied' }) {
  if (status === 'unknown') {
    return null;
  }
  const isGranted = status === 'granted';
  return (
    <View style={[styles.permissionPill, !isGranted && styles.permissionPillError]}>
      <MaterialIcons
        style={styles.permissionIcon}
        name={isGranted ? 'notifications-active' : 'notifications-off'}
        size={16}
        color="#e6e7e9"
      />
      <Text style={styles.permissionText}>
        {isGranted ? 'Bildirim izni verildi' : 'Bildirim izni reddedildi'}
      </Text>
    </View>
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
  reminderMeta: {
    fontSize: 11,
    color: '#a7acb5',
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
