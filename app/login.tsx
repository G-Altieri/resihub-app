'use client';

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Logo from '../assets/images/titleLogin.svg';
import api from '../scripts/request';
import * as SecureStore from 'expo-secure-store';
import { Provider, Portal, Dialog, Paragraph, Button } from 'react-native-paper';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('giovanni');
  const [password, setPassword] = useState('ciao');
  const [errorMessage, setErrorMessage] = useState('');
  const [visible, setVisible] = useState(false);

  async function saveToken(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  const handleLogin = async () => {
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', username);
      formBody.append('password', password);

      const response = await api.post('/auth/login', formBody.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const data = response.data;
      const token = data.token;
      await saveToken('userToken', token);

      // Naviga alla pagina home
      router.push('/home');
    } catch (error: any) {
      console.error('Errore durante il login:', error);
      // Mostra il pop-up con il messaggio d'errore
      setErrorMessage(error.message || 'Errore durante il login');
      setVisible(true);
    }
  };

  const handleForgotPassword = () => {
    console.log('Hai cliccato su "Password dimenticata?"');
  };

  return (
    <Provider>
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

      {/* Pop-up per mostrare l'errore */}
      <Portal>
        <Dialog 
          visible={visible} 
          onDismiss={() => setVisible(false)} 
          style={dialogStyles.dialog}
        >
          <Dialog.Title style={dialogStyles.title}>Errore</Dialog.Title>
          <Dialog.Content>
            <Paragraph style={dialogStyles.paragraph}>{errorMessage}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => setVisible(false)}
              mode="contained"
              style={dialogStyles.button}
              labelStyle={dialogStyles.buttonLabel}
            >
              OK
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
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
    color: '#ECECEC',
    fontFamily: 'Poppins-Bold',
  },
  label: {
    marginBottom: 4,
    fontSize: 16,
    color: '#ECECEC',
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
    color: '#ECECEC',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginRight: 16,
  },
  forgotPasswordText: {
    color: '#ECECEC',
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

const dialogStyles = StyleSheet.create({
  dialog: {
    backgroundColor: '#1A1B41',
    borderColor: '#FF5555',
    borderWidth: 1,
  },
  title: {
    color: '#FF5555',
    fontFamily: 'Poppins-Bold',
  },
  paragraph: {
    color: '#ECECEC',
    fontFamily: 'Poppins-Regular',
  },
  button: {
    backgroundColor: '#FF5555',
    borderRadius: 25,
    marginRight: 10,
  },
  buttonLabel: {
    color: '#1A1B41',
    fontFamily: 'Poppins-Bold',
  },
});
