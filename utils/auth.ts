// src/utils/auth.ts
import { EventEmitter } from 'events';
import * as SecureStore from 'expo-secure-store';

export const authEmitter = new EventEmitter();

export async function logout() {
  await SecureStore.deleteItemAsync('userToken');
  authEmitter.emit('logout');
}
