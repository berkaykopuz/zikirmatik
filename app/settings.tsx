import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { useZikhr } from '@/context/ZikhrContext';

export default function SettingsScreen() {
    const router = useRouter();
    const {
        sfxEnabled,
        setSfxEnabled,
        vibrationEnabled,
        setVibrationEnabled,
        appearanceMode,
        setAppearanceMode,
        backgroundImage,
        setBackgroundImage,
        resetAllData,
    } = useZikhr();

    const handleReset = () => {
        Alert.alert(
            'Verileri Sıfırla',
            'Tüm zikir geçmişiniz ve ayarlarınız silinecek. Bu işlem geri alınamaz. Emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        await resetAllData();
                        Alert.alert('Başarılı', 'Tüm veriler sıfırlandı.');
                        router.replace('/');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ title: 'Ayarlar', headerStyle: { backgroundColor: '#1f2025' }, headerTintColor: '#ffbf00' }} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Genel</Text>

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="volume-high-outline" size={22} color="#e6e7e9" />
                            <Text style={styles.rowLabel}>Ses Efektleri</Text>
                        </View>
                        <Switch
                            value={sfxEnabled}
                            onValueChange={setSfxEnabled}
                            trackColor={{ false: '#3a3d42', true: '#03c459' }}
                            thumbColor={sfxEnabled ? '#ffffff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="phone-portrait-outline" size={22} color="#e6e7e9" />
                            <Text style={styles.rowLabel}>Titreşim</Text>
                        </View>
                        <Switch
                            value={vibrationEnabled}
                            onValueChange={setVibrationEnabled}
                            trackColor={{ false: '#3a3d42', true: '#03c459' }}
                            thumbColor={vibrationEnabled ? '#ffffff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="eye-outline" size={22} color="#e6e7e9" />
                            <Text style={styles.rowLabel}>Tesbih Görünümü</Text>
                        </View>
                        <Switch
                            value={appearanceMode === 'beads'}
                            onValueChange={(val) => setAppearanceMode(val ? 'beads' : 'digital')}
                            trackColor={{ false: '#3a3d42', true: '#03c459' }}
                            thumbColor={appearanceMode === 'beads' ? '#ffffff' : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="image-outline" size={22} color="#e6e7e9" />
                            <Text style={styles.rowLabel}>Arka Plan</Text>
                        </View>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.backgroundScroll}>
                        <TouchableOpacity
                            style={[styles.bgOption, !backgroundImage && styles.bgOptionSelected]}
                            onPress={() => setBackgroundImage(null)}
                        >
                            <View style={[styles.bgPreview, { backgroundColor: '#1f2025' }]} />
                            <Text style={styles.bgLabel}>Varsayılan</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.bgOption, backgroundImage === 'kaaba' && styles.bgOptionSelected]}
                            onPress={() => setBackgroundImage('kaaba')}
                        >
                            <Image source={require('@/assets/images/backgrounds/kaaba.png')} style={styles.bgPreview} />
                            <Text style={styles.bgLabel}>Kabe</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.bgOption, backgroundImage === 'medina' && styles.bgOptionSelected]}
                            onPress={() => setBackgroundImage('medina')}
                        >
                            <Image source={require('@/assets/images/backgrounds/medina.png')} style={styles.bgPreview} />
                            <Text style={styles.bgLabel}>Medine</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.bgOption, backgroundImage === 'nature' && styles.bgOptionSelected]}
                            onPress={() => setBackgroundImage('nature')}
                        >
                            <Image source={require('@/assets/images/backgrounds/nature.png')} style={styles.bgPreview} />
                            <Text style={styles.bgLabel}>Doğa</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Veri Yönetimi</Text>
                    <TouchableOpacity style={styles.dangerRow} onPress={handleReset}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="trash-outline" size={22} color="#ff453a" />
                            <Text style={styles.dangerLabel}>Tüm Verileri Sıfırla</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#6f737a" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hakkında</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versiyon</Text>
                        <Text style={styles.infoValue}>1.0.0</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Geliştirici</Text>
                        <Text style={styles.infoValue}>Zikirmatik Ekibi</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1f2025',
    },
    content: {
        padding: 20,
    },
    section: {
        backgroundColor: '#2c2f34',
        borderRadius: 12,
        marginBottom: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#3a3d42',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#a7acb5',
        marginLeft: 16,
        marginTop: 16,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        fontSize: 16,
        color: '#e6e7e9',
    },
    separator: {
        height: 1,
        backgroundColor: '#3a3d42',
        marginLeft: 50,
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    dangerLabel: {
        fontSize: 16,
        color: '#ff453a',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    infoLabel: {
        fontSize: 16,
        color: '#e6e7e9',
    },
    infoValue: {
        fontSize: 16,
        color: '#a7acb5',
    },
    backgroundScroll: {
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    bgOption: {
        marginRight: 12,
        alignItems: 'center',
        opacity: 0.6,
    },
    bgOptionSelected: {
        opacity: 1,
    },
    bgPreview: {
        width: 80,
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#3a3d42',
    },
    bgLabel: {
        fontSize: 12,
        color: '#e6e7e9',
    },
});
