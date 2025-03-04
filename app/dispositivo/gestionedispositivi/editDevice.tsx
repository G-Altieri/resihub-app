'use client';

import React, { useEffect, useState } from 'react';
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
  idParametro?: number;
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
  idDispositivo: string;
  idCondominio: string;
}

export default function EditDeviceScreen() {
  const router = useRouter();
  const { idDispositivo, idCondominio } = useLocalSearchParams() as any;

  const [device, setDevice] = useState<Dispositivo>({
    nome: '',
    marca: '',
    modello: '',
    tipo: '',
    stato: '',
    parametri: []
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDevice = async () => {
      try {
        // Recupera i dettagli del dispositivo dall'endpoint GET
        const response = await api.get<Dispositivo>(`/api/dispositivi/${idDispositivo}`);
        const data = response.data;
        console.log('Dati del dispositivo:', data);
        // Se i parametri non sono definiti, impostali a [] per evitare errori nel rendering
        if (!data.parametri) {
          data.parametri = [];
        }
        setDevice(data);
      } catch (err) {
        console.error('Errore nel recupero dei dati del dispositivo', err);
        setError('Errore nel recupero dei dati del dispositivo');
      } finally {
        setLoading(false);
      }
    };
    fetchDevice();
  }, [idDispositivo]);

  const updateField = (field: keyof Dispositivo, value: string) => {
    setDevice(prev => ({ ...prev, [field]: value }));
  };

  const updateParametro = (index: number, field: keyof Parametro, value: string) => {
    const updatedParams = [...device.parametri];
    if (field === 'valMin' || field === 'valMax' || field === 'maxDelta') {
      updatedParams[index] = { ...updatedParams[index], [field]: parseFloat(value) };
    } else {
      updatedParams[index] = { ...updatedParams[index], [field]: value };
    }
    setDevice(prev => ({ ...prev, parametri: updatedParams }));
  };

  const addParametro = () => {
    setDevice(prev => ({
      ...prev,
      parametri: [
        ...prev.parametri,
        { nome: '', tipologia: '', unitaMisura: '', valMin: 0, valMax: 0, maxDelta: 0 }
      ]
    }));
  };

  // Quando si preme "Rimuovi parametro", se il parametro ha un id esegue la DELETE
  const handleRemoveParametro = async (index: number) => {
    const param = device.parametri[index];
    if (param.idParametro) {
      try {
        await api.delete(`/api/parametri/${param.idParametro}`);
        const updatedParams = device.parametri.filter((_, i) => i !== index);
        setDevice(prev => ({ ...prev, parametri: updatedParams }));
      } catch (error) {
        console.error("Errore durante l'eliminazione del parametro", error);
        Alert.alert("Errore", "Impossibile eliminare il parametro. Rimuovi eventuali dati sensori associati prima.");
      }
    } else {
      // Se non è stato ancora salvato, rimuovilo solo dallo state
      const updatedParams = device.parametri.filter((_, i) => i !== index);
      setDevice(prev => ({ ...prev, parametri: updatedParams }));
    }
  };

  // (Opzionale) Funzione di validazione: controlla che tutti i campi obbligatori siano compilati
  const validateFields = (): boolean => {
    if (!device.nome.trim() || !device.marca.trim() || !device.modello.trim() || !device.tipo.trim() || !device.stato.trim()) {
      Alert.alert("Errore", "Compilare tutti i campi del dispositivo");
      return false;
    }
    for (let i = 0; i < device.parametri.length; i++) {
      const p = device.parametri[i];
      if (!p.nome.trim() || !p.tipologia.trim() || !p.unitaMisura.trim() ||
        p.valMin === null || isNaN(p.valMin) ||
        p.valMax === null || isNaN(p.valMax) ||
        p.maxDelta === null || isNaN(p.maxDelta)) {
        Alert.alert("Errore", `Compilare tutti i campi per il parametro ${i + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateFields()) return;
    setSaving(true);
    try {
      const response = await api.put<Dispositivo>(`/api/dispositivi/${idDispositivo}`, device);
      Alert.alert("Successo", "Dispositivo aggiornato correttamente", [
        { text: "OK", onPress: () => router.push({ pathname: '/home', params: { idCondominio } }) }
      ]);
    } catch (err) {
      console.error('Errore durante il salvataggio del dispositivo', err);
      Alert.alert("Errore", "Impossibile aggiornare il dispositivo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#70A600" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={getBackgroundImage("default")}
        style={StyleSheet.absoluteFill as StyleProp<ImageStyle>}
        resizeMode="cover"
      />
      <ScrollView contentContainerStyle={styles.headerContainer}>

        <View style={styles.formContainer}>
          {/* <Text style={styles.title}>Modifica Dispositivo</Text> */}
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

              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveParametro(index)}>
                <Text style={styles.removeButtonText}>Rimuovi parametro</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addParamButton} onPress={addParametro}>
            <Text style={styles.addParamButtonText}>Aggiungi parametro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator size="small" color="#1A1B41" /> : <Text style={styles.saveButtonText}>Salva Dispositivo</Text>}
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1B41',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    width: '90%',
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
    overflow: 'hidden',
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
