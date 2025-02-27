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
import { useRouter } from 'expo-router';
import api from '../scripts/request';
import * as SecureStore from 'expo-secure-store';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Effettua la richiesta GET alla rotta protetta
  const fetchData = async () => {
    try {
      const response = await api.get('/api/condomini/my');
      setData(response.data);
    } catch (err: any) {
      console.error('Errore durante la richiesta protetta:', err);
      setError('Errore durante la richiesta protetta');
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

  // Calcola il saluto in base all'orario
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buongiorno' : 'Buonasera';
  const username = data?.user?.username || '';

  // Renderizza ogni condominio come elemento cliccabile
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push({
        pathname: '/condominio/[id]',
        params: { id: item.idCondominio.toString() },
      })}
      style={styles.itemContainer}
    >
      <Text style={styles.itemTitle}>{item.nome}</Text>
      <Text style={styles.itemAddress}>{item.indirizzo}</Text>
    </TouchableOpacity >
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          {greeting}, {username}
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
        <FlatList
          data={data?.condomini}
          keyExtractor={(item) => item.idCondominio.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
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
