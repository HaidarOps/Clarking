import React, { useState, useEffect,useRef } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet,TextInput, Image, ScrollView, Button, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';


export default function TranslatingChat({ navigation }) {

  const [required_languages] = useState(['Afrikaans', 'Arabic', 'Armenian', 'Azerbaijani', 'Belarusian', 'Bosnian', 'Bulgarian', 'Catalan', 'Chinese', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English', 'Estonian', 'Finnish', 'French', 'Galician', 'German', 'Greek', 'Hebrew', 'Hindi', 'Hungarian', 'Icelandic', 'Indonesian', 'Italian', 'Japanese', 'Kannada', 'Kazakh', 'Korean', 'Latvian', 'Lithuanian', 'Macedonian', 'Malay', 'Marathi', 'Maori', 'Nepali', 'Norwegian', 'Persian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Serbian', 'Slovak', 'Slovenian', 'Spanish', 'Swahili', 'Swedish', 'Tagalog', 'Tamil', 'Thai', 'Turkish', 'Ukrainian', 'Urdu', 'Vietnamese', 'Welsh'])

  const languageCodes = [
  "af", "ar", "hy", "az", "be", "bs", "bg", "ca", "zh", "hr", "cs", "da", 
  "nl", "en", "et", "fi", "fr", "gl", "de", "el", "he", "hi", "hu", "is", 
  "id", "it", "ja", "kn", "kk", "ko", "lv", "lt", "mk", "ms", "mr", "mi", 
  "ne", "no", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw", 
  "sv", "tl", "ta", "th", "tr", "uk", "ur", "vi", "cy"];

  // const data = required_languages.map((language, index) => ({
  // label: languageCodes[index],
  // value: language
  // }));

    const data = required_languages.map((language, index) => ({
  label: language,
  value: languageCodes[index]
  }));

  const [recording, setRecording] = useState();
  const [value, setValue] = useState(null);
  const [languageCode, setLanguageCode] = useState('')
  const [isFocus, setIsFocus] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [modalVisible, setModalVisible] = useState(false);
  const [languageInput, setLanguageInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [languageName, setLanguageName] = useState('');
  const [language, setLanguage] = useState('');
  const [translation, setTranslation] = useState('');
  const [chatTitle, setChatTitle] = useState('');
  const [showResults, setShowResults] = useState(false); // New state to show RecordingResults
  const [showRecordingResults, setShowRecordingResults] = useState(false); // New state to show RecordingResults
  const [shouldNavigate, setShouldNavigate] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false);

  const [paramLanguageCode, setParamLanguageCode] = useState('')
  const [paramLanguageName, setParamLanguageName] = useState('')
  const [paramTranslation, setParamTranslation] = useState('')

  const [questions, setQuestions] = useState({
    detectedLanguage: [], 
    english: []
  });
  const [showButtons, setShowButtons] = useState(false);


  
  const API_KEY = ""

//   useFocusEffect(
//   React.useCallback(() => {
//     setShouldNavigate(false);
//   }, [])
// );

  // This useEffect will navigate when `shouldNavigate` becomes true
  useEffect(() => {
    if (shouldNavigate) {
       handleNavigation()
    }
  }, [shouldNavigate]);


  const handleNavigation = () => {
        navigation.navigate('RecordingResults', {
        languageCode: languageCode,
        languageName: languageName,
        translation: translation,
        API_KEY: API_KEY,
    });
  }

  const toggleRecording = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      console.log("Started recording");
      await startRecording();
    }
    setIsRecording(!isRecording);
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

 async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    await transcribeAudio(uri);
  }

  async function transcribeAudio(uri) {
  const formData = new FormData();
  formData.append('file', {
    uri: uri,
    type: 'audio/mp4',
    name: 'audio.mp4',
  });
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${API_KEY}`,
      },
    });
    setTranscription(response.data.text);
    await processWithChatGPT(response.data.text);
    setShowButtons(true);  // Add this line to show the buttons after processing
  } catch (error) {
    console.error('Error transcribing audio:', error);
  }
}
async function processWithChatGPT(text) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that can detect languages and translate to English. First, identify the language of the given text using its ISO 639-1 code and full name. Then, if it's not in English, translate it to English. If it is in English, simply repeat the original text. Respond in the format: 'Language: [ISO 639-1 code]|[Full Language Name]\nTranslation: [English translation or original text if already in English]'"
        },
        {
          role: "user",
          content: text
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = response.data.choices[0].message.content;
    console.log(result)
    const [languagePart = '', translationPart = ''] = result.split('\n').map(part => part.trim());
    
    let languageCode_temp = '';
    let languageName = '';
    if (languagePart.startsWith('Language: ')) {
      const languageInfo = languagePart.replace('Language: ', '').trim();
      [languageCode_temp, languageName] = languageInfo.split('|').map(str => str.trim());
    }
  const translatedText = translationPart.replace('Translation: ', '').trim();

    // Update state with debug logs for each assignment

    setLanguageCode(languageCode_temp || ''); // Avoid undefined assignment
    setLanguageName(languageName || '');      // Avoid undefined assignment
    setTranslation(translatedText || '');     // Avoid undefined assignment


    console.log('Detected Language Code (temp):', languageCode_temp);
    console.log('Detected Language Name (temp):', languageName);
    console.log('Translated Text:', translatedText);
    setShouldNavigate(true)

    // Navigate after state updates
    // await handleNavigation();
  } catch (error) {
    console.error('Error processing with ChatGPT:', error);
  }
}
async function createTemplate(translation, language) {
   try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates relevant questions based on a given text. Generate 5 questions in 
          ${language === 'en' ? 'English' : `both ${language} and English`}. If ${language} is not English, first provide the questions in ${language},
           then provide the same questions in English. Separate the two sets with "---". If ${language} is English, only provide one set of questions.
           The output should be in a json format with the following structure(in summary add some words to summarize the issue):
           
        {
            "detectedLanguage": [
                "Question 1",
                "Question 2",
                "Question 3",
                "Question 4",
                "Question 5"
            ],
            "English": [
                "Question 1",
                "Question 2",
                "Question 3",
                "Question 4",
                "Question 5"
            ],
            "Summary": "title"
            }`,
        },


        {
          role: "user",
          content: translation
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });


  const result = JSON.parse(response.data.choices[0].message.content);
    console.log("ChatGPT Result:", result);

    let detectedLanguageQuestions = result.detectedLanguage;
    let englishQuestions = result.English;

    console.log("englishQuestions: ", englishQuestions);
    console.log("detectedLanguageQuestions: ", detectedLanguageQuestions);

    // Assuming setQuestions is a function passed as a prop or defined in the same component
    setQuestions({
      detectedLanguage: detectedLanguageQuestions,
      english: englishQuestions
    });

    setChatTitle(result.Summary);
    console.log(result.Summary);

    // Uncomment the next line if you want to show the chatbot after creating the template
    // setShowChatbot(true);

  } catch (error) {
    console.error('Error creating template:', error);
  }
}

  const handleNewRecording = () => {
    setShowRecordingResults(false); // To go back to the main screen
    setDetectedLanguage('');
    setTranslation('');
  };


  const inputLanguage = () => {
    setModalVisible(true); // Show modal when button is pressed
  };
  const handleConfirmLanguage = () => {
    setModalVisible(false); // Close modal
    if (selectedLanguage){
        console.log("Changing the translated language")
        console.log("navigation currenlt translating: ", navigation)
        console.log(languageCode)
        console.log(value)
        setLanguageName(value); // Set language name as the input
        setTranslation(''); // No translation needed in this case
        setShouldNavigate(true)
        // handleNavigation(); 

      //   {() => navigation.navigate('RecordingResults', {
      //   languageCode,
      //   languageName,
      //   translation: issueDescription || translation, // Pass issue description if available
      //   API_KEY,
      // })}

       //// // setShowResults(true); // Show the RecordingResults screen
      //     navigation.navigate('RecordingResults', {
      //     detectedLanguage,
      //     languageName,
      //     translation, // Pass issue description if available
      //     handleNewRecording,
      //     navigation,
      //     API_KEY
      // });
    }
    else 
    {
      console.log("cant find language")
    }

  }

  const handleResult = (value) => {

    console.log("handleNewRecording = ", value)
    console.log("translation = ", translation)
          //     {showResults | showRecordingResults ? (
          //   <RecordingResults
          //     detectedLanguage={detectedLanguage}
          //     languageName={languageName}
          //     translation={translation}
          //     onNewRecording={handleNewRecording}
          //     navigation={navigation}
          //     API_KEY={API_KEY}
          //   />
          // ) : (
          //   <>
  }

  const pickerRef = useRef();

  function open() {
    pickerRef.current.focus();
  }

  function close() {
    pickerRef.current.blur();
  }

  const closing_results = () => {
    console.log("im here")
    setShowResults(false)
    setShowRecordingResults(false)
  }



  return (
    <LinearGradient
      colors={['rgba(0, 119, 182, 1)', 'rgba(0, 52, 80, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>  
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollView}>
              <Text style={styles.beginText}>Begin</Text>
              <Text style={styles.subtitleText}>Let's find out the language of the patient</Text>
              <TouchableOpacity onPress={toggleRecording} style={styles.micButton}>
                <Ionicons 
                  name={isRecording ? "stop-circle" : "mic"} 
                  size={40} 
                  color={isRecording ? "red" : "white"} 
                />
              </TouchableOpacity>
              <Text style={styles.recordingText}>
                {isRecording ? "Recording... Tap to stop" : "Tap to start recording"}
              </Text>
              <TouchableOpacity onPress={inputLanguage} style={styles.languageButton}>
                <Text style={styles.languageButtonText}>Know the language already?</Text>
              </TouchableOpacity>

              {/* Modal for inputting the language */}
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalView}>
                  <Dropdown
                    style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    inputSearchStyle={styles.inputSearchStyle}
                    iconStyle={styles.iconStyle}
                    data={data}
                    search
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder={!isFocus ? 'Select item' : '...'}
                    searchPlaceholder="Search..."
                    value={value}
                    onFocus={() => setIsFocus(true)}
                    onBlur={() => setIsFocus(false)}
                    onChange={item => {
                      setValue(item.label);
                      setLanguageCode(item.value)
                      setIsFocus(false);
                      setSelectedLanguage(item.label)
                    }}
                    renderLeftIcon={() => (
                      <AntDesign
                        style={styles.icon}
                        color={isFocus ? 'blue' : 'black'}
                        name="Safety"
                        size={20}
                      />
                    )}
                  />
                  <Button title="Confirm" onPress={handleConfirmLanguage} />
                  <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
              </Modal>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  beginText: {
    fontFamily: 'Butler',
    fontSize: 64,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  micButton: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitleText: {
    fontFamily: 'Butler',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  languageButton: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: 200,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 52, 80, 0.7)', // Darker color
    marginBottom: 20,
  },
  languageButtonText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    // alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalTitle: {
    fontSize: 20,
    color: 'white',
    marginBottom: 20,
  },
  languageInput: {
    width: 250,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 20,
  },
  dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
    },
    selectedTextStyle: {
      fontSize: 16,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      height: 40,
      fontSize: 16,
    },
  button_back: {
    position: 'absolute',
    top: 80,
    right: 100,
    width: 50,
    borderColor_back: 'dimgray',
    borderWidth: 1,
    borderRadius: 57,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText_back: {
    color: 'white',
    fontSize: 22,
  },
});
