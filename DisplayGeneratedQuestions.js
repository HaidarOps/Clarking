import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import NewChatBotSystem from './NewChatBotSystem';

const DisplayGeneratedQuestions = ({ route, navigation }) => {
  const { languageCode, languageName, translation, API_KEY, questions: initialQuestions, chatTitle: initialChatTitle } = route.params;
  const [questions, setQuestions] = useState({ English: [], detectedLanguage: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [chatTitle, setChatTitle] = useState("");
  const [showNewChatBot, setShowNewChatBot] = useState(false);

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

      setQuestions({
        English: result.English,
        detectedLanguage: result.detectedLanguage || result.English
      });
      setChatTitle(result.Summary);
    } catch (error) {
      console.error('Error creating template:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    console.log("detectedLanguage \n", languageCode)
    console.log("languageName \n", languageName)
    console.log("translation \n", translation)

    



    createTemplate(translation, languageCode);
  }, []);

  const handleProceed = () => {
    setShowNewChatBot(true);
  };

  // Function to remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = questions.English.filter((_, i) => i !== index);
    setQuestions({ ...questions, English: updatedQuestions });
  };

  if (showNewChatBot) {
    return (
      <NewChatBotSystem
        navigation={navigation}  // Pass the navigation prop here
        detectedLanguagequestions={questions.detectedLanguage}
        englishQuestions={questions.English}
        API_KEY={API_KEY}
        initialLanguage={languageCode}
        chatTitle={chatTitle}
      />
    );
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

        <Text style={styles.title}>Questions Generated</Text>
        <Text style={styles.subtitle}>
          These are the questions which we think would be appropriate to ask the patient
        </Text>

        <View style={styles.questionsContainer}>
          <Image source={require('./assets/Group.png')} style={styles.newProjectImage} />
          <ScrollView style={styles.questionsList}>
            {isLoading ? (
              <Text style={styles.loadingText}>Generating questions...</Text>
            ) : (
              questions.English.map((question, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>{question}</Text>
                  <TouchableOpacity onPress={() => removeQuestion(index)} style={styles.removeButton}>
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleProceed}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Proceed</Text>
          </TouchableOpacity>
        </View>
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
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'powderblue',
    borderRadius: 45,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: 'dimgray',
  },
  title: {
    fontFamily: 'Butler',
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Butler',
    fontSize: 10,
    color: 'silver',
    textAlign: 'center',
    marginBottom: 24,
    width: '90%',
    alignSelf: 'center',
  },
  questionsContainer: {
    backgroundColor: 'powderblue',
    borderRadius: 45,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  newProjectImage: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  questionsList: {
    width: '100%',
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  questionText: {
    fontFamily: 'Butler',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    flex: 1,
  },
  removeButton: {
    marginLeft: 10,
  },
  loadingText: {
    fontFamily: 'Butler',
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: 'dimgray',
    borderRadius: 57,
    paddingVertical: 12,
    paddingHorizontal: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default DisplayGeneratedQuestions;
