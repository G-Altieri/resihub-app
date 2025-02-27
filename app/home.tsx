// app/home.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import api from '../scripts/request'; // Assicurati che il percorso sia corretto

export default function HomeScreen() {
  const [responseText, setResponseText] = useState<string>('');

  const handleProtectedRequest = async () => {
    try {
      // Effettua una richiesta GET alla rotta protetta /test
      const response = await api.get('/test');
      // Supponiamo che la risposta sia un semplice testo o un oggetto con una proprietà 'message'
      // Puoi personalizzare in base al formato della risposta
      setResponseText(response.data.message || response.data);
    } catch (error) {
      console.error('Errore nella richiesta protetta:', error);
      setResponseText('Errore durante la richiesta protetta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Benvenuto nella Home!</Text>
      <Text>Questa è la schermata principale della tua app.</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleProtectedRequest}>
        <Text style={styles.buttonText}>Esegui richiesta protetta</Text>
      </TouchableOpacity>

      {responseText !== '' && (
        <Text style={styles.responseText}>{responseText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#70A600',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  responseText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
