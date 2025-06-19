// components/Auth/AuthInput.jsx
import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthInput = ({ 
  icon, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  showPass, 
  setShowPass,
  keyboardType = 'default',
  autoCapitalize = 'sentences'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedIsFocused] = useState(new Animated.Value(value === '' ? 0 : 1));

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedIsFocused, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedIsFocused, {
      toValue: value === '' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const labelStyle = {
    position: 'absolute',
    left: 56,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -8],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ['#9CA3AF', isFocused ? '#8B5CF6' : '#6B7280'],
    }),
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    zIndex: 999,
  };

  return (
    <View style={styles.inputWrapper}>
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        value !== '' && styles.inputContainerFilled
      ]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          selectionColor="#8B5CF6"
        />
        <Animated.Text style={labelStyle}>
          {placeholder}
        </Animated.Text>
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPass(!showPass)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPass ? 'eye-outline' : 'eye-off-outline'} 
              size={22} 
              color={isFocused ? '#8B5CF6' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FAFAFA',
    position: 'relative',
    transition: 'all 0.2s ease',
  },
  inputContainerFocused: {
    borderColor: '#8B5CF6',
    backgroundColor: '#fff',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainerFilled: {
    backgroundColor: '#fff',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingTop: 8,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default AuthInput;