'use client';

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';
import api from '../../scripts/request';
import * as SecureStore from 'expo-secure-store';
import { SvgProps } from 'react-native-svg';

// Icone già presenti per l'header
import LogoCondominioIcon from '../../assets/svg/logoCondominio.svg';
import CondMarkerIcon from '../../assets/svg/condMarker.svg';
import CondEnergiaIcon from '../../assets/svg/condEnergia.svg';
import CondPersoneIcon from '../../assets/svg/condPersone.svg';
import CondScaleIcon from '../../assets/svg/condScale.svg';
import CondSuperficieIcon from '../../assets/svg/condSuperficie.svg';
import CondRegoleIcon from '../../assets/svg/condRegole.svg';

// Icone per le categorie della grid
import CondCalore from '../../assets/svg/condCalore.svg';
import CondEnergiaBox from '../../assets/svg/condEnergiaBox.svg';
import CondCollonnine from '../../assets/svg/condCollonnine.svg';
import CondClima from '../../assets/svg/condClima.svg';
import CondDispositivo from '../../assets/svg/condDispositivo.svg';

const ICON_SIZE = 40;

export default function CondominioScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { idCondominio } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch dei dati del condominio
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

  // Logout
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      router.replace('/login');
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  // Conta quanti dispositivi appartengono a una determinata categoria
  const countDevices = (category: string) => {
    if (!data || !data.dispositivi) return 0;
    return data.dispositivi.filter((d: any) => d.tipo === category).length;
  };

  // Riguadro delle info (senza il nome, che verrà visualizzato sopra)
  const InfoBox = () => (
    <View style={styles.infoBox}>
      <View style={styles.infoRow}>
        <CondMarkerIcon width={20} height={20} style={styles.icon} />
        <Text style={styles.infoText}>{data.condominio.indirizzo}</Text>
      </View>
      <View style={styles.infoRow}>
        <CondEnergiaIcon width={20} height={20} style={styles.icon} />
        <Text style={styles.infoText}>
          Classe energetica: {data.condominio.classeEnergetica}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <CondPersoneIcon width={20} height={20} style={styles.icon} />
        <Text style={styles.infoText}>
          Unità abitative: {data.condominio.unitaAbitative}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <CondScaleIcon width={20} height={20} style={styles.icon} />
        <Text style={styles.infoText}>
          Numero di piani: {data.condominio.numeroPiani}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <CondSuperficieIcon width={20} height={20} style={styles.icon} />
        <Text style={styles.infoText}>
          Superficie: {data.condominio.superficie} m²
        </Text>
      </View>
    </View>
  );

  // Componente per ogni categoria, ora con la proprietà IconComponent
  // Componente per ogni categoria, ora cliccabile
  const GridItem = ({
    color,
    title,
    subtitle,
    titleFontSize,
    subtitleFontSize,
    IconComponent,
    style,
  }: {
    color: string;
    title: string;
    subtitle: string;
    titleFontSize: number;
    subtitleFontSize: number;
    IconComponent: React.FC<SvgProps>;
    style?: any;
  }) => {
    // Funzione per generare il percorso di navigazione: rimuove spazi
    const getRouteName = (title: string) =>
      title.replace(/\s+/g, '').toLowerCase();

    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: `/dispositivo/${getRouteName(title)}` as any,
            params: { data: JSON.stringify(data) },
          })
        }
        style={[styles.gridItem, { backgroundColor: color }, style]}>
        <IconComponent width={ICON_SIZE} height={ICON_SIZE} />
        <View style={styles.textContainer}>
          <Text style={[styles.gridTitle, { fontSize: titleFontSize }]}>
            {title}
          </Text>
          <Text style={[styles.gridSubtitle, { fontSize: subtitleFontSize }]}>
            {subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };


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
        <>
          {/* Nome del condominio fuori dal primo riguadro nero */}
          <Text style={styles.condominioName}>{data.condominio.nome}</Text>

          {/* Riguadro nero con le info del condominio */}
          <InfoBox />

          {/* Titolo della sezione categorie */}
          <Text style={styles.sectionTitle}>Categorie di Dispositivi</Text>

          {/* Riguadro nero con le categorie */}
          <View style={styles.gridContainer}>
            {/* Prima riga: 2 categorie */}
            <View style={styles.gridRow}>
              <GridItem
                color="#C1292E"
                title="Calore"
                subtitle={`${countDevices("Calore")} Dispositivi`}
                titleFontSize={20}
                subtitleFontSize={14}
                IconComponent={CondCalore}
              />
              <GridItem
                color="#2987C1"
                title="Energia"
                subtitle={`${countDevices("Energia")} Dispositivi`}
                titleFontSize={20}
                subtitleFontSize={14}
                IconComponent={CondEnergiaBox}
                style={{ marginLeft: 8 }}
              />
            </View>
            {/* Seconda riga: 2 categorie */}
            <View style={[styles.gridRow, { marginTop: 8 }]}>
              <GridItem
                color="#31C129"
                title="Ambiente Clima"
                subtitle={`${countDevices("Ambiente e Clima")} Dispositivi`}
                titleFontSize={16}
                subtitleFontSize={14}
                IconComponent={CondClima}
              />
              <GridItem
                color="#C1A329"
                title="Colonnine"
                subtitle={`${countDevices("Colonnina")} Postazioni`}
                titleFontSize={17}
                subtitleFontSize={14}
                IconComponent={CondCollonnine}
                style={{ marginLeft: 8 }}
              />
            </View>
            {/* Terza riga: 5° categoria che occupa tutto il rigo */}
            <View style={styles.fullRow}>
              <GridItem
                color="#616161"
                title="Gestione Dispositivi"
                subtitle={`${countDevices("Gestione Dispositivi")} Postazioni`}
                titleFontSize={17}
                subtitleFontSize={14}
                IconComponent={CondDispositivo}
              />
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    padding: 16,
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
  condominioName: {
    fontSize: 25,
    fontFamily: 'Poppins-Bold',
    color: '#F1FFE7',
    textAlign: 'center',
    marginBottom: 0,
    marginTop: 14,
  },
  infoBox: {
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
    alignSelf: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
    color: '#F1FFE7',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
  },
  fullRow: {
    marginTop: 8,
    height: 70,
  },
  gridItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  textContainer: {
    marginLeft: 10,
  },
  gridTitle: {
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
  },
  gridSubtitle: {
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
});
