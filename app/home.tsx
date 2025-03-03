'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../scripts/request';
import * as SecureStore from 'expo-secure-store';

// Import degli SVG e delle immagini
import LogoCondominio from '../assets/svg/logoCondominio.svg';
import HouseIcon from '../assets/svg/casettaIcon.svg';
import MarkerIcon from '../assets/svg/markerIcon.svg';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Effettua la richiesta GET alla rotta protetta
  const fetchData = async () => {
    try {
      const response = await api.get('/api/general/my');
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


  // All'interno del componente HomeScreen, dichiara l'array delle immagini
  const condoImages = [
    require('../assets/images/condomini/condominio1.png'),
    require('../assets/images/condomini/condominio2.png'),
    require('../assets/images/condomini/condominio3.png'),
    require('../assets/images/condomini/condominio4.png'),
    require('../assets/images/condomini/condominio5.png'),
  ];



  // Renderizza ogni condominio come elemento cliccabile
  const renderItem = ({ item, index }: { item: any; index: number }) => {
    // Seleziona l'immagine in base all'indice (ricomincia se supera il numero di immagini)
    const imageSource = condoImages[index % condoImages.length];

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/condominio/[idCondominio]',
            params: { idCondominio: item.idCondominio.toString() },
          })
        }
        style={styles.itemContainer}
      >
        <Image
          source={imageSource}
          style={styles.condoImage}
          resizeMode="contain"
        />
        <View style={styles.itemContent}>
          <View style={styles.row}>
            <HouseIcon width={20} height={20} style={styles.iconHouse} />
            <Text style={styles.itemTitle}>{item.nome}</Text>
          </View>
          <View style={styles.row}>
            <MarkerIcon width={20} height={20} style={styles.iconMarker} />
            <Text style={styles.itemAddress}>{item.indirizzo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  // Se ci sono più di 3 condomini, aggiungiamo un maxHeight al container
  const listBoxStyle =
    data?.condomini && data.condomini.length > 3
      ? { ...styles.listBox, maxHeight: 350 }
      : styles.listBox;

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/SfondoHome.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      {/* Header personalizzato */}
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>
          {greeting}, {username}
        </Text>
      </View>

      {/* Contenitore semi-trasparente per titolo e lista */}
      <View style={listBoxStyle}>
        <View style={styles.titleContainer}>
          <LogoCondominio width={24} height={24} style={styles.logo} />
          <Text style={styles.titleBoxText}>I Tuoi Condomini</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110, // Distanza dalla navbar
    paddingHorizontal: 16,
    backgroundColor: '#1A1B41',
  },
  headerContainer: {
    marginBottom: 0,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 20,
    color: '#ECECEC',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    marginBottom: 14,
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
  listBox: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logo: {
    marginRight: 8,
  },
  titleBoxText: {
    textAlign: 'left',
    marginBottom: -4,
    fontSize: 18,
    color: '#ECECEC',
    //backgroundColor: '#70A600',
    fontFamily: 'Poppins-SemiBold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 2,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  condoImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconHouse: {
    marginRight: 8,
  },
  iconMarker: {
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
  },
  itemAddress: {
    fontSize: 12,
    color: '#ECECEC',
    fontFamily: 'Poppins-Regular',
  },
});
