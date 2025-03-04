'use client';

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import api from '../../scripts/request';
import { getBackgroundImage } from '@/components/bgDinamicoDispositivi';

interface Amministratore {
  id: number;
  username: string;
  nome: string;
  cognome: string;
  email: string;
  numeroDiTelefono: string;
  dataNascita: string;
}

interface Condominio {
  idCondominio: number;
  nome: string;
  indirizzo: string;
  classeEnergetica: string;
  unitaAbitative: number;
  annoCostruzione: number;
  numeroPiani: number;
  superficie: number;
  regolamenti: string;
  latitudine: number;
  longitudine: number;
  amministratore: Amministratore;
}

interface Dispositivo {
  idDispositivo: number;
  nome: string;
  marca: string;
  modello: string;
  tipo: string;
  stato: string;
  condominio: Condominio;
}

export interface NotificationEvent {
  idEvento: number;
  descrizione: string;
  confermaLettura: boolean;
  timestamp: string;
  dispositivo: Dispositivo;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<NotificationEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationEvent | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Recupera le notifiche dall'endpoint
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/api/events/user');
        const data: NotificationEvent[] = response.data;
        setNotifications(data);
        setFilteredNotifications(data);
      } catch (error) {
        console.error('Errore nel recupero delle notifiche:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Aggiorna il filtraggio in base alla search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter((n) =>
        n.descrizione.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotifications(filtered);
    }
  }, [searchQuery, notifications]);

  // Funzione per segnare la notifica come letta (se non lo è già)
  const markAsRead = async (notification: NotificationEvent) => {
    if (!notification.confermaLettura) {
      try {
        const response = await api.put(`/api/events/${notification.idEvento}/markAsRead`);
        const updatedNotification: NotificationEvent = response.data;
        setNotifications((prev) =>
          prev.map((n) =>
            n.idEvento === updatedNotification.idEvento ? updatedNotification : n
          )
        );
        setFilteredNotifications((prev) =>
          prev.map((n) =>
            n.idEvento === updatedNotification.idEvento ? updatedNotification : n
          )
        );
      } catch (error) {
        console.error('Errore nel segnare come letto:', error);
      }
    }
  };

  // Gestisce il click sulla notifica: apre il modal e segna la notifica come letta
  const handleNotificationPress = async (notification: NotificationEvent) => {
    setSelectedNotification(notification);
    setModalVisible(true);
    await markAsRead(notification);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <Image
        source={getBackgroundImage("notifiche")}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      <Text style={styles.title}>Notifiche</Text>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBarInput}
          placeholder="Cerca notifica..."
          placeholderTextColor="#ccc"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButtonText}>X</Text>
          </TouchableOpacity>
        )}
      </View>

      {filteredNotifications.length === 0 ? (
        <Text style={styles.infoText}>Nessuna notifica trovata</Text>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.idEvento.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleNotificationPress(item)}>
              <View style={styles.notificationItem}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationDescription}>{item.descrizione}</Text>
                  {!item.confermaLettura && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal per visualizzare i dettagli della notifica */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedNotification && (
              <>
                <Text style={styles.modalTitle}>Dettagli Notifica</Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: 'bold' }}>Descrizione:</Text> {selectedNotification.descrizione}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: 'bold' }}>Dispositivo:</Text> {selectedNotification.dispositivo?.nome}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={{ fontWeight: 'bold' }}>Timestamp:</Text> {new Date(selectedNotification.timestamp).toLocaleString()}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 90,
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    marginTop: 30,
    fontFamily: 'Poppins-Bold',
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
  infoText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDescription: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#fff',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    marginBottom: 6,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
});
