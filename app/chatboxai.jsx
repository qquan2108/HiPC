import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import axiosInstance from '../utils/AxiosInstance';

const { width, height } = Dimensions.get('window');

// Rate limiting for professional use
const DAILY_MESSAGE_LIMIT = 100;
const STORAGE_KEY = 'hipc_ai_daily_count';

// PC Knowledge Base - Enhanced
const PC_KNOWLEDGE = {
  processors: {
    intel: {
      budget: ['i3-13100F', 'i3-14100F'],
      mainstream: ['i5-13400F', 'i5-13600K', 'i5-14400F', 'i5-14600K'],
      highend: ['i7-13700K', 'i7-14700K', 'i9-13900K', 'i9-14900K']
    },
    amd: {
      budget: ['Ryzen 5 5600X', 'Ryzen 5 5600'],
      mainstream: ['Ryzen 5 7600X', 'Ryzen 7 5800X3D', 'Ryzen 7 7700X'],
      highend: ['Ryzen 9 7900X', 'Ryzen 9 7950X', 'Ryzen 9 7900X3D']
    }
  },
  graphics: {
    nvidia: {
      budget: ['RTX 4060', 'RTX 3060'],
      mainstream: ['RTX 4060 Ti', 'RTX 4070', 'RTX 4070 Ti'],
      highend: ['RTX 4080', 'RTX 4090']
    },
    amd: {
      budget: ['RX 7600', 'RX 6600'],
      mainstream: ['RX 7700 XT', 'RX 7800 XT'],
      highend: ['RX 7900 XT', 'RX 7900 XTX']
    }
  }
};

// System prompt for Gemini to act as PC expert
const SYSTEM_PROMPT = `Bạn là HiPC AI Assistant - chuyên gia tư vấn PC và gaming setup tại Việt Nam. 

NHIỆM VỤ:
- Tư vấn build PC theo ngân sách (15-200 triệu VND)
- So sánh CPU, GPU, RAM, mainboard
- Giải đáp vấn đề kỹ thuật PC
- Gợi ý nâng cấp phù hợp
- Hỗ trợ troubleshooting

PHONG CÁCH:
- Thân thiện, chuyên nghiệp
- Sử dụng emoji phù hợp (🎮💻🔧⚡)
- Giá cả bằng VND (triệu)
- Cập nhật xu hướng 2024-2025

KIẾN THỨC CẬP NHẬT:
- Intel 13th/14th gen, AMD Ryzen 7000 series
- RTX 40 series, RX 7000 series  
- DDR5 phổ biến, giá DDR4 giảm
- NVMe Gen4 standard
- PSU 80+ Gold khuyến nghị

HÃY TRẢ LỜI NGẮN GỌN NHƯNG ĐỦ THÔNG TIN, LUÔN HƯỚNG ĐẾN GIẢI PHÁP THỰC TẾ.`;

