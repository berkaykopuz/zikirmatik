import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { ESMA_UL_HUSNA, EsmaUlHusnaItem } from '@/constants/esmaulhusna';
import { useZikhr } from '@/context/ZikhrContext';

export default function EsmaUlHusnaScreen() {
    const router = useRouter();
    const { addZikhr, resetZikhrProgress } = useZikhr();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<EsmaUlHusnaItem | null>(null);

    const filteredItems = ESMA_UL_HUSNA.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStartZikhr = () => {
        if (!selectedItem) return;

        const newZikhr = {
            name: selectedItem.name,
            description: selectedItem.meaning,
            count: selectedItem.count,
        };

        addZikhr(newZikhr);
        resetZikhrProgress(newZikhr.name);

        setSelectedItem(null);
        router.replace('/');
    };

    const renderItem = ({ item }: { item: EsmaUlHusnaItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedItem(item)}
            activeOpacity={0.85}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                </View>
            </View>
            <Text style={styles.cardMeaning} numberOfLines={2}>
                {item.meaning}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#a7acb5" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="İsim veya anlam ara..."
                    placeholderTextColor="#6f737a"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.name}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            <Modal
                visible={!!selectedItem}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedItem(null)}
            >
                <BlurView intensity={50} experimentalBlurMethod="dimezisBlurView" tint="dark" style={styles.modalBackdrop}>
                    <Pressable style={styles.modalBackdropPressable} onPress={() => setSelectedItem(null)}>
                        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
                            {selectedItem && (
                                <>
                                    <Text style={styles.modalTitle}>{selectedItem.name}</Text>
                                    <Text style={styles.modalDescription}>{selectedItem.meaning}</Text>

                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Zikir Adeti</Text>
                                        <Text style={styles.modalInfoValue}>{selectedItem.count}</Text>
                                    </View>

                                    <View style={styles.modalButtonsRow}>
                                        <TouchableOpacity
                                            style={styles.modalCloseButton}
                                            onPress={() => setSelectedItem(null)}
                                        >
                                            <Text style={styles.modalCloseButtonText}>Kapat</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.modalRunButton}
                                            onPress={handleStartZikhr}
                                        >
                                            <Text style={styles.modalRunButtonText}>Zikir Çek</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </Pressable>
                    </Pressable>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1f2025',
        padding: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2c2f34',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#3a3d42',
        marginTop: 24,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        color: '#e6e7e9',
        fontSize: 15,
    },
    list: {
        paddingBottom: 24,
        gap: 12,
    },
    card: {
        backgroundColor: '#2c2f34',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#3a3d42',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffbf00',
    },
    countBadge: {
        backgroundColor: '#26292f',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#3a3d42',
    },
    countText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#a7acb5',
    },
    cardMeaning: {
        fontSize: 14,
        color: '#a7acb5',
        lineHeight: 20,
    },
    modalBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 24,
        fontWeight: '700',
        color: '#ffbf00',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalDescription: {
        fontSize: 16,
        lineHeight: 24,
        color: '#e6e7e9',
        marginBottom: 24,
        textAlign: 'center',
    },
    modalInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#26292f',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#3a3d42',
        marginBottom: 24,
    },
    modalInfoLabel: {
        fontSize: 15,
        color: '#a7acb5',
        fontWeight: '600',
    },
    modalInfoValue: {
        fontSize: 18,
        color: '#ffbf00',
        fontWeight: '700',
    },
    modalButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    modalCloseButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#2c2f34',
        borderRadius: 999,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#3a3d42',
    },
    modalCloseButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#e6e7e9',
    },
    modalRunButton: {
        flex: 1,
        paddingVertical: 14,
        backgroundColor: '#03c459',
        borderRadius: 999,
        alignItems: 'center',
    },
    modalRunButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0b2f1b',
    },
});
