import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useDispatch } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const phoneInput = useRef(null);
  const dispatch = useDispatch();

  const handleSendOtp = async () => {
    if (formattedValue.trim() === '') {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);

    // Simulate API call to send OTP
    setTimeout(() => {
      setIsLoading(false);
      setIsOtpSent(true);
    }, 2000);
  };

  const handleVerifyOtp = async () => {
    if (otp.trim() === '') {
      Alert.alert('Error', 'Please enter a valid OTP.');
      return;
    }

    setIsLoading(true);

    // Simulate API call to verify OTP
    setTimeout(async () => {
      setIsLoading(false);

      // Save login status in AsyncStorage
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('phone', formattedValue);

      // Check permissions
      checkPermissions();
    }, 2000);
  };

  const checkPermissions = async () => {
    const permissions = [
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
      PERMISSIONS.ANDROID.CALL_PHONE,
      PERMISSIONS.ANDROID.READ_CONTACTS,
    ];

    let allPermissionsGranted = true;

    for (const permission of permissions) {
      const result = await check(permission);
      if (result !== RESULTS.GRANTED) {
        const requestResult = await request(permission);
        if (requestResult !== RESULTS.GRANTED) {
          allPermissionsGranted = false;
          break;
        }
      }
    }

    if (allPermissionsGranted) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })
      );
    } else {
      navigation.navigate('Permission');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            <Image
              source={require('../assets/image/cograd-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Image
              source={require('../assets/image/login-screen.png')}
              style={styles.image}
              resizeMode="contain"
            />
            {!isOtpSent ? (
              <PhoneInput
                ref={phoneInput}
                defaultValue={value}
                defaultCode="IN"
                layout="first"
                onChangeText={text => setValue(text)}
                onChangeFormattedText={text => setFormattedValue(text)}
                placeholder="Phone Number"
                withDarkTheme
                withShadow
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneInputTextContainer}
              />
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                autoCapitalize="none"
                placeholderTextColor="#888"
              />
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={!isOtpSent ? handleSendOtp : handleVerifyOtp}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {!isOtpSent ? 'Send OTP' : 'Verify OTP'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: height * 0.02,
  },

  inner: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.4, // Adjusted to be relative to width
    marginBottom: width * 0.2,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: width * 0.05,
  },
  phoneInputContainer: {
    width: width * 0.8,
    borderWidth: 2,
    borderColor: '#6495ed',
    borderRadius: 12,
    padding: width * 0.02, // Adjusted to be relative to width
    marginBottom: width * 0.03,
  },
  phoneInputTextContainer: {
    paddingVertical: 0,
  },
  input: {
    width: width * 0.8,
    height: width * 0.15, // Adjusted to be relative to width
    borderWidth: 1,
    borderColor: '#6495ed',
    borderRadius: 12,
    padding: width * 0.04, // Adjusted to be relative to width
    marginBottom: width * 0.03,
    backgroundColor: '#f9f9f9',
    fontSize: width * 0.03,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    color: '#333',
  },
  button: {
    backgroundColor: '#6495ed',
    paddingVertical: width * 0.04, // Adjusted to be relative to width
    borderRadius: 10,
    width: width * 0.8,
    marginBottom: width * 0.04,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
