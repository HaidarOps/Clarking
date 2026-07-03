import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import {Platform, Text, View, StyleSheet, TextInput, ScrollView, Button} from "react-native";
import Voice from '@react-native-voice/voice';
import { LinearGradient } from 'expo-linear-gradient';


const FreeStyle = ({route, navigation, }) => {
 let [started, setStarted] = useState(false);
  let [results, setResults] = useState([]);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    }
  }, []);

  const startSpeechToText = async () => {
    await Voice.start("en-NZ");
    setStarted(true);
  };

  const stopSpeechToText = async () => {
    await Voice.stop();
    setStarted(false);
  };

  const onSpeechResults = (result) => {
    setResults(result.value);
  };

  const onSpeechError = (error) => {
    console.log(error);
  };

  return (
  <LinearGradient
    colors={['rgba(0, 119, 182, 1)', 'rgba(0, 52, 80, 1)']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <View style={styles.container}>
      {!started ? <Button title='Start Speech to Text' onPress={startSpeechToText} /> : undefined}
      {started ? <Button title='Stop Speech to Text' onPress={stopSpeechToText} /> : undefined}
      {results.map((result, index) => <Text key={index}>{result}</Text>)}
      <StatusBar style="auto" />
    </View>
  </LinearGradient>
);


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: 20,
  },
});

export default FreeStyle;

