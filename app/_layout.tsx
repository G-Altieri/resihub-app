// app/_layout.tsx
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { authEmitter } from '../utils/auth';
import CustomHeader from '../components/CustomHeader';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-BlackItalic': require('../assets/fonts/Poppins-BlackItalic.ttf'),
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
  });

  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkToken() {
      const token = await SecureStore.getItemAsync('userToken');
      setInitialRoute(token ? 'home' : 'login');
    }
    checkToken();
  }, []);

  // Ascolta l'evento di logout
  useEffect(() => {
    const handleLogout = () => {
      router.replace("/login");
    };

    authEmitter.on('logout', handleLogout);
    return () => {
      authEmitter.off('logout', handleLogout);
    };
  }, [router]);

  if (!fontsLoaded || initialRoute === null) {
    return null;
  }



  return (
    <>
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <Stack
        initialRouteName={initialRoute}
        screenOptions={{
          // Imposta l'header trasparente (il BlurView farà da sfondo)
          animation: 'fade', // nessuna animazione
          animationDuration: 100, // durata in millisecondi, regolabile
          contentStyle: { backgroundColor: '#1A1B41' },
          headerStyle: { backgroundColor: '#f4511e' },
          headerTintColor: '#fff',
          headerTransparent: true,
          header: (props) => {
            // Puoi passare il titolo della pagina tramite le opzioni o ottenere altri dati
            const title = props.options.title || props.route.name;
            return <CustomHeader title={title} />;
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false}} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="condominio/[idCondominio]" options={{ title: 'Residenza' }} />
        <Stack.Screen name="dispositivo/[idDispositivo]" options={{ title: 'Dispositivo' }} />
        <Stack.Screen name="valoreSensore/[idValoreSensore]" options={{ title: 'Sensore' }} />
        <Stack.Screen name="realtime/[idRealtime]" options={{ title: 'RealTime' }} />
        <Stack.Screen name="+not-found" options={{ title: 'Pagina non trovata' }} />
      </Stack>
    </>
  );
}
