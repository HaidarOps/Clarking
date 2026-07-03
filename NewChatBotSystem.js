import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import axios from 'axios';
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system';
import { createChatSession, saveChatMessage, getChatMessages } from './supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const NewChatBotSystem = ({ navigation, route, detectedLanguagequestions, englishQuestions, API_KEY, initialLanguage, chatTitle }) => {
  const [messages, setMessages] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [chatEnded, setChatEnded] = useState(false);
  const [audioDataReplay, setaudioDataReplay] = useState('');
  const [counter, setCounter] = useState(0);
  const [sound, setSound] = useState();
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [showRecordButton, setShowRecordButton] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [chatInitialized, setChatInitialized] = useState(false);

  var [messagesFormatted, setMessagesFormatted] = useState([]);


const scrollViewRef = useRef();

  useEffect(() => {
    console.log("InitialLanguage :", initialLanguage)
    setCounter(0)
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

// Function to convert Uint8Array to Base64
const uint8ArrayToBase64 = (uint8Array) => {
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return window.btoa(binary);
};

const initializeChat = async () => {
  if (!chatInitialized) {
    try {
      const session = await createChatSession(chatTitle);
      console.log("Session created with ID:", session.id);
      setSessionId(session.id);
      setChatInitialized(true);
      return session.id;
    } catch (error) {
      console.error('Error initializing chat:', error);
      return null;
    }
  }
  return sessionId;
};


  const addMessage = async (newMessage, sender, sessionId) => {
    if (!sessionId){
          console.error("Session ID is missing while trying to add a message.");
          return;
    }
    try {
        await saveChatMessage(sessionId, newMessage, sender);
        setMessages(prevMessages => [...prevMessages, { text: newMessage, sender }]); // adds message to array
        setInputMessage(''); // Clear the input field after sending a message
        if (sender == 'user'){
        setMessagesFormatted(prevMessagesFormatted => [...prevMessagesFormatted, newMessage])
        }
        } catch (error) {
      console.error('Error saving message:', error);
    } 
  };


  const processTextResponse = async (text) => {
     try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant specialized in understanding medical conversations. The text provided is in ${initialLanguage}. Your task is to carefully transcribe what the person is saying, focusing on accurately capturing any symptoms, medical terms, or health-related descriptions. Translate this text to English as clearly and precisely as possible to reflect the intended meaning, even if some phrases are colloquial or informal. Respond only with the translated transcription.`
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

    var result = response.data.choices[0].message.content;

    console.log("Text translated from user to be: ");
    result = result.replace(/"/g, "");

    return result;
  } catch (error) {
    console.error('Error processing with ChatGPT:', error);
  }
  }


  // USER RESONDING TO TE QUESTIONS

  const processAudioResponse = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
      uri: uri,
      type: 'audio/m4a',
      name: 'audio.m4a',
    });
    formData.append('model', 'whisper-1');
    formData.append('language', initialLanguage);


    try {
      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${API_KEY}`,
        },
      });
      const transcription = response.data.text;

      if (sessionId) {
        // Add user message immediately after transcription


        const message_in_english = await processTextResponse(transcription);
        await addMessage(message_in_english, 'user', sessionId);

        await goingThroughQuestions();
        } else {
          console.error('Session ID is null. Unable to add message.');
        }
    } catch (error) {
      console.error('Error processing audio:', error);
    }




    





  };



  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(undefined);
      await processAudioResponse(uri);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const handleRecordPress = () => {
    if(isRecording) {
      stopRecording();
    }
    else {
      startRecording();
    }
  }

  // ASKING QUESTIONS


const askQuestion = async (questionText) => {
  console.log('Question being asked: ', questionText);
  try {
    const response = await axios.post('https://api.openai.com/v1/audio/speech',
      {
        model: "tts-1",
        voice: "alloy",
        input: questionText
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );

    const audioData = response.data;
    await setaudioDataReplay(audioData)

    const tempFileUri = FileSystem.documentDirectory + 'temp_audio.mp3';
    await FileSystem.writeAsStringAsync(tempFileUri, Buffer.from(audioData).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });

    console.log('Debug Audio URL:', tempFileUri);

    const base64Audio = Buffer.from(audioData, 'binary').toString('base64');
    const audioUri = `data:audio/mpeg;base64,${base64Audio}`;

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });

    console.log("Audio uri:", audioUri);
    await setSound(newSound);

    await newSound.playAsync();
    newSound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await newSound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Error in text-to-speech:', error);
  }
};


  const goingThroughQuestions = async () => {
    const sid = await initializeChat();
    if (sid) {
      console.log("Using session ID:", sid);
      if (counter < detectedLanguagequestions.length) {
        await askQuestion(detectedLanguagequestions[counter]);
        await addMessage(englishQuestions[counter], 'bot', sid);
        console.log("Counter:", counter);
        setCounter(counter + 1);
        setShowRecordButton(true);
      } else {
        setChatEnded(true)
        await summarize_convo()
        console.log("All questions have been asked.");
      }
    } else {
      console.error("Failed to initialize chat session.");
    }
};

const replay = async () => {
    const tempFileUri = FileSystem.documentDirectory + 'temp_audio.mp3';
    await FileSystem.writeAsStringAsync(tempFileUri, Buffer.from(audioDataReplay).toString('base64'), { encoding: FileSystem.EncodingType.Base64 });

    console.log('Debug Audio URL:', tempFileUri);

    const base64Audio = Buffer.from(audioDataReplay, 'binary').toString('base64');
    const audioUri = `data:audio/mpeg;base64,${base64Audio}`;

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });

    console.log("Audio uri:", audioUri);
    await setSound(newSound);

    await newSound.playAsync();
    newSound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await newSound.unloadAsync();
      }
    });
}


