// app/login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Logo from '../assets/images/titleLogin.svg'; // Il tuo logo in formato SVG

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Logica di autenticazione
    router.push('/home');
  };

  const handleForgotPassword = () => {
    // Logica per "Password dimenticata?"
    console.log('Hai cliccato su "Password dimenticata?"');
  };

  return (
    <View style={styles.container}>
      {/* Rendiamo la StatusBar traslucida in modo che lo sfondo arrivi fino al top */}
      <StatusBar translucent backgroundColor="transparent" style="light" />

      {/* Sfondo JPG a tutto schermo */}
      <Image
        source={require('../assets/images/SfondoAutenticazione2.jpg')}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
      />

      {/* Sezione superiore (50% dello schermo) */}
      <View style={styles.topContainer}>
        <View style={styles.logoWrapper}>
          {/* Il logo si adatterà alla larghezza disponibile, fino a un massimo di 400px */}
          <Logo width="100%" height={209} />
        </View>
      </View>

      {/* Sezione inferiore (50% dello schermo) */}
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

        {/* Scritta "Password dimenticata?" cliccabile */}
        <TouchableOpacity 
          onPress={handleForgotPassword} 
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Password dimenticata?</Text>
        </TouchableOpacity>

        {/* Pulsante Accedi con gradient */}
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
  container: {
    flex: 1,
  },
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
  // Contenitore che allinea a destra la scritta "Password dimenticata?"
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20, // spazio prima del bottone
    marginRight: 16,  // per allinearlo un po' più a destra
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
