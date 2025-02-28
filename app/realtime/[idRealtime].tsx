'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../scripts/request';
import * as SecureStore from 'expo-secure-store';

export default function RealtimeScreen() {
  const router = useRouter();
  const { idRealtime, idCondominio } = useLocalSearchParams();
  // idRealtime corrisponde all'idDispositivo
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Richiesta dei dati realtime
  const fetchData = async () => {
    try {
      const response = await api.get(
        `/api/realtime/condominio/${idCondominio}/dispositivo/${idRealtime}`
      );
      setData(response.data);
    } catch (err: any) {
      console.error('Errore durante la richiesta realtime:', err);
      setError('Errore durante la richiesta realtime');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Logout: cancella il token e reindirizza alla pagina di login
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      router.replace('/login');
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  // Funzione per renderizzare i valori sensore di un parametro
  const renderSensorValues = (sensorValues: any[]) => {
    return sensorValues.map((sensor) => (
      <View key={sensor.idSensore} style={styles.sensorContainer}>
        <Text style={styles.sensorText}>Valore: {sensor.valore}</Text>
        <Text style={styles.sensorText}>
          Timestamp: {new Date(sensor.timestamp).toLocaleString()}
        </Text>
      </View>
    ));
  };

  // Renderizza ogni parametro e il relativo valore
  const renderParameter = ({ item }: { item: any }) => (
    <View style={styles.parameterContainer}>
      <Text style={styles.parameterTitle}>{item.parametro.nome}</Text>
      <Text style={styles.parameterSubtitle}>
        {item.parametro.tipologia} ({item.parametro.unitaMisura})
      </Text>
      {renderSensorValues(item.valoriSensore)}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          Realtime - {data?.dispositivo?.nome}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.detailsContainer}>
            <Text style={styles.detailText}>
              Condominio: {data?.condominio?.nome}
            </Text>
            <Text style={styles.detailText}>
              Indirizzo: {data?.condominio?.indirizzo}
            </Text>
          </View>
          <FlatList
            data={data?.parametri}
            keyExtractor={(item) =>
              item.parametro.idParametro.toString()
            }
            renderItem={renderParameter}
            contentContainerStyle={styles.listContainer}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    backgroundColor: '#1A1B41',
    padding: 16,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FF5555',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#1A1B41',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  detailsContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  detailText: {
    fontSize: 18,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  parameterContainer: {
    backgroundColor: '#282961',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  parameterTitle: {
    fontSize: 18,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  parameterSubtitle: {
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
    marginBottom: 8,
  },
  sensorContainer: {
    backgroundColor: '#3A3C6C',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  sensorText: {
    fontSize: 14,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
  },
});
