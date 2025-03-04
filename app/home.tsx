'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import api from '../scripts/request';
import * as SecureStore from 'expo-secure-store';
import MapView, { Marker } from 'react-native-maps';

// Import degli SVG e delle immagini
import LogoCondominio from '../assets/svg/logoCondominio.svg';
import HouseIcon from '../assets/svg/casettaIcon.svg';
import MarkerIcon from '../assets/svg/markerIcon.svg';

export default function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const mapRef = useRef(null);

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

  // Dopo il caricamento dei dati, anima la mappa sul primo condominio
  useEffect(() => {
    if (data?.condomini && data.condomini.length > 0 && mapRef.current) {
      const newRegion = {
        latitude: parseFloat(data.condomini[0].latitudine) || 45.4642,
        longitude: parseFloat(data.condomini[0].longitudine) || 9.1900,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      //@ts-ignore
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  }, [data]);

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

  // Array delle immagini per i condomini
  const condoImages = [
    require('../assets/images/condomini/condominio1.png'),
    require('../assets/images/condomini/condominio2.png'),
    require('../assets/images/condomini/condominio3.png'),
    require('../assets/images/condomini/condominio4.png'),
    require('../assets/images/condomini/condominio5.png'),
  ];

  // Array di colori per i marker
  const markerColors = ['#C1292E', '#BAFF29', '#6290C3', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];

  // Imposta la regione iniziale (fallback)
  const initialRegion =
    data?.condomini && data.condomini.length > 0
      ? {
          latitude: parseFloat(data.condomini[0].latitudine) || 45.4642,
          longitude: parseFloat(data.condomini[0].longitudine) || 9.1900,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }
      : {
          latitude: 45.4642,
          longitude: 9.1900,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#70A600" />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Nessun dato disponibile'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/SfondoHome.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        {/* Header personalizzato */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>
            {greeting}, {username}
          </Text>
        </View>

        {/* Lista dei condomini */}
        <View style={styles.listBox}>
          <View style={styles.titleContainer}>
            <LogoCondominio width={24} height={24} style={styles.logo} />
            <Text style={styles.titleBoxText}>I Tuoi Condomini</Text>
          </View>
          {data?.condomini.map((item: any, index: number) => (
            <TouchableOpacity
              key={item.idCondominio.toString()}
              onPress={() =>
                router.push({
                  pathname: '/condominio/[idCondominio]',
                  params: { idCondominio: item.idCondominio.toString() },
                })
              }
              style={[
                styles.itemContainer,
                {
                  borderColor: markerColors[index % markerColors.length],
                  borderWidth: 0,
                },
              ]}
            >
              <Image
                source={condoImages[index % condoImages.length]}
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
          ))}
        </View>

        {/* Mappa con i marker dei condomini */}
        <View style={styles.mapContainer}>
          <MapView style={styles.map} initialRegion={initialRegion} ref={mapRef}>
            {data?.condomini.map((condominio: any, index: number) => (
              <Marker
                key={condominio.idCondominio.toString()}
                coordinate={{
                  latitude: parseFloat(condominio.latitudine) || initialRegion.latitude,
                  longitude: parseFloat(condominio.longitudine) || initialRegion.longitude,
                }}
                title={condominio.nome}
                description={condominio.indirizzo}
                pinColor={markerColors[index % markerColors.length]}
                onPress={() =>
                  router.push({
                    pathname: '/condominio/[idCondominio]',
                    params: { idCondominio: condominio.idCondominio.toString() },
                  })
                }
              />
            ))}
          </MapView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    paddingTop: 90,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 20,
    color: '#ECECEC',
    fontFamily: 'Poppins-Regular',
    textAlign: 'left',
    marginBottom: 14,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1B41',
  },
  errorText: {
    color: '#FF5555',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  listBox: {
    paddingVertical: 0,
    borderRadius: 20,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 10,
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
    fontFamily: 'Poppins-SemiBold',
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
  mapContainer: {
    height: 300,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});


