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

export default function ValoreSensoreScreen() {
  const router = useRouter();
  const { idValoreSensore, idCondominio, idDispositivo } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Richiesta dei dati del parametro e dei relativi valori sensore
  const fetchData = async () => {
    try {
      const response = await api.get(
        `/api/general/condominio/${idCondominio}/dispositivo/${idDispositivo}/parametro/${idValoreSensore}`
      );
      setData(response.data);
    } catch (err: any) {
      console.error('Errore durante la richiesta dei dati:', err);
      setError('Errore durante la richiesta dei dati');
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

  // Renderizza ogni valore sensore
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.sensorItem}>
      <Text style={styles.sensorText}>Valore: {item.valore}</Text>
      <Text style={styles.sensorText}>
        Timestamp: {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          Parametro: {data?.parametro?.nome}
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
              Tipologia: {data?.parametro?.tipologia}
            </Text>
            <Text style={styles.detailText}>
              Unità di misura: {data?.parametro?.unitaMisura}
            </Text>
          </View>
          <FlatList
            data={data?.valoriSensore}
            keyExtractor={(item) => item.idSensore.toString()}
            renderItem={renderItem}
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
    alignItems: 'center',
  },
  sensorItem: {
    backgroundColor: '#282961',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  sensorText: {
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
  },
});
