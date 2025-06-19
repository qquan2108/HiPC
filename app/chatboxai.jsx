import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Vibration,
  Dimensions,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Sử dụng API miễn phí từ Hugging Face với model tốt hơn
const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const BACKUP_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// Rate limiting: 10 tin nhắn mỗi ngày
const DAILY_MESSAGE_LIMIT = 10;
const STORAGE_KEY = 'chatai_daily_count';

export default function ChatBoxAI() {
  const [messages, setMessages] = useState([
    { 
      id: 1,
      from: "ai", 
      text: "👋 Xin chào! Tôi là HiPC AI Assistant. Tôi có thể giúp bạn trả lời câu hỏi, tư vấn và trò chuyện! Bạn cần hỗ trợ gì?",
      timestamp: new Date().toLocaleTimeString(),
      isTyping: false
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef();
  const inputRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Load daily message count
    loadDailyCount();
    
    // Animate initial load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadDailyCount = async () => {
    try {
      const today = new Date().toDateString();
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : {};
      
      if (data.date === today) {
        setDailyCount(data.count || 0);
      } else {
        setDailyCount(0);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));
      }
    } catch (error) {
      console.log('Error loading daily count:', error);
    }
  };

  const updateDailyCount = async (newCount) => {
    try {
      const today = new Date().toDateString();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: newCount }));
      setDailyCount(newCount);
    } catch (error) {
      console.log('Error updating daily count:', error);
    }
  };

  const generateSmartResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Các câu trả lời thông minh cho các chủ đề phổ biến
    const responses = {
      greeting: [
        "Chào bạn! Tôi rất vui được trò chuyện với bạn 😊",
        "Xin chào! Hôm nay bạn thế nào? Tôi có thể giúp gì được không?",
        "Hello! Tôi là AI assistant, sẵn sàng hỗ trợ bạn!"
      ],
      weather: [
        "Tôi không thể kiểm tra thời tiết trực tiếp, nhưng bạn có thể xem trên ứng dụng thời tiết hoặc Google nhé!",
        "Để biết thời tiết chính xác, bạn nên kiểm tra trên trang web thời tiết địa phương của mình."
      ],
      time: [
        `Hiện tại là ${new Date().toLocaleTimeString('vi-VN')} ngày ${new Date().toLocaleDateString('vi-VN')}`,
        `Bây giờ là ${new Date().toLocaleTimeString('vi-VN')}`
      ],
      help: [
        "Tôi có thể giúp bạn:\n• Trả lời câu hỏi\n• Tư vấn và gợi ý\n• Trò chuyện thân thiện\n• Giải thích các khái niệm\n\nBạn cần hỗ trợ gì cụ thể?",
        "Tôi ở đây để hỗ trợ bạn! Hãy hỏi tôi bất cứ điều gì bạn muốn biết."
      ],
      thanks: [
        "Không có gì! Tôi rất vui được giúp đỡ bạn 😊",
        "Rất hân hạnh được hỗ trợ! Còn gì khác tôi có thể giúp không?",
        "Cảm ơn bạn! Đó là niềm vui của tôi 🎉"
      ],
      default: [
        "Đó là một câu hỏi thú vị! Tôi nghĩ rằng...",
        "Dựa trên hiểu biết của tôi, tôi có thể chia sẻ rằng...",
        "Hmm, để trả lời câu hỏi này, tôi cần suy nghĩ một chút...",
        "Đây là góc nhìn của tôi về vấn đề này..."
      ]
    };

    // Phân loại câu hỏi
    if (input.includes('xin chào') || input.includes('hello') || input.includes('chào')) {
      return responses.greeting[Math.floor(Math.random() * responses.greeting.length)];
    }
    if (input.includes('thời tiết') || input.includes('weather')) {
      return responses.weather[Math.floor(Math.random() * responses.weather.length)];
    }
    if (input.includes('mấy giờ') || input.includes('time') || input.includes('giờ')) {
      return responses.time[Math.floor(Math.random() * responses.time.length)];
    }
    if (input.includes('giúp') || input.includes('help') || input.includes('hỗ trợ')) {
      return responses.help[Math.floor(Math.random() * responses.help.length)];
    }
    if (input.includes('cảm ơn') || input.includes('thanks') || input.includes('thank you')) {
      return responses.thanks[Math.floor(Math.random() * responses.thanks.length)];
    }

    return responses.default[Math.floor(Math.random() * responses.default.length)];
  };

  const callAI = async (userInput) => {
    try {
      // Thử API chính trước
      let response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: userInput,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true,
          },
          options: { 
            wait_for_model: true,
            use_cache: false
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Primary API failed');
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        let aiText = data[0].generated_text;
        // Làm sạch response
        aiText = aiText.replace(userInput, '').trim();
        if (aiText && aiText.length > 5) {
          return aiText;
        }
      }
      
      throw new Error('Invalid response format');
      
    } catch (error) {
      console.log('AI API Error:', error);
      // Fallback to smart response
      return generateSmartResponse(userInput);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Check daily limit
    if (dailyCount >= DAILY_MESSAGE_LIMIT) {
      Alert.alert(
        "Giới hạn tin nhắn",
        `Bạn đã sử dụng hết ${DAILY_MESSAGE_LIMIT} tin nhắn hôm nay. Vui lòng quay lại vào ngày mai!`,
        [{ text: "OK" }]
      );
      return;
    }

    const userMsg = { 
      id: Date.now(),
      from: "user", 
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    // Haptic feedback
    Vibration.vibrate(50);

    try {
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiResponse = await callAI(input);
      
      const aiMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      await updateDailyCount(dailyCount + 1);
      
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: "Xin lỗi, có lỗi xảy ra. Tôi sẽ cố gắng trả lời tốt hơn trong lần tới! 🤖",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
    
    setLoading(false);
    setIsTyping(false);
    
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
          </View>
        </View>
      </View>
    );
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.from === "user";
    const isLastMessage = index === messages.length - 1;
    
    return (
      <Animated.View 
        style={[
          styles.messageWrapper,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
          isLastMessage && styles.lastMessage
        ]}>
          {!isUser && (
            <View style={styles.aiAvatar}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.avatarGradient}
              >
                <MaterialIcons name="smart-toy" size={16} color="#FFFFFF" />
              </LinearGradient>
            </View>
          )}
          
          <View style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble
          ]}>
            <Text style={[
              styles.messageText,
              isUser ? styles.userText : styles.aiText
            ]}>
              {item.text}
            </Text>
            <Text style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.aiTimestamp
            ]}>
              {item.timestamp}
            </Text>
          </View>
          
          {isUser && (
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={16} color="#FFFFFF" />
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const QuickActions = () => (
    <View style={styles.quickActions}>
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => setInput("Bạn có thể giúp gì?")}
      >
        <Ionicons name="help-circle" size={16} color="#667eea" />
        <Text style={styles.quickActionText}>Trợ giúp</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => setInput("Mấy giờ rồi?")}
      >
        <Ionicons name="time" size={16} color="#667eea" />
        <Text style={styles.quickActionText}>Thời gian</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.quickAction}
        onPress={() => setInput("Tư vấn cho tôi")}
      >
        <Ionicons name="bulb" size={16} color="#667eea" />
        <Text style={styles.quickActionText}>Tư vấn</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatar}>
              <MaterialIcons name="smart-toy" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>HiPC AI Assistant</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? "Đang nhập..." : "Trực tuyến"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <Text style={styles.messageCount}>
              {dailyCount}/{DAILY_MESSAGE_LIMIT}
            </Text>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="settings" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />
        {renderTypingIndicator()}
      </View>

      {/* Quick Actions */}
      {messages.length <= 1 && <QuickActions />}

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
            onSubmitEditing={sendMessage}
            editable={!loading}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.sendGradient}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </LinearGradient>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '600',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 16,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  lastMessage: {
    marginBottom: 0,
  },
  aiAvatar: {
    marginRight: 8,
    marginBottom: 4,
  },
  avatarGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  userBubble: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#2d3748',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#718096',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  typingBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
    maxWidth: '50%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e0',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f7fafc',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d3748',
    maxHeight: 100,
    marginRight: 12,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});