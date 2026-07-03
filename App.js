import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './src/services/supabaseClient';
import * as NavigationBar from 'expo-navigation-bar';
import Login from './src/screens/Login';
import ChatSessionsScreen from './src/screens/ChatSessionsScreen';
import TranslatingChat from './src/screens/TranslatingChat';
import ChatLogScreen from './src/screens/ChatLogScreen';
import RecordingResults from './src/screens/RecordingResults.js';
import DisplayGeneratedQuestions from './src/screens/DisplayGeneratedQuestions';
import NewChatBotSystem from './src/screens/NewChatBotSystem';
import OwnQuestions from './src/screens/OwnQuestions';
import FreeStyle from './src/screens/FreeStyle';



const Stack = createStackNavigator();

const leftToRightTransition = ({ current, layouts }) => {
  return {
    cardStyle: {
      transform: [
        {
          translateX: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [-layouts.screen.width, 0],
          }),
        },
      ],
    },
    overlayStyle: {
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
  };
};

const CustomHeader = ({ navigation, handleLogout, check_state }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.navigate('ChatSessions')}>
      <Ionicons name="menu" size={38} color="white" />
    </TouchableOpacity>
        <Button
      title="Go to Home"
      onPress={() => navigation.navigate("TranslatingChat")}/>
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

export default function App() {
  const [session, setSession] = useState(null);

  NavigationBar.setVisibilityAsync("hidden");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log('Error logging out:', error.message);
  };

  function clearHistory() {
    const state = navigation.getState();
    navigation.reset({
      ...state,
      routes: state.routes.map(route => ({ ...route, state: undefined }))
    });
  }

const check_state = async () => {
  console.log("just got here")
  clearHistory()
  console.log("And Here!")
}

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          gestureEnabled: true, // Enables swipe gesture for going back
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Default transition for most screens
        }}
      >
        {session && session.user ? (
          <>
            <Stack.Screen
              name="TranslatingChat"
              component={TranslatingChat}
              options={({ navigation }) => ({
                header: () => (
                  <CustomHeader navigation={navigation} handleLogout={handleLogout} check_state={check_state} />
                ),
                headerTransparent: true,
              })}
            />
            <Stack.Screen
              name="RecordingResults"
              component={RecordingResults}
              options={({ navigation }) => ({
                header: () => (
                  <CustomHeader navigation={navigation} handleLogout={handleLogout} check_state={check_state} />
                ),
                headerTransparent: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              })}
            />
            <Stack.Screen
              name="DisplayGeneratedQuestions"
              component={DisplayGeneratedQuestions}
              options={{ 
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              }}
            />
            <Stack.Screen
              name="NewChatBotSystem"
              component={NewChatBotSystem}
              options={{ 
                headerShown: true,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              }}
            />
            <Stack.Screen
              name="OwnQuestions"
              component={OwnQuestions}
              options={{ 
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              }}
            />
            <Stack.Screen
              name="FreeStyle"
              component={FreeStyle}
              options={{ 
                headerShown: false,
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              }}
            />
            <Stack.Screen
              name="ChatSessions"
              component={ChatSessionsScreen}
              options={{
                headerShown: false,
                cardStyleInterpolator: leftToRightTransition, // Custom left-to-right transition
              }}
            />
            <Stack.Screen
              name="ChatLog"
              component={ChatLogScreen}
              options={{ 
                title: 'Chat History',
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS, // Slide from right effect
              }}
            />
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            component={Login} 
            options={{ 
              headerShown: false,
              cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid, // Fade-up effect for login
            }} 
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40, // Adjust this value based on the status bar height
    paddingBottom: 10,
  },
  logoutButton: {
    backgroundColor: 'powderblue',
    borderRadius: 45,
    paddingVertical: 7,
    paddingHorizontal: 27,
  },
  logoutText: {
    fontFamily: 'Inter',
    color: 'dimgray',
    fontSize: 12,
  },
});
