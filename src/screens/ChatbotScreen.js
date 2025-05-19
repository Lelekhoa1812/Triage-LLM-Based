import React, {useState, useContext, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import {LanguageContext} from '../context/LanguageContext';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Markdown from 'react-native-markdown-display'; // Render MarkDown

const API_URL = 'https://BinKhoaLe1812-Medical-Chatbot.hf.space/chat';

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: "Hello! I'm DocBot, your medical assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const {language} = useContext(LanguageContext);
  const scrollRef = useRef();
  const inputRef = useRef();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Initialize with welcome message animation
  useEffect(() => {
    animateNewMessage();
  }, []);

  const animateNewMessage = () => {
    slideAnim.setValue(50);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {role: 'user', text: input.trim()};
    setMessages(prevMessages => [...prevMessages, userMsg]);
    setInput('');
    setLoading(true);
    animateNewMessage();

    try {
      const response = await axios.post(API_URL, {
        query: userMsg.text,
        lang: language,
      });

      const botMsg = {role: 'bot', text: response.data.response};
      setMessages(prevMessages => [...prevMessages, botMsg]);
      animateNewMessage();
    } catch (err) {
      const errorMsg = {
        role: 'bot',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isError: true,
      };
      setMessages(prevMessages => [...prevMessages, errorMsg]);
      animateNewMessage();
    }

    setLoading(false);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const renderTimeSeparator = index => {
    // Add time separators between messages (every few messages)
    if (index === 0 || index % 5 === 0) {
      return (
        <View style={styles.timeSeparator}>
          <Text style={styles.timeText}>
            {new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderTypingIndicator = () => {
    if (!loading) return null;

    return (
      <View
        style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.botLabelContainer}>
          <FontAwesome5 name="robot" size={14} color="#1F2937" solid />
          <Text style={styles.messageLabel}> DocBot</Text>
        </View>
        <View style={styles.typingIndicator}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <FontAwesome5
          name="robot"
          size={18}
          color="#1F2937"
          solid
          style={styles.headerIcon}
        />
        <Text style={styles.headerTitle}>DocBot Assistant</Text>
        <View style={styles.onlineIndicator} />
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView
          style={styles.chatBox}
          contentContainerStyle={styles.chatContent}
          ref={scrollRef}>
          {messages.map((msg, i) => (
            <React.Fragment key={i}>
              {renderTimeSeparator(i)}
              <Animated.View
                style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.botBubble,
                  msg.isError && styles.errorBubble,
                  {
                    opacity: i === messages.length - 1 ? fadeAnim : 1,
                    transform: [
                      {translateY: i === messages.length - 1 ? slideAnim : 0},
                    ],
                  },
                ]}>
                {msg.role === 'user' ? (
                  <View style={styles.userLabelContainer}>
                    <FontAwesome5 name="user" size={14} color="#1F2937" solid />
                    <Text style={styles.messageLabel}> You</Text>
                  </View>
                ) : (
                  <View style={styles.botLabelContainer}>
                    <FontAwesome5
                      name="robot"
                      size={14}
                      color="#1F2937"
                      solid
                    />
                    <Text style={styles.messageLabel}> DocBot</Text>
                  </View>
                )}
                <Markdown // Render Bot response in Markdown
                  style={{
                    body: [styles.messageText, msg.isError && styles.errorText],
                  }}>
                  {msg.text}
                </Markdown>
              </Animated.View>
            </React.Fragment>
          ))}

          {renderTypingIndicator()}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask a medical question..."
              placeholderTextColor="#A0A0A0"
              multiline
              maxHeight={100}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
              onPress={sendMessage}
              disabled={!input.trim() || loading}>
              <FontAwesome5
                name="paper-plane"
                size={20}
                color="#FFFFFF"
                solid
              />
            </TouchableOpacity>
          </View>
          <View style={styles.disclaimerContainer}>
            <FontAwesome5
              name="info-circle"
              size={12}
              color="#6B7280"
              style={styles.disclaimerIcon}
            />
            <Text style={styles.disclaimer}>
              DocBot provides general medical information. Always consult a
              healthcare professional.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  headerIcon: {
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
    marginLeft: 8,
  },
  chatBox: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  timeSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageBubble: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#E6F4EA',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#E8F0FE',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#FEE2E2',
  },
  userLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  botLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  errorText: {
    color: '#B91C1C',
  },
  typingBubble: {
    paddingVertical: 20,
    marginTop: 8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6B7280',
    marginRight: 4,
    opacity: 0.6,
  },
  typingDot1: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationIterationCount: 'infinite',
  },
  typingDot2: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.2s',
    animationIterationCount: 'infinite',
  },
  typingDot3: {
    animationName: 'bounce',
    animationDuration: '0.6s',
    animationDelay: '0.4s',
    animationIterationCount: 'infinite',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: 75,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: '#F9FAFB',
  },
  sendBtn: {
    backgroundColor: '#0071FF',
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0071FF',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: '#A0AEC0',
    shadowColor: '#A0AEC0',
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  disclaimerIcon: {
    marginRight: 6,
  },
  disclaimer: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
});

// For React Native Web, add this CSS to handle the typing animation
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `;
  document.head.append(style);
}

export default ChatbotScreen;
