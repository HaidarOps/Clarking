import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://btozykkausrnganfwuta.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0b3p5a2thdXNybmdhbmZ3dXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ3Nzk1NTQsImV4cCI6MjA0MDM1NTU1NH0.YhahfjFVTHlMENXIrni1NV1c91cIkb72uTiB-pO8MWw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const createChatSession = async (title) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ title }])
    .select();

  if (error) throw error;
  return data[0];
};

export const saveChatMessage = async (sessionId, context, role) => {
  console.log("Trying to save message: ", context);
  console.log("Session id: ", sessionId);
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([
      { 
        chat_session_id: sessionId, 
        context, 
        role 
      }
    ])
    .select(); // Add this to return the inserted data

  if (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }
  
  return data;
};

export const getChatMessages = async (sessionId) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('chat_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};