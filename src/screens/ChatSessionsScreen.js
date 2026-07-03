import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabaseClient';

const ChatSessionsScreen = ({ navigation }) => {
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatSessions(data);
    } catch (error) {
      console.error('Error fetching chat sessions:', error.message);
    }
  };

  const renderChatSession = ({ item }) => (
    <TouchableOpacity
      style={styles.sessionItem}
      onPress={() => {
        console.log('Navigating to ChatLog with sessionId:', item.id);
        navigation.navigate('ChatLog', { sessionId: item.id });
      }}
    >
      <Text style={styles.sessionTitle}>{item.title || `Chat ${item.id}`}</Text>
      <Text style={styles.sessionDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
      <View style={styles.line} />
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(176, 176, 176, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Sessions</Text>
      </View>
      <View style={styles.headerLine} />
      <FlatList
        data={chatSessions}
        renderItem={renderChatSession}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 23,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Butler',
    color: 'black',
    textAlign: 'center',
  },
  headerLine: {
    height: 1,
    backgroundColor: 'black',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  sessionItem: {
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 24,
    fontFamily: 'Butler',
    color: 'black',
    marginBottom: 5,
  },
  sessionDate: {
    fontSize: 12,
    color: 'darkgray',
    marginBottom: 5,
  },
  line: {
    height: 1,
    backgroundColor: 'black',
    marginTop: 5,
  },
});

export default ChatSessionsScreen;