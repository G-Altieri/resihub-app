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
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import api from '../../scripts/request';
import * as SecureStore from 'expo-secure-store';
import { List } from 'react-native-paper';

// Import degli SVG per le icone
import LogoCondominioIcon from '../../assets/svg/logoCondominio.svg';
import CondMarkerIcon from '../../assets/svg/condMarker.svg';
import CondEnergiaIcon from '../../assets/svg/condEnergia.svg';
import CondPersoneIcon from '../../assets/svg/condPersone.svg';
import CondScaleIcon from '../../assets/svg/condScale.svg';
import CondSuperficieIcon from '../../assets/svg/condSuperficie.svg';
import CondRegoleIcon from '../../assets/svg/condRegole.svg';

export default function CondominioScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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
            idCondominio: idCondominio,
          },
        })
      }
      style={styles.itemContainer}
    >
      <Text style={styles.itemTitle}>{item.nome}</Text>
      <Text style={styles.itemAddress}>{item.tipo}</Text>
    </TouchableOpacity>
  );

  // Componente header per la FlatList (contiene l'infobox e altri elementi se necessari)
  const ListHeader = () => (
    <>
      {/* Riquadro bianco (in questo caso semi-trasparente) con le informazioni del condominio */}
      <View style={styles.infoBox}>
        {/* Nome del condominio */}
        <View style={styles.infoRow}>
          <LogoCondominioIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>{data.condominio.nome}</Text>
        </View>
        {/* Posizione */}
        <View style={styles.infoRow}>
          <CondMarkerIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>{data.condominio.indirizzo}</Text>
        </View>
        {/* Classe energetica */}
        <View style={styles.infoRow}>
          <CondEnergiaIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>
            Classe energetica: {data.condominio.classeEnergetica}
          </Text>
        </View>
        {/* Numero di unità abitative */}
        <View style={styles.infoRow}>
          <CondPersoneIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>
            Unità abitative: {data.condominio.unitaAbitative}
          </Text>
        </View>
        {/* Numero di piani */}
        <View style={styles.infoRow}>
          <CondScaleIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>
            Numero di piani: {data.condominio.numeroPiani}
          </Text>
        </View>
        {/* Superficie */}
        <View style={styles.infoRow}>
          <CondSuperficieIcon width={20} height={20} style={styles.icon} />
          <Text style={styles.infoText}>
            Superficie: {data.condominio.superficie} m²
          </Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/SfondoResidenza.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={data?.dispositivi}
          keyExtractor={(item) => item.idDispositivo.toString()}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContainer}
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
    justifyContent: 'center',
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
  infoBox: {
    marginTop: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
    // Assicura che l'icona sia centrata verticalmente
    alignSelf: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  accordion: {
    backgroundColor: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
    // Impostato per far partire gli elementi dalla larghezza completa
    width: '100%',
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
