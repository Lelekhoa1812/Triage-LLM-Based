import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';

import axios from 'axios';
import { LanguageContext } from '../context/LanguageContext';

const API_URL = "https://BinKhoaLe1812-Medical-Chatbot.hf.space/chat";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const scrollRef = useRef();

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input.trim() };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(API_URL, {
        query: userMsg.text,
        lang: language
      });
      const botMsg = { role: 'bot', text: response.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '❌ Error: Unable to get a response.' }
      ]);
    }

    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView
        style={styles.chatBox}
        contentContainerStyle={{ paddingBottom: 20 }}
        ref={scrollRef}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.messageBubble,
              msg.role === 'user' ? styles.userBubble : styles.botBubble
            ]}
          >
            <Text style={styles.messageLabel}>
              {msg.role === 'user' ? '🧑 You' : '🤖 DocBot'}
            </Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <ActivityIndicator style={{ marginTop: 10 }} size="small" color="#666" />
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your question..."
          placeholderTextColor="#999"
          multiline
          maxHeight={120}
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  chatBox: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#d4f8d4', // greenish
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#d0e6ff', // light blue
    alignSelf: 'flex-start',
  },
  messageLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  messageText: {
    fontSize: 15,
    color: '#222',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    marginBottom: 90,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  sendBtn: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatbotScreen;
