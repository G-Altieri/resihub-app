'use client';

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity,
    Modal,
    Button,
    StyleSheet as RNStyleSheet,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useLocalSearchParams } from 'expo-router';
import api from '../../../../scripts/request';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import delle icone SVG per le info della colonnina
import MarcaIcon from '../../../../assets/svg/sensore/marca.svg';
import ModelloIcon from '../../../../assets/svg/sensore/modello.svg';
import TipoIcon from '../../../../assets/svg/sensore/tipologia.svg';
import StatoIcon from '../../../../assets/svg/sensore/stato.svg';
import CodiceIcon from '../../../../assets/svg/sensore/codice.svg';
import DurataIcon from '../../../../assets/svg/sensore/durata.svg';
import CostoIcon from '../../../../assets/svg/sensore/costo.svg';


export default function SessioneRicaricaPage() {
    // Estrai il parametro passato, in particolare l'id della colonnina (sessione di ricarica)
    const { idSessioniRicarica } = useLocalSearchParams() as { idSessioniRicarica: string };
    const [sessionData, setSessionData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);

    // Funzione per recuperare i dati della sessione di ricarica dall'endpoint
    const fetchSessionData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            // L'endpoint è http://localhost:8080/sessioni-ricarica/colonnina/{id}
            const response = await api.get(`/sessioni-ricarica/colonnina/${idSessioniRicarica}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSessionData(response.data);
        } catch (err) {
            console.error('Errore durante il recupero dei dati della sessione:', err);
            setError('Errore durante il recupero dei dati della sessione');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionData();
    }, []);

    // Filtraggio delle sessioni in base alla ricerca (per RFID) e alla data (inizioSessione)
    const filteredSessions = sessionData.filter((session) => {
        const matchesSearch = session.rfid.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesDate = true;
        if (selectedDate) {
            const sessionDate = new Date(session.inizioSessione);
            matchesDate = sessionDate.toDateString() === selectedDate.toDateString();
        }
        return matchesSearch && matchesDate;
    });

    // Estrai le informazioni della colonnina (dalla prima sessione)
    const colonnina = sessionData.length > 0 ? sessionData[0].colonnina : null;

    // Calcola il valore massimo per durata e costo per rappresentare i grafici (semplice scala)
    const maxDurata = Math.max(...sessionData.map((s) => s.durata));
    const maxCosto = Math.max(...sessionData.map((s) => s.costoTotale));

    // Funzione per aprire il modal con i dettagli della sessione
    const openSessionModal = (session: any) => {
        setSelectedSession(session);
        setModalVisible(true);
    };

    // Handler per il cambio di data dal DateTimePicker
    const onDateChange = (event: any, date?: Date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDate(date);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.infoText}>Caricamento dati...</Text>
            </View>
        );
    }

    if (error || !sessionData || sessionData.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error || 'Nessun dato disponibile'}</Text>
            </View>
        );
    }

    // Contenuto Header (riquadro colonnina info, titolo, barra di ricerca e selettore data)
    const ListHeader = () => (
        <View>
            {colonnina && (
                <View style={styles.sectionBox}>
                    <Text style={styles.sectionTitle}>{colonnina.nome}</Text>
                    <View style={styles.infoRow}>
                        <MarcaIcon width={20} height={20} style={styles.icon} />
                        <Text style={styles.detailText}>Marca: {colonnina.marca}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <ModelloIcon width={20} height={20} style={styles.icon} />
                        <Text style={styles.detailText}>Modello: {colonnina.modello}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <TipoIcon width={20} height={20} style={styles.icon} />
                        <Text style={styles.detailText}>Tipo: {colonnina.tipo || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <StatoIcon width={20} height={20} style={styles.icon} />
                        <Text style={styles.detailText}>Stato: {colonnina.stato}</Text>
                    </View>
                </View>
            )}
            <Text style={styles.mainTitle}>Sessioni di Ricariche</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Cerca per codice RFID..."
                    placeholderTextColor="#ccc"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>
            <View style={styles.dateContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateButtonText}>
                        {selectedDate ? selectedDate.toLocaleDateString('it-IT') : 'Seleziona Data'}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        mode="date"
                        value={selectedDate || new Date()}
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>
        </View>
    );

    // Renderizza ogni sessione (lista a tema dark)
    // Renderizza ogni sessione (lista a tema dark) con icone per codice, durata e costo
    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity onPress={() => openSessionModal(item)}>
            <View style={styles.sessionCard}>
                <View style={styles.cardRow}>
                    <CodiceIcon width={20} height={20} style={styles.icon} />
                    <Text style={styles.cardText}>Codice: {item.rfid}</Text>
                </View>
                <View style={styles.cardRow}>
                    <DurataIcon width={20} height={20} style={styles.icon} />
                    <Text style={styles.cardText}>Durata: {item.durata} min</Text>
                </View>
                <View style={styles.cardRow}>
                    <CostoIcon width={20} height={20} style={styles.icon} />
                    <Text style={styles.cardText}>Costo: € {item.costoTotale}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // Funzione per formattare il timestamp in "dd/MM/yyyy HH:mm"
    const formatTimestamp = (timestamp: string | number | Date) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <View style={styles.outerContainer}>
            {/* Sfondo assoluto */}
            <Image
                source={require('../../../../assets/images/SfondoHome.jpg')}
                style={RNStyleSheet.absoluteFill}
                resizeMode="cover"
            />
            <FlatList
                data={filteredSessions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.listContainer}
            />
            {/* Modal per visualizzazione dettagli approfonditi */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSession && (
                            <>
                                <Text style={styles.modalTitle}>Dettaglio Sessione</Text>
                                <Text style={styles.modalLabel}>RFID: {selectedSession.rfid}</Text>
                                <Text style={styles.modalLabel}>
                                    Inizio: {formatTimestamp(selectedSession.inizioSessione)}
                                </Text>
                                <Text style={styles.modalLabel}>
                                    Fine: {formatTimestamp(selectedSession.fineSessione)}
                                </Text>
                                <Text style={styles.modalLabel}>
                                    Energia Erogata: {selectedSession.energiaErogata} kWh
                                </Text>
                                <Text style={styles.modalLabel}>Durata: {selectedSession.durata} minuti</Text>
                                <Text style={styles.modalLabel}>
                                    Potenza Media: {selectedSession.potenzaMedia} kW
                                </Text>
                                <Text style={styles.modalLabel}>
                                    Costo Totale: € {selectedSession.costoTotale}
                                </Text>
                                {/* Grafici semplici: barre per durata e costo */}
                                <View style={styles.chartContainer}>
                                    <Text style={styles.chartLabel}>Durata</Text>
                                    <View style={styles.chartBarBackground}>
                                        <View
                                            style={[
                                                styles.chartBar,
                                                { width: `${(selectedSession.durata / maxDurata) * 100}%` },
                                            ]}
                                        />
                                    </View>
                                </View>
                                <View style={styles.chartContainer}>
                                    <Text style={styles.chartLabel}>Costo</Text>
                                    <View style={styles.chartBarBackground}>
                                        <View
                                            style={[
                                                styles.chartBar,
                                                {
                                                    backgroundColor: '#FFAA00',
                                                    width: `${(selectedSession.costoTotale / maxCosto) * 100}%`,
                                                },
                                            ]}
                                        />
                                    </View>
                                </View>
                                <Button title="Chiudi" onPress={() => setModalVisible(false)} />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        backgroundColor: '#1A1B41',
        paddingTop: 90,
    },
    listContainer: {
        paddingBottom: 50,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1A1B41',
    },
    infoText: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    errorText: {
        fontSize: 16,
        color: '#FF5555',
        textAlign: 'center',
        fontFamily: 'Poppins-Regular',
    },
    sectionBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 10,
        padding: 16,
        marginBottom: 20,
        alignItems: 'flex-start',
        marginTop: -10,
    },
    sectionTitle: {
        fontSize: 20,
        color: '#ECECEC',
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        width: '100%',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
    },
    detailText: {
        fontSize: 18,
        color: '#ECECEC',
        fontFamily: 'Poppins-Regular',
    },
    mainTitle: {
        fontSize: 24,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    searchContainer: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    searchInput: {
        color: '#fff',
        paddingVertical: 8,
        fontFamily: 'Poppins-Regular',
    },
    dateContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    dateButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
    },
    dateButtonText: {
        color: '#fff',
        fontFamily: 'Poppins-Bold',
    },
    sessionCard: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#fff',
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#1A1B41',
        borderRadius: 10,
        padding: 20,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    modalLabel: {
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#fff',
        marginBottom: 4,
    },
    chartContainer: {
        marginVertical: 10,
    },
    chartLabel: {
        fontSize: 14,
        fontFamily: 'Poppins-Bold',
        color: '#fff',
        marginBottom: 4,
    },
    chartBarBackground: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 5,
        height: 20,
        overflow: 'hidden',
    },
    chartBar: {
        backgroundColor: '#70A600',
        height: 20,
    },
    cardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },

});

