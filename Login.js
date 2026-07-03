import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, StatusBar, SafeAreaView, ScrollView   } from 'react-native';
import { supabase } from './supabaseClient';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

   useEffect(() => {
    StatusBar.setHidden(true);
    return () => {
      StatusBar.setHidden(false);
    };
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { user, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      if (user) {
        navigation.replace('MainApp');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.login} >
      <View style={styles.frame}>
        <Text style={styles.clarking}>Clarking</Text>
        <Text style={styles.subtitle}>Where language becomes a tool</Text>
        <View style={styles.imageContainer}>
          <Image 
            source={require('./assets/doc.png')}
            style={styles.doctorImage}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="royalblue"
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="royalblue"
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.loginButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>
          </View>
      </View>
  );
};

const styles = StyleSheet.create({
    container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#346DF6',
  },
  login: {
    flex: 1,
    backgroundColor: 'royalblue',
    padding: 22,
  },
  frame: {
    flex: 1,
    backgroundColor: '#346DF6',
    borderRadius: 45,
    alignItems: 'center',
    paddingHorizontal: 65,
    paddingTop: 80,
    paddingBottom: 50,
    justifyContent: 'flex-end',
  },
  clarking: {
    fontSize: 64,
    color: 'white',
    fontFamily: 'Inter',
  },
  subtitle: {
    fontSize: 12,
    color: 'white',
    fontFamily: 'Inter',
    marginTop: 10,
  },
  imageContainer: {
    marginTop: 128,
  },
  doctorImage: {
    width: 248,
    height: 242,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginTop: 10,
    width: '100%',
    borderWidth: 3,
    borderColor: 'cornflowerblue',
    borderRadius: 45,
    backgroundColor: 'white',
  },
  input: {
    width: '100%',
    height: 40,
    paddingHorizontal: 7,
    color: 'royalblue',
    fontFamily: 'Inter',
    fontSize: 12,
  },
  loginButton: {
    marginTop: 25,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter',
  },
});

export default Login;