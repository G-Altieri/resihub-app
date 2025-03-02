'use client';

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ColonninePage() {
  const { data } = useLocalSearchParams();

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

  // Filtra i dispositivi di tipo "Colonnine"
  const devices = parsedData.dispositivi.filter(
    (device: any) => device.tipo === 'Colonnina'
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/SfondoColonnine.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <Text style={styles.title}>Dispositivi di Colonnine</Text>
      {devices.length === 0 ? (
        <Text style={styles.infoText}>Nessun dispositivo trovato per Colonnine</Text>
      ) : (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.idDispositivo.toString()}
          renderItem={({ item }) => (
            <View style={styles.deviceItem}>
              <Text style={styles.deviceName}>{item.nome}</Text>
              <Text style={styles.deviceDetail}>
                {item.descrizione || 'Dettagli non disponibili'}
              </Text>
            </View>
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
  },
  deviceDetail: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
});