const summarize_convo = async () => {
  // make a pop up

  // get all the information in the chat 
  //Here are the messages:  [{"text":"Why is there pain in your arm ?","sender":"bot"},{"text":"I'm not bothered","sender":"user"}
  //,{"text":"When did this happen ?","sender":"bot"}]

  messagesFormatted.push(...englishQuestions)

  console.log("Here are the messages: ", messages)

  // have chatgpt summarize it

   try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant tasked with summarizing a conversation between a doctor (bot) and a patient (user). The conversation messages are structured in an array format, e.g., [{"text":"Some question","sender":"bot"},{"text":"Some answer","sender":"user"}]. Please analyze the exchange and produce a concise summary that captures the patient's issue, key symptoms, relevant medical history, and any stated concerns or priorities. Format the summary in a professional style that a doctor could directly copy and use for medical documentation. `
        },
        {
          role: "user",
          content: `${messagesFormatted}`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const result = response.data.choices[0].message.content;

    console.log("Chatgpt Summarize: ", result);

    return result;
  } catch (error) {
    console.error('Error processing with ChatGPT:', error);
  }

    // as the questions are in arrays have it take a history of the chat to chatgpt

  // display
}


  return (
    <LinearGradient
      colors={['rgba(0, 119, 182, 1)', 'rgba(0, 52, 80, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('ChatSessions')}>
            <Ionicons name="menu" size={30} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

          <View style={styles.chatHistoryContainer}>
          <Text style={styles.chatHistoryText}>Chat History</Text>
          <View style={styles.line} />
        </View>


        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
        >
          {messages.map((message, index) => (
            <View key={index} style={[styles.messageBubble, message.sender === 'bot' ? styles.botMessage : styles.userMessage]}>
              {message.sender === 'bot' && (
                <View style={styles.botIconContainer}>
                  <Image source={require('./assets/doctor-male.png')} style={styles.botIcon} />
                  <TouchableOpacity onPress={replay}>
                    <MaterialIcons name="replay" size={24} color="black" />
                  </TouchableOpacity>
                </View>
              )}
              <View style={[styles.textBubble, message.sender === 'bot' ? styles.botTextBubble : styles.userTextBubble]}>
                <Text style={[styles.messageText, message.sender === 'bot' ? styles.botMessageText : styles.userMessageText]}>
                  {message.text}
                </Text>

              </View>
              {message.sender === 'user' && (
                <View style={styles.userIconContainer}>
                  <Image source={require('./assets/person.png')} style={styles.userIcon} />
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        { chatEnded ? (
              <TouchableOpacity style={styles.beginChatButton}>
               <Text style={styles.beginChatButtonText}>Chat has ended</Text>
              </TouchableOpacity>
          ): (
            <>
            </>
          )}

        {!chatInitialized ? (
          <TouchableOpacity style={styles.beginChatButton} onPress={goingThroughQuestions}>
            <Text style={styles.beginChatButtonText}>Begin Chat</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.recordButton, isRecording && styles.recordingButton]} onPress={handleRecordPress}>
            <Text style={styles.recordButtonText}>
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 33,
    paddingTop: 27,
    paddingBottom: 56,
  },
   header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontFamily: 'Butler',
    fontSize: 20,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'powderblue',
    borderRadius: 45,
    paddingVertical: 7,
    paddingHorizontal: 27,
  },
  logoutText: {
    fontFamily: 'Inter',
    fontSize: 12,
    color: 'dimgray',
  },
  chatHistoryContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  chatHistoryText: {
    fontFamily: 'Butler',
    fontSize: 34,
    color: 'white',
    marginBottom: 5,
  },
  line: {
    height: 1,
    backgroundColor: 'white',
    width: '100%',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: 'steelblue',
    borderRadius: 57,
    padding: 21,
  },
  chatContent: {
    paddingVertical: 20,
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botIconContainer: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  userIconContainer: {
    width: 29,
    height: 29,
    borderRadius: 14.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  botIcon: {
    width: 15,
    height: 15,
  },
  userIcon: {
    width: 15,
    height: 15,
  },
  textBubble: {
    borderRadius: 13,
    paddingHorizontal: 30,
    paddingVertical: 12,
    maxWidth: '70%',
  },
  botTextBubble: {
    flexDirection: 'row',
    backgroundColor: 'powderblue',
  },
  userTextBubble: {
    backgroundColor: 'midnightblue',
  },
  messageText: {
    fontFamily: 'Butler',
    fontSize: 12,
  },
  botMessageText: {
    color: 'black',
  },
  userMessageText: {
    color: 'white',
  },
  beginChatButton: {
    backgroundColor: 'powderblue',
    borderRadius: 57,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  beginChatButtonText: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: 'rgba(0, 52, 80, 1)',
    fontWeight: 'bold',
  },
  recordButton: {
    backgroundColor: 'powderblue',
    borderRadius: 57,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  recordingButton: {
    backgroundColor: 'red',
  },
  recordButtonText: {
    fontFamily: 'Inter',
    fontSize: 18,
    color: 'rgba(0, 52, 80, 1)',
    fontWeight: 'bold',
  },
});

export default NewChatBotSystem;