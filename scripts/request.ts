// src/api/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Crea l'istanza Axios con la base URL del tuo server
const api = axios.create({
  baseURL: 'http://192.168.1.7:8080', // modifica in base al tuo ambiente
});

// Intercettore per aggiungere l'header Authorization
api.interceptors.request.use(
  async (config) => {
    // Recupera il token dal SecureStore
    const token = await SecureStore.getItemAsync('userToken');
    if (token && config.headers) {
      // Aggiungi l'header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Gestisci errori nella richiesta (opzionale)
    return Promise.reject(error);
  }
);

export default api;
