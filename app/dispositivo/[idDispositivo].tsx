'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  TextInput,
  FlatList,
  ImageSourcePropType,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../scripts/request';
import { getBackgroundImage } from './../../components/bgDinamicoDispositivi';

// Import delle icone SVG per le info del dispositivo
import MarcaIcon from '../../assets/svg/sensore/marca.svg';
import ModelloIcon from '../../assets/svg/sensore/modello.svg';
import TipoIcon from '../../assets/svg/sensore/tipologia.svg';
import StatoIcon from '../../assets/svg/sensore/stato.svg';
import ColIcon from '../../assets/svg/condCollonnine2.svg';

// Import dell'icona per il pulsante Realtime
import RealtimeIcon from '../../assets/svg/realtime.svg';

// Definizione delle interfacce per il dispositivo e i suoi parametri
interface Dispositivo {
  nome: string;
  marca: string;
  modello: string;
  tipo: string;
  stato: string;
}

interface Parametro {
  idParametro: number;
  nome: string;
  tipologia: string;
  valori?: number[];
}

interface DispositivoResponse {
  dispositivo: Dispositivo;
  parametri: Parametro[];
}

interface LocalSearchParams {
  idDispositivo: string;
  idCondominio: string;
}

export default function DispositivoScreen() {
  const router = useRouter();
  const { idDispositivo, idCondominio } = useLocalSearchParams() as any;
  const [data, setData] = useState<DispositivoResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Richiesta dei dati del dispositivo
  const fetchData = async () => {
    try {
      const response = await api.get<DispositivoResponse>(
        `/api/general/condominio/${idCondominio}/dispositivo/${idDispositivo}`
      );
      setData(response.data);
    } catch (err) {
      console.error('Errore durante la richiesta dei dati:', err);
      setError('Errore durante la richiesta dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Navigazione verso la pagina Realtime
  const handleRealtime = () => {
    router.push({
      pathname: '../realtime/[idRealtime]',
      params: {
        idRealtime: idDispositivo,
        idCondominio: idCondominio,
      },
    });
  };

  // Navigazione verso la pagina Sessioni di Ricarica (solo per Colonnine)
  const handleColonnine = () => {
    router.push({
      pathname: './colonnine/sessioniRicarica/[idSessioniRicarica]',
      params: {
        idSessioniRicarica: idDispositivo,
        idCondominio: idCondominio,
      },
    });
  };

  // Filtra i parametri in base al testo inserito nella barra di ricerca
  const filteredParams =
    data?.parametri?.filter((param) =>
      param.nome.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Renderizza ogni parametro come elemento della FlatList (stile come EnergiaPage)
  const renderParameter = ({ item }: { item: Parametro }) => (
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
    >
      <View style={styles.deviceItem}>
        <Text style={styles.deviceName}>{item.nome}</Text>
        <View style={styles.deviceSubInfo}>
          <Text style={styles.deviceBrand}>{item.tipologia}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sfondo dinamico in base al tipo di dispositivo */}
      <Image
        source={getBackgroundImage(data?.dispositivo?.tipo)}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      {/* ScrollView per rendere tutta la pagina scorrevole */}
      <ScrollView contentContainerStyle={styles.scrollContainer} scrollIndicatorInsets={{ bottom: 50 }}>
        {/* Titolo centrato con il nome del dispositivo */}
        <View style={styles.headerContainer}>
          <Text style={styles.greeting}>{data?.dispositivo?.nome}</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <>
            {/* Box Info Dispositivo con icone */}
            <View style={styles.sectionBox}>
              <Text style={styles.sectionTitle}>Info Dispositivo</Text>
              <View style={styles.infoRow}>
                <MarcaIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.detailText}>Marca: {data?.dispositivo?.marca}</Text>
              </View>
              <View style={styles.infoRow}>
                <ModelloIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.detailText}>Modello: {data?.dispositivo?.modello}</Text>
              </View>
              <View style={styles.infoRow}>
                <TipoIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.detailText}>Tipo: {data?.dispositivo?.tipo}</Text>
              </View>
              <View style={styles.infoRow}>
                <StatoIcon width={20} height={20} style={styles.icon} />
                <Text style={styles.detailText}>Stato: {data?.dispositivo?.stato}</Text>
              </View>
            </View>

            {/* Pulsante Visualizza Realtime */}
            <TouchableOpacity style={styles.realtimeButton} onPress={handleRealtime}>
              <View style={styles.realtimeButtonContent}>
                <RealtimeIcon width={30} height={30} style={styles.realtimeIcon} />
                <Text style={styles.realtimeButtonText}>Dati in Tempo Reale</Text>
              </View>
            </TouchableOpacity>

            {/* Il pulsante Sessioni di Ricarica viene mostrato solo se il dispositivo è di tipo Colonnina */}
            {data?.dispositivo?.tipo.toLowerCase() === 'colonnina' && (
              <TouchableOpacity style={styles.colonninaButton} onPress={handleColonnine}>
                <View style={styles.realtimeButtonContent}>
                  <ColIcon width={30} height={30} style={styles.realtimeIcon} />
                  <Text style={styles.realtimeButtonText}>Sessioni di Ricarica</Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Titolo Lista di Dispositivi */}
            <Text style={styles.listTitle}>Lista di Dispositivi</Text>

            {/* Barra di ricerca per i parametri */}
            <View style={styles.searchBarContainer}>
              <TextInput
                style={styles.searchBarInput}
                placeholder="Cerca parametro..."
                placeholderTextColor="#ccc"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.clearButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Elenco dei parametri filtrati */}
            {filteredParams.length === 0 ? (
              <Text style={styles.infoText}>Nessun parametro trovato</Text>
            ) : (
              <FlatList
                data={filteredParams}
                keyExtractor={(item) => item.idParametro.toString()}
                renderItem={renderParameter}
                scrollEnabled={false}
              />
            )}
          </>
        )}
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
    padding: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 0,
  },
  greeting: {
    fontSize: 24,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 12,
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
  sectionBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    alignItems: 'flex-start',
    marginTop: -10,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    width: '100%',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 18,
    color: '#ECECEC',
    fontFamily: 'Poppins-Regular',
  },
  realtimeButton: {
    width: '100%',
    backgroundColor: '#BAFF29',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },
  colonninaButton: {
    width: '100%',
    backgroundColor: '#FFD014',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
  },

  realtimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  realtimeButtonText: {
    color: '#1A1B41',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    marginLeft: 4,
  },
  realtimeIcon: {},
  listTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 8,
    color: '#fff',
  },
  clearButton: {
    paddingHorizontal: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
  },
  deviceItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  deviceName: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  deviceSubInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deviceBrand: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
});
