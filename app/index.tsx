'use client';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet,Image } from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Nascondi la header per questa pagina
export const unstable_settings = {
  headerShown: false,
};

export default function SplashScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadResources() {
      // Esegui il caricamento di risorse, ad esempio controlla il token
      const token = await SecureStore.getItemAsync('userToken');

      // Simula un ritardo per far vedere l'animazione (facoltativo)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Una volta completato il caricamento, reindirizza alla pagina appropriata
      if (token) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
      setIsLoading(false);
    }
    loadResources();
  }, [router]);

  // Finché non sono state caricate tutte le risorse, mostra l'animazione Lottie
  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" style="light" />

        <Image
          source={require('../assets/images/SfondoAutenticazione2.jpg')}
          style={StyleSheet.absoluteFill}
          resizeMode="contain"
        />
        <LottieView
          source={require('../assets/lottie/your-logo.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    );
  }

  // Il componente non renderizza nulla una volta che il redirect è stato fatto
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1B41', // o il colore di sfondo che preferisci
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottie: {
    width: 200,
    height: 200,
  },
});
