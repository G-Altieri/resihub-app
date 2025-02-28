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

export default function CondominioScreen() {
  const router = useRouter();
  const { idCondominio } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Richiesta dei dati del condominio
  const fetchData = async () => {
    try {
      const response = await api.get(`/api/general/condominio/${idCondominio}`);
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

  // Renderizza ogni dispositivo come elemento cliccabile
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '../dispositivo/[idDispositivo]',
          params: {
            idDispositivo: item.idDispositivo.toString(),
            idCondominio: idCondominio
          },
        })
      }
      style={styles.itemContainer}
    >
      <Text style={styles.itemTitle}>{item.nome}</Text>
      <Text style={styles.itemAddress}>{item.tipo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          Condominio: {data?.condominio?.nome}
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
              Indirizzo: {data?.condominio?.indirizzo}
            </Text>
            {data?.condominio?.amministratore && (
              <Text style={styles.detailText}>
                Amministratore: {data.condominio.amministratore.username}
              </Text>
            )}
          </View>
          <FlatList
            data={data?.dispositivi}
            keyExtractor={(item) => item.idDispositivo.toString()}
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
  itemAddress: {
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-Regular',
  },
});
