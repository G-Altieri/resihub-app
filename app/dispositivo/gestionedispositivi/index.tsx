'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Alert,
  Image,
  StyleProp,
  ImageStyle,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../../scripts/request';
import { getBackgroundImage } from '../../../components/bgDinamicoDispositivi';

interface Parametro {
  idParametro: number;
  nome: string;
  tipologia: string;
  // Altri campi se necessario...
}

interface Dispositivo {
  idDispositivo: number;
  nome: string;
  marca: string;
  modello: string;
  tipo: string;
  stato: string;
  // L'API restituisce il campo "parametri"
  parametri?: Parametro[] | null;
}

interface Condominio {
  idCondominio: number;
  nome: string;
  indirizzo: string;
  annoCostruzione: number;
  classeEnergetica: string;
  numeroPiani: number;
  regolamenti: string;
  superficie: number;
  unitaAbitative: number;
  latitudine: number;
  longitudine: number;
}

interface CondominioResponse {
  condominio: Condominio;
  user: any; // Se necessario, definisci un'interfaccia specifica per l'utente
  dispositivi: Dispositivo[];
}

export default function DispositiviScreen() {
  const router = useRouter();
  // Recupera il parametro "data" passato via route (che contiene dati condominiali)
  const localParams = useLocalSearchParams() as any;
  const dataParam = localParams.data;

  const [devices, setDevices] = useState<Dispositivo[]>([]);
  const [condominio, setCondominio] = useState<Condominio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Recupera i dispositivi dall'API, aspettandosi una risposta con "condominio" e "dispositivi"
  const fetchDevices = async (idCondominio: number) => {
    try {
      const response = await api.get<CondominioResponse>(`/api/condomini/${idCondominio}/dispositivi`);
     // console.log("API response:", response.data);
      setDevices(response.data.dispositivi);
      setCondominio(response.data.condominio);
    } catch (err) {
      console.error('Errore durante il recupero dei dispositivi:', err);
      setError('Errore durante il recupero dei dispositivi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dataParam) {
      try {
        // Se dataParam è una stringa JSON, lo parsiamo; altrimenti lo usiamo direttamente
        const parsedData: CondominioResponse =
          typeof dataParam === 'string' ? JSON.parse(dataParam) : dataParam;
        // Aggiorna lo stato del condominio (in alternativa puoi usare solo il dato dell'API)
        setCondominio(parsedData.condominio);
       // console.log("parsedData.condominio.idCondominio", parsedData.condominio.idCondominio);
        // Effettua la GET usando l'id del condominio
        fetchDevices(parsedData.condominio.idCondominio);
      } catch (error) {
        console.error("Errore nel parsing dei dati:", error);
        setError("Dati non validi");
        setLoading(false);
      }
    } else {
      setError("Nessun dato ricevuto");
      setLoading(false);
    }
  }, [dataParam]);

  // Filtra i dispositivi in base al testo inserito nella barra di ricerca
  const filteredDevices = devices.filter(device =>
    device.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deleteDevice = async (idDispositivo: number) => {
    try {
      await api.delete(`/api/dispositivi/${idDispositivo}`);
      setDevices(devices.filter(device => device.idDispositivo !== idDispositivo));
    } catch (err) {
      console.error('Errore durante l\'eliminazione del dispositivo:', err);
      Alert.alert('Errore', 'Impossibile eliminare il dispositivo');
    }
  };

  const renderDevice = ({ item }: { item: Dispositivo }) => (
    <View style={styles.deviceCard}>
      <Text style={styles.deviceName}>{item.nome}</Text>
      <Text style={styles.deviceInfo}>Marca: {item.marca}</Text>
      <Text style={styles.deviceInfo}>Modello: {item.modello}</Text>
      <Text style={styles.deviceInfo}>Tipo: {item.tipo}</Text>
      <Text style={styles.deviceInfo}>Stato: {item.stato}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/dispositivo/gestionedispositivi/editDevice',
              params: {
                idDispositivo: item.idDispositivo.toString(),
                idCondominio: condominio?.idCondominio.toString(),
              },
            })
          }
        >
          <Text style={styles.buttonText}>Modifica</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              'Conferma Eliminazione',
              'Sei sicuro di voler eliminare questo dispositivo?',
              [
                { text: 'Annulla', style: 'cancel' },
                { text: 'Elimina', onPress: () => deleteDevice(item.idDispositivo) },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>Elimina</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.paramTitle}>Parametri:</Text>
      {item.parametri && item.parametri.length > 0 ? (
        item.parametri.map(param => (
          <Text key={param.idParametro} style={styles.paramText}>
            - {param.nome} 
          </Text>
        ))
      ) : (
        <Text style={styles.paramText}>Nessun parametro disponibile</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Image
        source={getBackgroundImage('default')}
        style={StyleSheet.absoluteFill as StyleProp<ImageStyle>}
        resizeMode="contain"
      />

      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          {condominio ? `Dispositivi di ${condominio.nome}` : 'Dispositivi del Condominio'}
        </Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBarInput}
          placeholder="Cerca dispositivo..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#70A600" style={styles.loader} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredDevices}
          keyExtractor={item => item.idDispositivo.toString()}
          renderItem={renderDevice}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: '/dispositivo/gestionedispositivi/addDevice',
            params: { idCondominio: condominio?.idCondominio.toString() },
          })
        }
      >
        <Text style={styles.addButtonText}>Aggiungi Dispositivo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41',
    paddingTop: 90,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 8,
    color: '#fff',
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
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  deviceCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#ECECEC',
    marginBottom: 8,
  },
  deviceInfo: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#ECECEC',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#BAFF29',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  deleteButton: {
    backgroundColor: '#FF5555',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#1A1B41',
  },
  paramTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginTop: 10,
  },
  paramText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    marginLeft: 10,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#BAFF29',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 20,
    marginHorizontal: 16,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#1A1B41',
  },
});
