'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../scripts/request';
import * as SecureStore from 'expo-secure-store';
import { getBackgroundImage } from './../../components/bgDinamicoDispositivi';
import ProgressRing from '../../components/ProgressRing'; // Assicurati che il percorso sia corretto

export default function RealtimeScreen() {
  const router = useRouter();
  const { idRealtime, idCondominio } = useLocalSearchParams();
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

  // Renderizza ogni parametro come box di misurazione aggiornato
  const renderParameterItem = ({ item }: { item: any }) => {
    // Ordina i valori sensore per timestamp e prendi l'ultimo valore
    const sortedValues = item.valoriSensore.sort(
      //@ts-ignore
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const lastMeasurement = sortedValues[sortedValues.length - 1];
    const lastValueNum = parseFloat(lastMeasurement.valore);
    const measurementDate = new Date(lastMeasurement.timestamp);
    const formattedDate = measurementDate.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const formattedTime = measurementDate.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.sectionBoxUltimaMisurazione}>
        {/* Mostra il nome del parametro e la sua descrizione */}
        <Text style={styles.headerTitle}>{item.parametro.nome}</Text>
        <Text style={styles.headerDescription}>{item.parametro.tipologia}</Text>
        <ProgressRing
          size={150}
          strokeWidth={10}
          progress={lastValueNum}
          min={item.parametro.valMin}
          max={item.parametro.valMax}
          centerText={`${lastValueNum} ${item.parametro.unitaMisura}`}
        />
        <View style={styles.measurementLabels}>
          <Text style={styles.labelText}>
            Min: {item.parametro.valMin} {item.parametro.unitaMisura}
          </Text>
          <Text style={styles.labelText}>
            Max: {item.parametro.valMax} {item.parametro.unitaMisura}
          </Text>
        </View>
        <Text style={styles.measurementDate}>
          Misurato il: {formattedDate} - {formattedTime}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Image
          source={getBackgroundImage()}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Image
          source={getBackgroundImage()}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
        <Text style={styles.errorText}>{error || 'Nessun dato disponibile'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={getBackgroundImage()}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />
      <FlatList
        data={data?.parametri}
        keyExtractor={(item) => item.parametro.idParametro.toString()}
        renderItem={renderParameterItem}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={() => (
          <Text style={styles.deviceTitle}>{data?.dispositivo?.nome}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    backgroundColor: '#1A1B41',
  },
  deviceTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#ECECEC',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
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
    paddingHorizontal: 16,
  },
  sectionBoxUltimaMisurazione: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    marginTop: 16,
    borderColor: '#BAFF29',
    borderWidth: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#ECECEC',
    marginBottom: 4,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    marginBottom: 10,
    textAlign: 'center',
  },
  measurementLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  labelText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
  },
  measurementDate: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
    textAlign: 'center',
  },
});
