import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
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

const { width, height } = Dimensions.get('window');

// Enhanced API configuration
const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";
const BACKUP_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";

// Increased rate limiting for professional use
const DAILY_MESSAGE_LIMIT = 50;
const STORAGE_KEY = 'hipc_ai_daily_count';

// PC Knowledge Base
const PC_KNOWLEDGE = {
  processors: {
    intel: ['i3-13100F', 'i5-13400F', 'i5-13600K', 'i7-13700K', 'i9-13900K', 'i5-14400F', 'i7-14700K'],
    amd: ['Ryzen 5 5600X', 'Ryzen 5 7600X', 'Ryzen 7 5800X3D', 'Ryzen 7 7700X', 'Ryzen 9 7900X', 'Ryzen 9 7950X']
  },
  graphics: {
    nvidia: ['RTX 4060', 'RTX 4060 Ti', 'RTX 4070', 'RTX 4070 Ti', 'RTX 4080', 'RTX 4090'],
    amd: ['RX 7600', 'RX 7700 XT', 'RX 7800 XT', 'RX 7900 XT', 'RX 7900 XTX']
  },
  ram: {
    ddr4: ['3200MHz', '3600MHz'],
    ddr5: ['5600MHz', '6000MHz', '6400MHz']
  },
  motherboards: {
    intel: ['B660', 'B760', 'Z690', 'Z790'],
    amd: ['B550', 'X570', 'B650', 'X670']
  }
};

// Build recommendations based on budget
const BUILD_RECOMMENDATIONS = {
  budget: {
    name: "Build Tiết Kiệm",
    budget: "15-20 triệu",
    cpu: "i5-13400F hoặc Ryzen 5 5600X",
    gpu: "RTX 4060 hoặc RX 7600",
    ram: "16GB DDR4-3200",
    storage: "512GB NVMe SSD",
    psu: "650W 80+ Bronze"
  },
  mid: {
    name: "Build Tầm Trung",
    budget: "25-35 triệu",
    cpu: "i5-13600K hoặc Ryzen 7 5800X3D",
    gpu: "RTX 4070 hoặc RX 7700 XT",
    ram: "32GB DDR4-3600",
    storage: "1TB NVMe SSD",
    psu: "750W 80+ Gold"
  },
  high: {
    name: "Build Cao Cấp",
    budget: "40-60 triệu",
    cpu: "i7-13700K hoặc Ryzen 9 7900X",
    gpu: "RTX 4070 Ti hoặc RTX 4080",
    ram: "32GB DDR5-6000",
    storage: "2TB NVMe SSD",
    psu: "850W 80+ Gold"
  },
  extreme: {
    name: "Build Enthusiast",
    budget: "70+ triệu",
    cpu: "i9-13900K hoặc Ryzen 9 7950X",
    gpu: "RTX 4090",
    ram: "64GB DDR5-6400",
    storage: "2TB + 4TB NVMe SSD",
    psu: "1000W 80+ Platinum"
  }
};

