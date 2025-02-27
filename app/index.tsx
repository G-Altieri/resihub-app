// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Logo from '../assets/images/titleLogin.svg';
import * as SecureStore from 'expo-secure-store'; // <-- Per memorizzare il token in modo sicuro

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('giovanni');
  const [password, setPassword] = useState('ciao');

  async function saveToken(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  const handleLogin = async () => {
    try {
      // Crea i parametri in formato URL encoded
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);

      // 1. Invia la richiesta POST con username e password
      const response = await fetch('http://192.168.1.7:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        throw new Error('Credenziali non valide');
      }

      // 2. Ricevi la risposta con il token
      const data = await response.json();
      const token = data.token; // Assicurati di usare la chiave corretta (es. "token" o "accessToken")

      // 3. Salva il token in modo sicuro
      await saveToken('userToken', token);

      // 4. Naviga alla pagina home
      router.push('/home');
    } catch (error) {
      console.error('Errore durante il login:', error);
      // gestisci eventuali errori (es. mostra un messaggio all’utente)
    }
  };

  const handleForgotPassword = () => {
    console.log('Hai cliccato su "Password dimenticata?"');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" style="light" />

      <Image
        source={require('../assets/images/SfondoAutenticazione2.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      <View style={styles.topContainer}>
        <View style={styles.logoWrapper}>
          <Logo width="100%" height={209} />
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <Text style={styles.title}>LOGIN</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="esempio@gmail.com"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="******"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Password dimenticata?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogin}>
          <LinearGradient
            colors={['#BAFF29', '#70A600']}
            start={[0, 0]}
            end={[1, 0]}
            style={styles.button}
          >
            <Text style={styles.buttonText}>ACCEDI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topContainer: {
    flex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoWrapper: {
    width: '100%',
    maxWidth: 400,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  bottomContainer: {
    flex: 5,
    backgroundColor: '#1A1B41',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 24,
    paddingTop: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 30,
    marginBottom: 16,
    textAlign: 'center',
    color: '#F1FFE7',
    fontFamily: 'Poppins-Bold',
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: '#F1FFE7',
    fontFamily: 'Poppins-SemiBold',
    marginLeft: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#6290C3',
    padding: 12,
    marginBottom: 12,
    borderRadius: 25,
    backgroundColor: '#282961',
    color: '#F1FFE7',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginRight: 16,
  },
  forgotPasswordText: {
    color: '#F1FFE7',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  button: {
    padding: 6,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#1A1B41',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
});
