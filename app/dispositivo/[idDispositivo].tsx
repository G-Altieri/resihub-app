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

export default function DispositivoScreen() {
  const router = useRouter();
  const { idDispositivo, idCondominio } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Richiesta dei dati del dispositivo
  const fetchData = async () => {
    try {
      const response = await api.get(
        `/api/general/condominio/${idCondominio}/dispositivo/${idDispositivo}`
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

  // Navigazione verso la pagina Realtime
  const handleRealtime = () => {
    router.push({
      pathname: '../realtime/[idRealtime]',
      params: {
        idRealtime: idDispositivo, // usiamo l'idDispositivo come idRealtime
        idCondominio: idCondominio,
      },
    });
  };

  // Renderizza ogni parametro come elemento cliccabile
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '../valoreSensore/[idValoreSensore]',
          params: {
            idValoreSensore: item.idParametro.toString(),
            idCondominio: idCondominio,
            idDispositivo: idDispositivo,
          },
        })
      }
      style={styles.itemContainer}
    >
      <Text style={styles.itemTitle}>{item.nome}</Text>
      <Text style={styles.itemSubtitle}>{item.tipologia}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          Dispositivo: {data?.dispositivo?.nome}
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
              Marca: {data?.dispositivo?.marca}
            </Text>
            <Text style={styles.detailText}>
              Modello: {data?.dispositivo?.modello}
            </Text>
            <Text style={styles.detailText}>
              Tipo: {data?.dispositivo?.tipo}
            </Text>
            <Text style={styles.detailText}>
              Stato: {data?.dispositivo?.stato}
            </Text>
          </View>

          {/* Pulsante per visualizzare i risultati in realtime */}
          <TouchableOpacity style={styles.realtimeButton} onPress={handleRealtime}>
            <Text style={styles.realtimeButtonText}>Visualizza Realtime</Text>
          </TouchableOpacity>

          <FlatList
            data={data?.parametri}
            keyExtractor={(item) => item.idParametro.toString()}
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
  realtimeButton: {
    backgroundColor: '#70A600',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  realtimeButtonText: {
    color: '#1A1B41',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  listContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  itemContainer: {
    backgroundColor: '#282961',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    width: '100%',
  },
  itemTitle: {
    fontSize: 18,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
  },
});
