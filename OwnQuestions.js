import React, {useState, useEffect} from 'react';
import { TouchableOpacity } from "react-native-gesture-handler";
import {Platform, Text, View, StyleSheet, TextInput, ScrollView, Button} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import {SafeAreaView } from "react-native-safe-area-context";
import NewChatBotSystem from './NewChatBotSystem';
import axios from 'axios';


const OwnQuestions = ({route, navigation, }) => {
  const { languageName, API_KEY } = route.params;
  const [text, onChangeText] = React.useState('Useless Text');
  const [detectedLanguage, setDetectedLanguage] = React.useState({Detected_Questions: []});
  const [inputText, setInputText] = useState('');
  const [questions, setQuestions] = useState({ Inputted_Questions: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [showNewChatBot, setShowNewChatBot] = useState(false);
  const [chatTitle, setchatTitle] = useState('');


const handleButtonPush = (input) => {
  if (input.trim() === '') {
    alert("Add something to the questions box");
    return;
  }

  setQuestions((prevQuestions) => ({
    Inputted_Questions: [...(prevQuestions.Inputted_Questions || []), input],
  }));
  setInputText(''); // Clear input after adding the question
  console.log("Current questions " + questions);
  setIsLoading(false);
};



async function making_questions_template(questions, languageName) {
  try {
const response = await axios.post(
  'https://api.openai.com/v1/chat/completions',
  {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `Translate the following questions into ${languageName}: ${questions.Inputted_Questions.join(', ')}`
      }
    ]
  },
  {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    }
  }
);


    // Directly access the response content instead of trying to parse it as JSON
    const result = response.data.choices[0].message.content;
    
    // Process the result string as needed, e.g., split into questions if necessary
    const translatedQuestions = result.split('\n');  // Example, adapt this to your needs


    console.log("ChatGPT Result:", result);

    // Update the state with the translated questions
    setDetectedLanguage({
      detectedLanguage: translatedQuestions  // Ensures it's an array
    });

    // If the response contains a title, extract it (adjust based on how the response looks)
    const titleMatch = result.match(/Title: (.*)$/);  // Example pattern
    const title = titleMatch ? titleMatch[1] : "ChatBot Questions";
    setchatTitle(title);

  } catch (error) {
    console.error('Error creating template:', error);
  }
}

    const handleProceed  = async () => {
      await making_questions_template(questions, languageName) 
    setShowNewChatBot(true);
  };

  
  if (showNewChatBot) {
    console.log("Detected language questions = " + detectedLanguage.Detected_Questions);
    console.log("English language questions = " + questions.Inputted_Questions);
    console.log("inital_langugae = " + detectedLanguage);


    return (
        <NewChatBotSystem
          navigation={navigation}  // Pass the navigation prop here
          detectedLanguagequestions={detectedLanguage.detectedLanguage}
          englishQuestions={questions.Inputted_Questions}
          API_KEY={API_KEY}
          initialLanguage={detectedLanguage}
          chatTitle={chatTitle}
        />
    );
  }


return (
  <LinearGradient
    colors={['rgba(0, 119, 182, 1)', 'rgba(0, 52, 80, 1)']}
    style={styles.container}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
  >
    <SafeAreaView style={styles.safeArea}>
      <ScrollView styles={styles.scrollView}>
        <Text style={styles.title}>Questions Generated</Text>
        <Text style={styles.subtitle}>
          These are the questions which we think would be appropriate to ask the patient
        </Text>

        <TextInput
          style={styles.input}
          onChangeText={(text) => setInputText(text)}
          value={inputText}
          placeholder="Questions to be asked"
        />
        
        {/* Centered and styled Add Questions Button */}
        <View>
          <TouchableOpacity style={styles.addButton} onPress={() => handleButtonPush(inputText)}>
            <Text style={styles.addButtonText}>Add Questions To Ask The Patient</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.questionsContainer}>
          <ScrollView style={styles.questionsList}>
            {isLoading ? (
              <Text style={styles.loadingText}>Add some questions to the List</Text>
            ) : (
              questions.Inputted_Questions.map((question, index) => (
                <Text key={index} style={styles.questionText}>{question}</Text>
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
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>
);

}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
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
    marginLeft: 10,
    marginRight: 10,

  },
  questionsList: {
    width: '100%',
  },
  loadingText: {
    fontFamily: 'Butler',
    fontSize: 14,
    color: 'black',
    textAlign: 'center',
  },
  questionText: {
    fontFamily: 'Butler',
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
    marginBottom: 24,
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
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    paddingBottom: 20,
  },
  // New style for the Add Question button
  addButton: {
    backgroundColor: 'darkblue', // Darker blue
    borderRadius: 30, // Rounded button
    paddingVertical: 12, // Padding for better spacing
    paddingHorizontal: 25,
    alignSelf: 'center', // Center the button horizontally
    marginVertical: 20, // Space above and below the button
  },
  addButtonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default OwnQuestions;