'use client';

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Alert,
    Image,
    StyleProp,
    ImageStyle
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../scripts/request';
import { getBackgroundImage } from '../../../components/bgDinamicoDispositivi';
import { Picker } from '@react-native-picker/picker';

interface Parametro {
    idParametro?: number; // opzionale se è nuovo
    nome: string;
    tipologia: string;
    unitaMisura: string;
    valMin: number;
    valMax: number;
    maxDelta: number;
}

interface Dispositivo {
    idDispositivo?: number;
    nome: string;
    marca: string;
    modello: string;
    tipo: string;
    stato: string;
    parametri: Parametro[];
}

interface LocalSearchParams {
    idCondominio: string;
}

export default function AddDeviceScreen() {
    const router = useRouter();
    const { idCondominio } = useLocalSearchParams() as any;

    const [device, setDevice] = useState<Dispositivo>({
        nome: '',
        marca: '',
        modello: '',
        tipo: '', // inizialmente vuoto
        stato: '',
        parametri: [],
    });
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Aggiorna i campi del dispositivo
    const updateField = (field: keyof Dispositivo, value: string) => {
        setDevice(prev => ({ ...prev, [field]: value }));
    };

    // Aggiorna i campi di un parametro; converte in numero se necessario
    const updateParametro = (index: number, field: keyof Parametro, value: string) => {
        const updatedParams = [...device.parametri];
        if (field === 'valMin' || field === 'valMax' || field === 'maxDelta') {
            updatedParams[index] = { ...updatedParams[index], [field]: parseFloat(value) };
        } else {
            updatedParams[index] = { ...updatedParams[index], [field]: value };
        }
        setDevice(prev => ({ ...prev, parametri: updatedParams }));
    };

    // Aggiunge un nuovo parametro vuoto
    const addParametro = () => {
        setDevice(prev => ({
            ...prev,
            parametri: [...prev.parametri, { nome: '', tipologia: '', unitaMisura: '', valMin: 0, valMax: 0, maxDelta: 0 }]
        }));
    };

    // Rimuove il parametro all'indice specificato
    const removeParametro = (index: number) => {
        const updatedParams = device.parametri.filter((_, i) => i !== index);
        setDevice(prev => ({ ...prev, parametri: updatedParams }));
    };

    // Funzione di validazione: tutti i campi obbligatori devono essere compilati
    const validateFields = (): boolean => {
        // Validazione per il dispositivo
        if (!device.nome.trim() || !device.marca.trim() || !device.modello.trim() || !device.tipo.trim() || !device.stato.trim()) {
            Alert.alert("Errore", "Compilare tutti i campi del dispositivo");
            return false;
        }
        // Validazione per ogni parametro
        for (let i = 0; i < device.parametri.length; i++) {
            const p = device.parametri[i];
            if (!p.nome.trim() || !p.tipologia.trim() || !p.unitaMisura.trim() ||
                p.valMin === null || isNaN(p.valMin) ||
                p.valMax === null || isNaN(p.valMax) ||
                p.maxDelta === null || isNaN(p.maxDelta)
            ) {
                Alert.alert("Errore", `Compilare tutti i campi per il parametro ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    // Salva il dispositivo chiamando l'endpoint POST
    const handleSave = async () => {
        if (!validateFields()) return;

        setSaving(true);
        try {
            console.log('Device:', device);
            const response = await api.post<Dispositivo>(`/api/condomini/${idCondominio}/dispositivi`, device);
            Alert.alert("Successo", "Dispositivo aggiunto correttamente", [
                { text: "OK", onPress: () => router.push({ pathname: "/home", params: { idCondominio } }) }
            ]);
        } catch (err) {
            console.error("Errore durante il salvataggio del dispositivo", err);
            Alert.alert("Errore", "Impossibile aggiungere il dispositivo");
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={getBackgroundImage("default")}
                style={StyleSheet.absoluteFill as StyleProp<ImageStyle>}
                resizeMode="cover"
            />
            <ScrollView contentContainerStyle={styles.headerContainer}>
                <View style={styles.formContainer}>
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <Text style={styles.label}>Nome</Text>
                    <TextInput
                        style={styles.input}
                        value={device.nome}
                        onChangeText={(text) => updateField("nome", text)}
                    />

                    <Text style={styles.label}>Marca</Text>
                    <TextInput
                        style={styles.input}
                        value={device.marca}
                        onChangeText={(text) => updateField("marca", text)}
                    />

                    <Text style={styles.label}>Modello</Text>
                    <TextInput
                        style={styles.input}
                        value={device.modello}
                        onChangeText={(text) => updateField("modello", text)}
                    />

                    <Text style={styles.label}>Tipo</Text>
                    {/* Sostituiamo il TextInput con un Picker */}
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={device.tipo}
                            onValueChange={(itemValue) => updateField("tipo", itemValue)}
                            style={styles.picker}
                            dropdownIconColor="#ECECEC"
                        >
                            <Picker.Item label="Seleziona tipo..." value="" />
                            <Picker.Item label="Calore" value="Calore" />
                            <Picker.Item label="Energia" value="Energia" />
                            <Picker.Item label="Ambiente" value="Ambiente" />
                            <Picker.Item label="Colonnina" value="Colonnina" />
                        </Picker>
                    </View>

                    <Text style={styles.label}>Stato</Text>
                    <TextInput
                        style={styles.input}
                        value={device.stato}
                        onChangeText={(text) => updateField("stato", text)}
                    />

                    <Text style={styles.sectionTitle}>Parametri</Text>
                    {device.parametri.map((param, index) => (
                        <View key={index} style={styles.paramContainer}>
                            <Text style={styles.paramLabel}>Nome Parametro</Text>
                            <TextInput
                                style={styles.input}
                                value={param.nome}
                                onChangeText={(text) => updateParametro(index, "nome", text)}
                            />

                            <Text style={styles.paramLabel}>Tipologia</Text>
                            <TextInput
                                style={styles.input}
                                value={param.tipologia}
                                onChangeText={(text) => updateParametro(index, "tipologia", text)}
                            />

                            <Text style={styles.paramLabel}>Unità di Misura</Text>
                            <TextInput
                                style={styles.input}
                                value={param.unitaMisura}
                                onChangeText={(text) => updateParametro(index, "unitaMisura", text)}
                            />

                            <Text style={styles.paramLabel}>Valore Minimo</Text>
                            <TextInput
                                style={styles.input}
                                value={param.valMin.toString()}
                                onChangeText={(text) => updateParametro(index, "valMin", text)}
                                keyboardType="numeric"
                            />

                            <Text style={styles.paramLabel}>Valore Massimo</Text>
                            <TextInput
                                style={styles.input}
                                value={param.valMax.toString()}
                                onChangeText={(text) => updateParametro(index, "valMax", text)}
                                keyboardType="numeric"
                            />

                            <Text style={styles.paramLabel}>Max Delta</Text>
                            <TextInput
                                style={styles.input}
                                value={param.maxDelta.toString()}
                                onChangeText={(text) => updateParametro(index, "maxDelta", text)}
                                keyboardType="numeric"
                            />

                            <TouchableOpacity style={styles.removeButton} onPress={() => removeParametro(index)}>
                                <Text style={styles.removeButtonText}>Rimuovi parametro</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addParamButton} onPress={addParametro}>
                        <Text style={styles.addParamButtonText}>Aggiungi parametro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator size="small" color="#1A1B41" />
                        ) : (
                            <Text style={styles.saveButtonText}>Salva Dispositivo</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1B41',
        paddingTop: 90,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    // Il formContainer ha sfondo nero con opacità al 30%
    formContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        width: "90%"
    },
    title: {
        fontSize: 26,
        color: '#ECECEC',
        fontFamily: 'Poppins-Bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#ECECEC',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 12,
    },
    input: {
        backgroundColor: '#333',
        color: '#ECECEC',
        fontSize: 16,
        padding: 12,
        borderRadius: 8,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#555',
    },
    pickerContainer: {
        backgroundColor: '#333',
        borderRadius: 8,
        marginTop: 6,
        borderWidth: 1,
        borderColor: '#555',
        overflow: 'hidden'
    },
    picker: {
        color: '#ECECEC',
    },
    sectionTitle: {
        fontSize: 20,
        color: '#ECECEC',
        fontFamily: 'Poppins-Bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    paramContainer: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    paramLabel: {
        fontSize: 14,
        color: '#ECECEC',
        fontFamily: 'Poppins-SemiBold',
        marginTop: 8,
    },
    addParamButton: {
        backgroundColor: '#BAFF29',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignSelf: 'center',
        marginVertical: 20,
    },
    addParamButtonText: {
        fontSize: 16,
        color: '#1A1B41',
        fontFamily: 'Poppins-Bold',
    },
    removeButton: {
        backgroundColor: '#FF5555',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        marginTop: 8,
        alignSelf: 'flex-end',
    },
    removeButtonText: {
        fontSize: 14,
        color: '#1A1B41',
        fontFamily: 'Poppins-Bold',
    },
    saveButton: {
        backgroundColor: '#BAFF29',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        fontSize: 18,
        color: '#1A1B41',
        fontFamily: 'Poppins-Bold',
    },
    errorText: {
        color: '#FF5555',
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 10,
    },
});
