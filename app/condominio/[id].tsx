'use client';

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../scripts/request';

export default function CondominiumDetailsScreen() {
  const { id } = useLocalSearchParams(); // Ottieni il parametro dinamico (id del condominio)
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchCondominium() {
      try {
        // Effettua la richiesta GET alla rotta protetta
        const response = await api.get(`/api/condomini/${id}`);
        setData(response.data);
      } catch (err: any) {
        console.error('Errore durante il recupero dei dettagli:', err);
        setError('Errore durante il caricamento dei dettagli.');
      } finally {
        setLoading(false);
      }
    }
    fetchCondominium();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#70A600" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Dettagli Dispositivi</Text>
      {data && Array.isArray(data) ? (
        data.map((device: any) => (
          <View key={device.idDispositivo} style={styles.card}>
            <Text style={styles.deviceName}>{device.nome}</Text>
            <Text style={styles.deviceInfo}>Marca: {device.marca}</Text>
            <Text style={styles.deviceInfo}>Modello: {device.modello}</Text>
            <Text style={styles.deviceInfo}>Tipo: {device.tipo}</Text>
            <Text style={styles.deviceInfo}>Stato: {device.stato}</Text>
            <Text style={styles.sensorsHeader}>Sensori:</Text>
            {device.sensori && device.sensori.map((sensor: any) => (
              <View key={sensor.idSensore} style={styles.sensorRow}>
                <Text style={styles.sensorText}>ID: {sensor.idSensore}</Text>
                <Text style={styles.sensorText}>Valore: {sensor.valore}</Text>
                <Text style={styles.sensorText}>
                  Timestamp: {new Date(sensor.timestamp).toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        ))
      ) : (
        <Text style={styles.errorText}>Nessun dato disponibile.</Text>
      )}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Indietro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A1B41',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1A1B41',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#282961',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    width: '100%',
  },
  deviceName: {
    fontSize: 22,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
    marginBottom: 4,
  },
  sensorsHeader: {
    fontSize: 18,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    marginTop: 10,
    marginBottom: 6,
  },
  sensorRow: {
    backgroundColor: '#1A1B41',
    padding: 8,
    borderRadius: 5,
    marginBottom: 4,
  },
  sensorText: {
    fontSize: 14,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    backgroundColor: '#70A600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  backButtonText: {
    color: '#1A1B41',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
});
