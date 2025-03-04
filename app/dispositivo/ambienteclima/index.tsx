'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AmbienteClimaPage() {
  const { data } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Proviamo a parsare i dati ricevuti come JSON
  let parsedData: any = null;
  try {
    parsedData = data ? JSON.parse(data as string) : null;
  } catch (error) {
    console.error('Errore nel parsing dei dati:', error);
  }

  if (!parsedData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Nessun dato disponibile</Text>
      </View>
    );
  }

  // Recupera l'id del condominio dai dati
  const idCondominio = parsedData.condominio?.idCondominio;

  // Filtra i dispositivi di tipo "Colonnine"
  const devices = parsedData.dispositivi.filter(
    (device: any) => device.tipo === 'Ambiente'
  );


  // Filtra in base alla search query
  const filteredDevices = devices.filter((device: any) =>
    device.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/SfondoAmbiente.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <Text style={styles.title}>Dispositivi di Ambiente e Clima</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Cerca dispositivo..."
        placeholderTextColor="#ccc"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />
      {filteredDevices.length === 0 ? (
        <Text style={styles.infoText}>
          Nessun dispositivo trovato
        </Text>
      ) : (
        <FlatList
          data={filteredDevices}
          keyExtractor={(item) => item.idDispositivo.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '../dispositivo/[idDispositivo]',
                  params: {
                    idDispositivo: item.idDispositivo.toString(),
                    idCondominio: idCondominio.toString(),
                  },
                })
              }
            >
              <View style={styles.deviceItem}>
                <Text style={styles.deviceName}>{item.nome}</Text>
                <View style={styles.deviceSubInfo}>
                  <Text style={styles.deviceBrand}>{item.marca}</Text>
                  <Text style={styles.deviceModel}>{item.modello}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginTop: 30,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF5555',
    textAlign: 'center',
  },
  deviceItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  deviceSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceBrand: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  deviceModel: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
});
