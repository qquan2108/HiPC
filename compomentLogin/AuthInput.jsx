// components/Auth/AuthInput.jsx
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const AuthInput = forwardRef(({
  icon, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  showPass, 
  setShowPass,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  returnKeyType,
  blurOnSubmit,
  onSubmitEditing
}, ref) => {
  return (
    <View style={styles.inputWrapper}>
      <View style={styles.inputContainer}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          ref={ref}
          style={styles.input}
          value={value ?? ''}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPass}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          selectionColor="#8B5CF6"
          returnKeyType={returnKeyType}
          blurOnSubmit={blurOnSubmit}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={() => setShowPass(prev => !prev)}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={showPass ? 'eye-outline' : 'eye-off-outline'} 
              size={22} 
              color="#8B5CF6"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

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
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
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
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default AuthInput;