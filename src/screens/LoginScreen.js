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
  Alert,
  PermissionsAndroid,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import apiList from '../services/api';
import messaging from '@react-native-firebase/messaging';
import { useTheme } from '../../ThemeContext';




const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {theme} = useTheme();
  const styles = createStyles(theme);

  const phoneInput = useRef(null);


 

  const checkPermissions = async () => {
    try {
      const cameraGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      const locationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      const phoneStateGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE
      );

      const notificationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      )

      return cameraGranted && locationGranted && phoneStateGranted && notificationGranted;
    } catch (error) {
      console.log('Error checking permissions:', error);
      return false;
    }
  };

  
  const handleLogin = async () => {
    if (formattedValue.trim() === '') {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }


    const token = await messaging().getToken();

    setIsLoading(true);


    try {
      const response = await fetch(apiList.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: value, deviceToken: token}), //for formatted value use formattedValue
      });

      const data = await response.json();

      if (response.status === 200) {
        // Save login status, credentials, and parent data to AsyncStorage
        await AsyncStorage.setItem('isLoggedIn', "true");
        await AsyncStorage.setItem('phone', formattedValue);
        await AsyncStorage.setItem('teacherData', JSON.stringify(data));
        const permissionsGranted = await checkPermissions();

        const resetAction = CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });

        if (permissionsGranted) {
          navigation.dispatch(resetAction);
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Permission' }],
            })
          );
        }
      } else {
        Alert.alert('Error', 'Login failed. Please check your phone number.');
      }
    } catch (error) {
      console.error('Error during Login:', error);
      Alert.alert('Error', 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
              textInputProps={{
                placeholderTextColor: theme.gray, 
              }}
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <Text style={styles.buttonText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white,
    paddingBottom: height * 0.02,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 0.05,
  },
  inner: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.4,
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
    borderColor: theme.blue,
    borderRadius: 12,
    padding: width * 0.02,
    marginBottom: width * 0.03,
  },
  phoneInputTextContainer: {
    paddingVertical: 0,
  },
  input: {
    width: width * 0.8,
    height: width * 0.15,
    borderWidth: 1,
    borderColor: theme.blue,
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: width * 0.03,
    backgroundColor: theme.white,
    fontSize: width * 0.03,
    shadowColor: theme.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    color: theme.lightBlack,
  },
  button: {
    backgroundColor: theme.blue,
    paddingVertical: width * 0.04,
    borderRadius: 10,
    width: width * 0.8,
    marginBottom: width * 0.04,
  },
  buttonText: {
    color: theme.white,
    fontSize: width * 0.04,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LoginScreen;