export default function PCChatBoxAI() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { 
      id: 1,
      from: "ai", 
      text: "🚀 Chào mừng đến với HiPC AI Assistant - Chuyên gia tư vấn PC!\n\n💻 Tôi có thể giúp bạn:\n• Tư vấn build PC theo ngân sách\n• So sánh CPU, GPU, RAM\n• Kiểm tra tương thích linh kiện\n• Giải đáp các vấn đề kỹ thuật\n• Gợi ý nâng cấp PC\n\nHãy chia sẻ nhu cầu của bạn! 🔧",
      timestamp: new Date().toLocaleTimeString(),
      isTyping: false,
      category: "greeting"
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginLoading, setLoginLoading] = useState(true);
  const [productsByMessage, setProductsByMessage] = useState({});
  const [conversationHistory, setConversationHistory] = useState([]);
  const flatListRef = useRef();
  const inputRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadDailyCount();
    initializeConversation();
    
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

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const initializeConversation = () => {
    setConversationHistory([
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Tôi hiểu. Tôi sẽ hoạt động như HiPC AI Assistant - chuyên gia tư vấn PC tại Việt Nam với phong cách thân thiện và chuyên nghiệp. Tôi sẵn sàng hỗ trợ bạn!" }] }
    ]);
  };

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setShowLoginDialog(true);
        return;
      }
      
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr || userStr === "undefined") {
        setShowLoginDialog(true);
        return;
      }
      
      const stored = JSON.parse(userStr);
      const userId = stored.id || stored._id;
      if (!userId) {
        setShowLoginDialog(true);
        return;
      }
      
      setShowLoginDialog(false);
    } catch (error) {
      console.log('Login check error:', error);
      setShowLoginDialog(true);
    } finally {
      setLoginLoading(false);
    }
  };

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

  // Call backend AI chat API
  const callBackendAI = async (userInput) => {
    try {
      const { data } = await axiosInstance.post('/ai/chat', { message: userInput });
      const aiResponse = data?.reply || '';

      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: userInput }] },
        { role: "model", parts: [{ text: aiResponse }] }
      ]);

      return aiResponse;
    } catch (error) {
      console.log('Backend AI Error:', error);

      // Fallback response with PC knowledge
      return generateFallbackResponse(userInput);
    }
  };

  const generateFallbackResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('build') || input.includes('cấu hình')) {
      return "🔧 **Tư vấn Build PC**\n\nHiện tại đang có vấn đề kết nối AI, nhưng tôi vẫn có thể tư vấn cơ bản:\n\n💰 **Ngân sách phổ biến:**\n• 15-20tr: Gaming 1080p\n• 25-35tr: Gaming 1440p \n• 40-60tr: Gaming 4K/Content\n• 70tr+: Workstation\n\n📞 Bạn có thể chia sẻ ngân sách cụ thể để được tư vấn chi tiết hơn!";
    }
    
    if (input.includes('cpu') || input.includes('processor')) {
      return "⚡ **CPU 2024 Hot Picks**\n\n🎮 **Gaming:**\n• Budget: i5-13400F (~5.5tr)\n• Mid: i5-13600K (~7tr)\n• High-end: i7-13700K (~10tr)\n\n💼 **Productivity:**\n• AMD R7 5800X3D (~8.5tr)\n• AMD R9 7900X (~12tr)\n\n💡 Intel tốt cho gaming, AMD mạnh đa nhiệm!";
    }
    
    if (input.includes('gpu') || input.includes('vga')) {
      return "🎮 **GPU Gaming 2024**\n\n📺 **Theo độ phân giải:**\n• 1080p: RTX 4060 (~9.5tr)\n• 1440p: RTX 4070 (~15tr)\n• 4K: RTX 4080 (~28tr)\n\n🔥 **AMD thay thế:**\n• RX 7600 (~8tr)\n• RX 7700 XT (~13tr)\n\n⭐ RTX có DLSS, AMD có giá tốt!";
    }
    
    return "🤖 **Tạm thời mất kết nối AI**\n\nNhưng tôi vẫn có thể hỗ trợ cơ bản về:\n• Build PC theo ngân sách\n• So sánh linh kiện\n• Troubleshooting\n\nHãy hỏi cụ thể hơn! 🔧";
  };

  const detectCategory = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('build') || lowerInput.includes('cấu hình')) return 'build';
    if (lowerInput.includes('cpu') || lowerInput.includes('processor')) return 'cpu';
    if (lowerInput.includes('gpu') || lowerInput.includes('vga')) return 'gpu';
    if (lowerInput.includes('ram') || lowerInput.includes('bộ nhớ')) return 'ram';
    if (lowerInput.includes('case') || lowerInput.includes('vỏ máy')) return 'case';
    if (lowerInput.includes('lỗi') || lowerInput.includes('trouble')) return 'troubleshooting';
    return 'general';
  };

  const extractProductsFromResponse = (response) => {
    const lines = response.split('\n');
    const productRegex = /^\s*[*-]\s*(.+?),\s*giá\s*([\d\.,]+)\s*(?:VND|vnđ|đ)?\s*(?:\(ID:\s*([^)]+)\))?/i;
    const products = [];
    const introLines = [];
    lines.forEach(line => {
      const match = productRegex.exec(line);
      if (match) {
        const price = parseInt(match[2].replace(/[^\d]/g, ''), 10);
        products.push({
          name: match[1].trim(),
          price: price,
          sku: match[3] ? match[3].trim() : undefined
        });
      } else {
        introLines.push(line);
      }
    });
    return { products, intro: introLines.join('\n').trim() };
  };

  const fetchProductDetails = async (name) => {
    try {
      const params = new URLSearchParams();
      params.append('keyword', name);
      params.append('page', '1');
      params.append('limit', '1');
      const { data } = await axiosInstance.get('/product/filter-keyword?' + params.toString());
      if (Array.isArray(data?.products) && data.products.length > 0) return data.products[0];
      if (Array.isArray(data) && data.length > 0) return data[0];
      return null;
    } catch (error) {
      console.log('Error fetching product detail:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    if (dailyCount >= DAILY_MESSAGE_LIMIT) {
      Alert.alert(
        "Giới hạn tin nhắn",
        `Bạn đã sử dụng hết ${DAILY_MESSAGE_LIMIT} tin nhắn hôm nay. Phiên bản Pro không giới hạn!`,
        [{ text: "OK" }]
      );
      return;
    }

    const userMsg = { 
      id: Date.now(),
      from: "user", 
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);
    setIsTyping(true);
    Vibration.vibrate(50);

    try {
      // Add realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const category = detectCategory(currentInput);
      
      // Get AI response from backend
      const aiResponse = await callBackendAI(currentInput);
      const { products: extractedProducts, intro } = extractProductsFromResponse(aiResponse);
      const aiMsgId = Date.now() + 1;
      const aiMsg = {
        id: aiMsgId,
        from: "ai",
        text: intro || aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        category: category
      };

      setMessages(prev => [...prev, aiMsg]);

      if (extractedProducts.length > 0) {
        const detailed = await Promise.all(
          extractedProducts.map(p => fetchProductDetails(p.sku || p.name))
        );
        const products = detailed.map((d, idx) =>
          d ? d : { _id: extractedProducts[idx].sku || idx, name: extractedProducts[idx].name, price: extractedProducts[idx].price }
        );
        if (products.length > 0) {
          setProductsByMessage(prev => ({
            ...prev,
            [aiMsgId]: products
          }));
        }
      }

      await updateDailyCount(dailyCount + 1);

    } catch (error) {
      console.log('Send message error:', error);
      
      const errorMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: "⚠️ Có lỗi xảy ra khi kết nối với AI. Tôi vẫn có thể tư vấn PC dựa trên kiến thức sẵn có. Hãy thử hỏi lại! 🔧",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, errorMsg]);
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
          <Text style={styles.typingText}>🤖 HiPC AI đang phân tích...</Text>
          <View style={styles.typingDots}>
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
            <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
          </View>
        </View>
      </View>
    );
  };

  const renderProductCards = (msgId) => {
    const products = productsByMessage[msgId];
    if (!products || !Array.isArray(products) || products.length === 0) return null;

    return (
      <View style={styles.productsContainer}>
        <Text style={styles.productsTitle}>💡 Sản phẩm:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productsScroll}>
          {products.map((product) => (
            <TouchableOpacity
              key={product._id || product.id}
              style={styles.productCard}
              onPress={() => router.push({ pathname: '/ctsp', params: { id: product._id || product.id } })}
            >
              <View style={styles.productImageContainer}>
                <Animated.Image
                  source={product.image ?
                    (typeof product.image === 'string' ? { uri: product.image } : product.image) :
                    require('../assets/images/pc1.png')
                  }
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name || product.title || 'Sản phẩm PC'}
              </Text>
              <Text style={styles.productPrice}>
                {(product.price || 0).toLocaleString('vi-VN')}đ
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
                <MaterialIcons name="computer" size={16} color="#FFFFFF" />
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
              {item.timestamp} {item.category && `• ${getCategoryEmoji(item.category)}`}
            </Text>
            
            {/* Render product cards */}
            {!isUser && renderProductCards(item.id)}
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

  const getCategoryEmoji = (category) => {
    const categoryMap = {
      build: "🔧",
      cpu: "⚡",
      gpu: "🎮",
      ram: "🧠",
      case: "📦",
      troubleshooting: "🔍",
      general: "💻"
    };
    return categoryMap[category] || "💻";
  };

  const QuickActions = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.quickActions}
      contentContainerStyle={styles.quickActionsContent}
    >
      <TouchableOpacity 
        style={[styles.quickAction, styles.buildAction]}
        onPress={() => setInput("Tư vấn build PC gaming 25 triệu cho tôi")}
      >
        <FontAwesome5 name="desktop" size={16} color="#667eea" />
        <Text style={styles.quickActionText}>Build PC</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.compareAction]}
        onPress={() => setInput("So sánh Intel i5-13400F vs AMD Ryzen 5 7600X")}
      >
        <MaterialIcons name="compare" size={16} color="#e53e3e" />
        <Text style={styles.quickActionText}>So sánh CPU</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.gpuAction]}
        onPress={() => setInput("VGA gaming tốt nhất cho 1440p trong tầm giá 15 triệu")}
      >
        <MaterialIcons name="videogame-asset" size={16} color="#38a169" />
        <Text style={styles.quickActionText}>VGA Gaming</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.ramAction]}
        onPress={() => setInput("Nên chọn RAM DDR4 hay DDR5 cho PC gaming 2024?")}
      >
        <MaterialIcons name="memory" size={16} color="#d69e2e" />
        <Text style={styles.quickActionText}>RAM</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.quickAction, styles.troubleAction]}
        onPress={() => setInput("PC tôi bị lag và tự tắt máy, nguyên nhân có thể là gì?")}
      >
        <MaterialIcons name="build" size={16} color="#9f7aea" />
        <Text style={styles.quickActionText}>Sửa lỗi</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // Show login dialog if needed
  if (loginLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={{ marginTop: 16, color: '#666' }}>Đang kiểm tra đăng nhập...</Text>
      </View>
    );
  }

  if (showLoginDialog) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <MaterialIcons name="computer" size={64} color="#667eea" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>
          HiPC AI Assistant
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>
          Vui lòng đăng nhập để sử dụng tính năng chat với AI
        </Text>
        <TouchableOpacity 
          style={{
            backgroundColor: '#667eea',
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8
          }}
          onPress={() => router.push('/login')}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: "height" })}
    >
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            {/* Nút back */}
            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.18)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerAvatar}>
              <MaterialIcons name="computer" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>HiPC AI Expert</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? "Đang phân tích..." : "PC Specialist • Powered by Gemini"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>AI</Text>
            </View>
            <Text style={styles.messageCount}>
              {dailyCount}/{DAILY_MESSAGE_LIMIT}
            </Text>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                setConversationHistory([]);
                initializeConversation();
                setMessages([messages[0]]); // Keep only welcome message
              }}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
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

      {/* Enhanced Input with Suggestions */}
      <View style={styles.inputContainer}>
        {/* Enhanced Quick Actions */}
        {messages.length <= 1 && <QuickActions />}
        
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Hỏi về PC, CPU, GPU, RAM, build gaming..."
            placeholderTextColor="#999"
            multiline
            maxLength={2000}
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
        
        {/* PC Stats Footer */}
        <View style={styles.statsFooter}>
          <View style={styles.statItem}>
            <MaterialIcons name="auto-awesome" size={12} color="#667eea" />
            <Text style={styles.statText}>Powered by Gemini AI</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={12} color="#38a169" />
            <Text style={styles.statText}>2024-2025 Updated</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="verified" size={12} color="#e53e3e" />
            <Text style={styles.statText}>Expert Verified</Text>
          </View>
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
    flex: 1,
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
    gap: 8,
  },
  proBadge: {
    backgroundColor: '#00d4aa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
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
    maxWidth: '90%',
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
    maxWidth: width * 0.82,
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
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  aiText: {
    color: '#2d3748',
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    opacity: 0.7,
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  aiTimestamp: {
    color: '#718096',
  },
  productsContainer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  productsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 8,
  },
  productsScroll: {
    marginHorizontal: -4,
  },
  productCard: {
    width: 130,
    marginHorizontal: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  productImageContainer: {
    width: 80,
    height: 60,
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
    marginBottom: 4,
    height: 32,
  },
  productPrice: {
    fontSize: 11,
    color: '#e53e3e',
    fontWeight: 'bold',
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
    maxWidth: '70%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typingText: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
    marginBottom: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#667eea',
  },
  quickActions: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  quickActionsContent: {
    paddingHorizontal: 10,
    gap: 8,
  },
  quickAction: {
    width: 70,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    marginVertical: 4,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  buildAction: {
    borderColor: '#667eea',
    backgroundColor: '#f7faff',
  },
  compareAction: {
    borderColor: '#e53e3e',
    backgroundColor: '#fef5f5',
  },
  gpuAction: {
    borderColor: '#38a169',
    backgroundColor: '#f0fff4',
  },
  ramAction: {
    borderColor: '#d69e2e',
    backgroundColor: '#fffaf0',
  },
  troubleAction: {
    borderColor: '#9f7aea',
    backgroundColor: '#faf5ff',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2d3748',
    marginTop: 6,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
    maxHeight: 120,
    marginRight: 12,
    paddingVertical: 8,
    textAlignVertical: 'top',
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
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '500',
  },
});