export default function PCChatBoxAI() {
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
  const flatListRef = useRef();
  const inputRef = useRef();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadDailyCount();
    
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

  // Advanced PC knowledge response system
  const generatePCResponse = (userInput) => {
    const input = userInput.toLowerCase();
    
    // Build PC recommendations
    if (input.includes('build') || input.includes('cấu hình')) {
      if (input.includes('rẻ') || input.includes('tiết kiệm') || input.includes('15') || input.includes('20')) {
        return formatBuildRecommendation(BUILD_RECOMMENDATIONS.budget);
      }
      if (input.includes('tầm trung') || input.includes('25') || input.includes('30') || input.includes('35')) {
        return formatBuildRecommendation(BUILD_RECOMMENDATIONS.mid);
      }
      if (input.includes('cao cấp') || input.includes('40') || input.includes('50') || input.includes('60')) {
        return formatBuildRecommendation(BUILD_RECOMMENDATIONS.high);
      }
      if (input.includes('khủng') || input.includes('70') || input.includes('enthusiast')) {
        return formatBuildRecommendation(BUILD_RECOMMENDATIONS.extreme);
      }
      return "💡 **Tư vấn Build PC**\n\nĐể tư vấn chính xác, bạn có thể cho tôi biết:\n• Ngân sách dự kiến?\n• Mục đích sử dụng (gaming, làm việc, streaming)?\n• Có ưu tiên thương hiệu nào không?\n\n📋 **Các mức ngân sách phổ biến:**\n• 15-20 triệu: Build tiết kiệm\n• 25-35 triệu: Build tầm trung\n• 40-60 triệu: Build cao cấp\n• 70+ triệu: Build enthusiast";
    }

    // CPU comparisons
    if (input.includes('cpu') || input.includes('processor') || input.includes('bộ xử lý')) {
      if (input.includes('intel') && input.includes('amd')) {
        return "🔥 **So sánh Intel vs AMD 2024**\n\n**Intel:**\n• Hiệu năng đơn luồng tốt hơn\n• Tối ưu cho gaming\n• Tiêu thụ điện cao hơn\n• Giá thành cao\n\n**AMD:**\n• Hiệu năng đa luồng mạnh\n• Giá/hiệu năng tốt\n• Tiết kiệm điện\n• Tương thích socket lâu dài\n\n💡 **Gợi ý:** Gaming chọn Intel, làm việc đa tác vụ chọn AMD";
      }
      if (input.includes('gaming')) {
        return "🎮 **CPU Gaming Tốt Nhất 2024**\n\n**Tầm trung:**\n• Intel i5-13400F - 5.5 triệu\n• AMD Ryzen 5 5600X - 4.8 triệu\n\n**Cao cấp:**\n• Intel i5-13600K - 7.2 triệu\n• AMD Ryzen 7 5800X3D - 8.5 triệu\n\n**Enthusiast:**\n• Intel i7-13700K - 10.5 triệu\n• AMD Ryzen 9 7900X - 12 triệu\n\n🏆 **Khuyến nghị:** 5800X3D là vua gaming hiện tại!";
      }
      return "🔧 **Tư vấn CPU**\n\nCho tôi biết thêm:\n• Ngân sách CPU?\n• Mục đích sử dụng?\n• Mainboard hiện tại (nếu nâng cấp)?\n\n📊 **CPU Hot 2024:**\n• Budget: i3-13100F, R5 5600X\n• Mid-range: i5-13400F, R7 5700X\n• High-end: i7-13700K, R9 7900X";
    }

    // GPU advice
    if (input.includes('vga') || input.includes('gpu') || input.includes('card đồ họa')) {
      if (input.includes('gaming')) {
        return "🎮 **GPU Gaming 2024**\n\n**1080p Gaming:**\n• RTX 4060 - 9.5tr (Tốt nhất)\n• RX 7600 - 8.2tr (Giá rẻ)\n\n**1440p Gaming:**\n• RTX 4070 - 15.5tr\n• RX 7700 XT - 13.8tr\n\n**4K Gaming:**\n• RTX 4080 - 28tr\n• RTX 4090 - 42tr\n\n💡 **Lưu ý:** RTX có DLSS, RX có giá tốt hơn";
      }
      return "🎯 **Tư vấn VGA**\n\nBạn chơi game ở độ phân giải nào?\n• 1080p → RTX 4060/RX 7600\n• 1440p → RTX 4070/RX 7700 XT\n• 4K → RTX 4080/4090\n\n🔥 **Xu hướng 2024:**\n• Ray Tracing phổ biến\n• DLSS 3.0 frame gen\n• 16GB VRAM sẽ cần thiết";
    }

    // RAM advice
    if (input.includes('ram') || input.includes('bộ nhớ')) {
      return "🧠 **Tư vấn RAM 2024**\n\n**Dung lượng:**\n• 16GB: Đủ dùng gaming\n• 32GB: Content creation\n• 64GB: Workstation chuyên nghiệp\n\n**Tốc độ:**\n• DDR4: 3200MHz (tối thiểu), 3600MHz (tối ưu)\n• DDR5: 5600MHz (entry), 6000MHz+ (high-end)\n\n**Thương hiệu tin cậy:**\n• Corsair, G.Skill, Kingston HyperX\n\n💡 **Lưu ý:** Dual channel luôn tốt hơn single!";
    }

    // Motherboard advice
    if (input.includes('main') || input.includes('bo mạch chủ') || input.includes('motherboard')) {
      return "🔌 **Tư vấn Mainboard**\n\n**Intel 13th gen:**\n• B660: Budget (6-8tr)\n• B760: Mainstream (8-12tr)\n• Z690/Z790: Enthusiast (15-25tr)\n\n**AMD AM4:**\n• B550: Tốt nhất cho Ryzen 5000\n• X570: Full feature\n\n**AMD AM5:**\n• B650: Entry DDR5\n• X670: High-end\n\n⚡ **Chọn theo CPU và tính năng cần thiết!**";
    }

    // Storage advice
    if (input.includes('ssd') || input.includes('ổ cứng') || input.includes('storage')) {
      return "💾 **Tư vấn Storage 2024**\n\n**SSD NVMe (Ưu tiên):**\n• 512GB: Gaming cơ bản\n• 1TB: Khuyến nghị\n• 2TB+: Content creator\n\n**Thương hiệu tốt:**\n• Samsung 980 Pro\n• WD Black SN850X\n• Crucial P5 Plus\n\n**HDD (Lưu trữ):**\n• 2-4TB cho dữ liệu lớn\n• Seagate, WD Blue\n\n🚀 **Gen4 SSD cho PS5 và high-end PC!**";
    }

    // PSU advice
    if (input.includes('psu') || input.includes('nguồn') || input.includes('power supply')) {
      return "⚡ **Tư vấn PSU**\n\n**Công suất theo build:**\n• Budget (RTX 4060): 650W\n• Mid-range (RTX 4070): 750W\n• High-end (RTX 4080): 850W\n• Extreme (RTX 4090): 1000W+\n\n**Chứng nhận:**\n• 80+ Bronze: Tối thiểu\n• 80+ Gold: Khuyến nghị\n• 80+ Platinum: Cao cấp\n\n**Thương hiệu uy tín:**\nCorsair, Seasonic, EVGA, Antec\n\n⚠️ **Không tiết kiệm với PSU!**";
    }

    // Troubleshooting
    if (input.includes('lỗi') || input.includes('không boot') || input.includes('tắt máy')) {
      return "🔧 **Troubleshooting PC**\n\n**Máy không khởi động:**\n• Kiểm tra nguồn, cáp điện\n• Ram bị lỏng hoặc hỏng\n• PSU không đủ công suất\n\n**Máy tự tắt:**\n• Quá nhiệt CPU/GPU\n• PSU không ổn định\n• Ram lỗi\n\n**Blue Screen:**\n• Cập nhật driver\n• Kiểm tra Ram\n• Kiểm tra nhiệt độ\n\n📞 **Cần hỗ trợ chi tiết? Mô tả triệu chứng cụ thể!**";
    }

    // Price guidance
    if (input.includes('giá') || input.includes('price') || input.includes('bao nhiêu')) {
      return "💰 **Bảng Giá PC Components (VND)**\n\n**CPU:**\n• i5-13400F: ~5.5tr\n• R5 5600X: ~4.8tr\n• i7-13700K: ~10.5tr\n\n**GPU:**\n• RTX 4060: ~9.5tr\n• RTX 4070: ~15.5tr\n• RTX 4080: ~28tr\n\n**RAM:**\n• 16GB DDR4-3200: ~1.8tr\n• 32GB DDR5-6000: ~4.5tr\n\n💡 **Giá thay đổi thường xuyên, check tại các shop uy tín!**";
    }

    // Default PC responses
    const pcResponses = [
      "🤔 Đây là câu hỏi thú vị về PC! Có thể bạn nói rõ hơn về:\n• Loại linh kiện quan tâm?\n• Ngân sách dự kiến?\n• Mục đích sử dụng?",
      "💻 Tôi chuyên tư vấn về PC, gaming setup và build máy tính. Hãy hỏi tôi về CPU, GPU, RAM, hay bất kỳ vấn đề PC nào!",
      "🔧 Là chuyên gia PC, tôi luôn sẵn sàng giúp bạn tìm ra giải pháp tối ưu. Bạn cần tư vấn gì cụ thể?",
      "⚡ Trong thế giới PC luôn thay đổi, tôi ở đây để cập nhật cho bạn những thông tin mới nhất. Bạn quan tâm đến điều gì?"
    ];

    return pcResponses[Math.floor(Math.random() * pcResponses.length)];
  };

  const formatBuildRecommendation = (build) => {
    return `🎮 **${build.name}**\n💰 **Ngân sách:** ${build.budget}\n\n` +
           `🔥 **CPU:** ${build.cpu}\n` +
           `🎯 **GPU:** ${build.gpu}\n` +
           `🧠 **RAM:** ${build.ram}\n` +
           `💾 **Storage:** ${build.storage}\n` +
           `⚡ **PSU:** ${build.psu}\n\n` +
           `💡 **Lưu ý:** Giá có thể thay đổi theo thời gian. Bạn có muốn tôi tư vấn chi tiết về từng linh kiện không?`;
  };

  const callAI = async (userInput) => {
    try {
      // First try to get PC-specific response
      const pcResponse = generatePCResponse(userInput);
      if (pcResponse) {
        return pcResponse;
      }

      // If no PC-specific response, try API
      let response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `PC Expert: ${userInput}`,
          parameters: {
            max_length: 150,
            temperature: 0.7,
            do_sample: true,
            pad_token_id: 50256
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
        aiText = aiText.replace(`PC Expert: ${userInput}`, '').trim();
        if (aiText && aiText.length > 10) {
          return aiText;
        }
      }
      
      throw new Error('Invalid response format');
      
    } catch (error) {
      console.log('AI API Error:', error);
      return generatePCResponse(userInput);
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
      text: input,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    Vibration.vibrate(50);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = await callAI(input);
      
      const aiMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString(),
        category: detectCategory(input)
      };

      setMessages((prev) => [...prev, aiMsg]);
      await updateDailyCount(dailyCount + 1);
      
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        from: "ai",
        text: "⚠️ Có lỗi xảy ra với hệ thống AI. Tuy nhiên, tôi vẫn có thể tư vấn PC dựa trên kiến thức chuyên môn. Hãy thử hỏi lại! 🔧",
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

  const detectCategory = (input) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('build') || lowerInput.includes('cấu hình')) return 'build';
    if (lowerInput.includes('cpu') || lowerInput.includes('processor')) return 'cpu';
    if (lowerInput.includes('gpu') || lowerInput.includes('vga')) return 'gpu';
    if (lowerInput.includes('ram') || lowerInput.includes('bộ nhớ')) return 'ram';
    return 'general';
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
        onPress={() => setInput("Tư vấn build PC gaming 25 triệu")}
      >
        <FontAwesome5 name="desktop" size={16} color="#667eea" />
        <Text style={styles.quickActionText}>Build PC</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.compareAction]}
        onPress={() => setInput("So sánh Intel vs AMD 2024")}
      >
        <MaterialIcons name="compare" size={16} color="#e53e3e" />
        <Text style={styles.quickActionText}>So sánh CPU</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.gpuAction]}
        onPress={() => setInput("VGA gaming tốt nhất 2024")}
      >
        <MaterialIcons name="videogame-asset" size={16} color="#38a169" />
        <Text style={styles.quickActionText}>VGA Gaming</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.quickAction, styles.ramAction]}
        onPress={() => setInput("Tư vấn RAM cho gaming")}
      >
        <MaterialIcons name="memory" size={16} color="#d69e2e" />
        <Text style={styles.quickActionText}>RAM</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.quickAction, styles.troubleAction]}
        onPress={() => setInput("PC tôi bị lỗi gì?")}
      >
        <MaterialIcons name="build" size={16} color="#9f7aea" />
        <Text style={styles.quickActionText}>Sửa lỗi</Text>
      </TouchableOpacity>
    </ScrollView>
  );

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
            <View style={styles.headerAvatar}>
              <MaterialIcons name="computer" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.headerTitle}>HiPC AI Expert</Text>
              <Text style={styles.headerSubtitle}>
                {loading ? "Đang phân tích..." : "PC Specialist • Online"}
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
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
            maxLength={1000}
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
            <MaterialIcons name="computer" size={12} color="#667eea" />
            <Text style={styles.statText}>PC Expert</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="trending-up" size={12} color="#38a169" />
            <Text style={styles.statText}>2024 Updated</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="verified" size={12} color="#e53e3e" />
            <Text style={styles.statText}>Verified Info</Text>
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
    backgroundColor: '#ffd700',
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
    width: 64,
    height: 78,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
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
    fontWeight: '500',
    color: '#2d3748',
    marginTop: 6,
    textAlign: 'center',
    flexShrink: 1,
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