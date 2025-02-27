// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';

export default function Layout() {
  // Carichiamo TUTTE le varianti di Poppins dalla cartella ../assets/fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-BoldItalic': require('../assets/fonts/Poppins-BoldItalic.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraBoldItalic': require('../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-LightItalic': require('../assets/fonts/Poppins-LightItalic.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-MediumItalic': require('../assets/fonts/Poppins-MediumItalic.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-SemiBoldItalic': require('../assets/fonts/Poppins-SemiBoldItalic.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
    'Poppins-ThinItalic': require('../assets/fonts/Poppins-ThinItalic.ttf'),
    // Aggiungi qui eventuali altre varianti se presenti
  });

  // Se i font non sono ancora caricati, puoi mostrare uno schermo vuoto o un loader
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: 'Poppins-Bold', // Per l'header, usiamo la variante Bold
          },
        }}
      >
        {/* Pagina di Login senza header */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        {/* Pagina Home */}
        <Stack.Screen
          name="home"
          options={{ title: 'Home' }}
        />
        {/* Altre rotte (es. +not-found) */}
        <Stack.Screen
          name="+not-found"
          options={{ title: 'Pagina non trovata' }}
        />
      </Stack>
    </>
  );
}
