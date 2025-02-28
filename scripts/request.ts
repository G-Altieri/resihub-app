import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { authEmitter, logout } from '../utils/auth';

const api = axios.create({
  baseURL: 'http://192.168.1.7:8080', // modifica in base al tuo ambiente 192.168.104.250
});

// Interceptor per aggiungere l'header Authorization
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor per gestire errori di risposta
api.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Se il token non è valido o è scaduto:
      await logout();
    }
    return Promise.reject(error);
  }
);

export default api;