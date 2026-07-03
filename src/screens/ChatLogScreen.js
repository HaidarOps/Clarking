import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabaseClient';

const ChatLogScreen = ({ route }) => {
  const { sessionId } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.role === 'user' ? styles.userMessageContainer : styles.botMessageContainer]}>
      {item.role === 'user' ? (
        <>
          <View style={[styles.messageBubble, styles.userMessageBubble]}>
            <Text style={styles.userMessageText}>{item.context}</Text>
          </View>
          <View style={styles.userIcon} />
        </>
      ) : (
        <>
          <View style={styles.botIcon} />
          <View style={[styles.messageBubble, styles.botMessageBubble]}>
            <Text style={styles.botMessageText}>{item.context}</Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 1)', 'rgba(176, 176, 176, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messageList}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 36,
  },
  messageList: {
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
  },
  botMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 15,
    borderRadius: 15,
  },
  userMessageBubble: {
    backgroundColor: 'midnightblue', // Darker blue color for patient messages
  },
  botMessageBubble: {
    backgroundColor: 'powderblue', // Keeping the original color for doctor messages
  },
  userMessageText: {
    color: 'white',
    fontSize: 14,
  },
  botMessageText: {
    color: 'black',
    fontSize: 14,
  },
  botIcon: {
    width: 29,
    height: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 14,
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  userIcon: {
    width: 29,
    height: 28,
    backgroundColor: 'rgba(0, 0, 255, 0.1)', // Keeping the light blue color for the user icon
    borderRadius: 14,
    marginLeft: 10,
    alignSelf: 'flex-end',
  },
});

export default ChatLogScreen;