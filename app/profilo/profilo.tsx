'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../scripts/request';
import * as SecureStore from 'expo-secure-store';
import { getBackgroundImage } from './../../components/bgDinamicoDispositivi';
import Avatar from '../../assets/svg/avatar.svg';

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Funzione per recuperare i dati dell'utente
  const fetchUserData = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const response = await api.get('/auth/profile', { // Assicurati che questo endpoint esista sul server
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserData(response.data);
    } catch (err) {
      console.error('Errore durante il recupero dei dati utente:', err);
      setError('Errore durante il recupero dei dati utente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Image source={getBackgroundImage("profilo")} style={StyleSheet.absoluteFill} resizeMode="contain" />
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      </View>
    );
  }

  if (error || !userData) {
    return (
      <View style={styles.container}>
        <Image source={getBackgroundImage("profilo")} style={StyleSheet.absoluteFill} resizeMode="contain" />
        <Text style={styles.errorText}>{error || 'Nessun dato disponibile'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={getBackgroundImage("profilo")} style={StyleSheet.absoluteFill} resizeMode="contain" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <Avatar style={styles.avatar} width={120} height={120} />

          <Text style={styles.userName}>{userData.nome} {userData.cognome}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email:</Text> {userData.email}
          </Text>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Numero di Telefono:</Text> {userData.numeroDiTelefono}
          </Text>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Condomini Gestiti:</Text> {userData.numeroCondominiGestiti}
          </Text>
          <Text style={styles.infoItem}>
            <Text style={styles.infoLabel}>Data di Nascita:</Text> {new Date(userData.dataNascita).toLocaleDateString('it-IT')}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    backgroundColor: '#1A1B41',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ECECEC',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderColor: '#680092',
    borderWidth: 2,
    borderRadius: 10,
    width: '100%',
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Poppins-Bold',
  },
  logoutButton: {
    backgroundColor: '#C1292E',
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
});
