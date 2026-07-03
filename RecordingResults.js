import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, TextInput, Button } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TranslatingChat from './TranslatingChat';
import { useFocusEffect } from '@react-navigation/native';

const RecordingResults = ({ route, navigation }) => {
  const {languageCode, languageName, translation, API_KEY} = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [issueDescription, setIssueDescription] = useState(''); // State to store the doctor's input
  const [showReplayButton, setshowReplayButton] = useState(false); // State to store the doctor's input


  // console.log("Detected Language", detectedLanguage)
  // console.log("Language Name", languageName)
  // console.log("translation", translation)
  // console.log("navigation", navigation)


  if(translation != ''){
      setshowReplayButton(true);
    }

  useFocusEffect(
    React.useCallback(() => {
      // Reset or reinitialize anything you need here, such as state or data fetching
      console.log("RecordingResults screen focused, reinitializing data");

      return () => {
        // Optional cleanup when leaving screen
      };
    }, [])
  );



  const handleCustomQuestions = () => {
    if (!translation) {
      // If there's no translation, open the modal
      setModalVisible(true);
    } else {
      // If translation is available, proceed as usual
      navigation.navigate('DisplayGeneratedQuestions', {
        languageCode,
        languageName,
        translation,
        API_KEY
      });
    }
  };

  const handleProceedWithCustomQuestions = () => {
    // Close the modal and navigate to the next screen with the issue description
    setModalVisible(false);
    console.log("Navigation currently: ", navigation)
    console.log("before going in detect lasnguage is = ", languageCode)
    navigation.navigate('DisplayGeneratedQuestions', {
      languageCode,
      languageName,
      translation: issueDescription || translation, // Pass issue description if available
      API_KEY
    });
  };

  const naviagte_to_home = () => {
    <TranslatingChat
    navigation={navigation}
    />
  }

  return (
    <LinearGradient
      colors={['rgba(0, 119, 182, 1)', 'rgba(0, 52, 80, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
       {/* Back button */}
        <View style={styles.contentContainer}>
            <View style={styles.topSection}>
            <View style={styles.languageContainer}>
              <Text style={styles.detectedLanguageLabel}>Detected Language:</Text>
              <Text style={styles.detectedLanguage}>{languageName}</Text>
              <Text style={styles.languageCode}>({languageCode})</Text>
              <View style={styles.line} />
            </View>
          </View>

          <View style={styles.middleSection}>
            <Text style={styles.translationLabel}>Translation:</Text>
            <Text style={styles.translationText}>{translation || 'No translation available'}</Text>
            {showReplayButton ? (
            <TouchableOpacity style={styles.button} onPress={handleCustomQuestions}>
              <Text>Confirm</Text>
            </TouchableOpacity>
            ): (
              <Text></Text>
            )}

          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.button} onPress={handleCustomQuestions}>
              <Text style={styles.buttonText}>Use Our Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('OwnQuestions', {
              languageName, API_KEY
            })}>
              <Text style={styles.buttonText}>Use Your Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('FreeStyle', {
              languageName, API_KEY
            })}>
              <Text style={styles.buttonText}>FreeStyle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal for collecting doctor's input */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter a brief description of the issue:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Describe the patient's issue"
                onChangeText={setIssueDescription}
                value={issueDescription}
              />
              <Button title="Proceed" onPress={handleProceedWithCustomQuestions} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  languageContainer: {
    backgroundColor: 'steelblue',
    borderRadius: 57,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  detectedLanguageLabel: {
    fontSize: 18,
    color: 'silver',
    marginBottom: 10,
  },
  detectedLanguage: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  languageCode: {
    fontSize: 16,
    color: 'silver',
    marginTop: 5,
  },
  line: {
    height: 1,
    width: '80%',
    backgroundColor: 'white',
  },
  middleSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  translationLabel: {
    fontSize: 22,
    color: 'silver',
    marginBottom: 10,
    textAlign: 'center',
  },
  translationText: {
    fontSize: 20,
    color: 'white',
    textAlign: 'center',
  },
  bottomSection: {
    marginTop: 20,
  },
  button: {
    borderColor: 'dimgray',
    borderWidth: 1,
    borderRadius: 57,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    width: '100%',
    padding: 10,
    marginBottom: 20,
  },
});

export default RecordingResults;
