import React, {useState, useRef} from 'react';
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
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import {useDispatch} from 'react-redux';
import {CommonActions} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import apiList from '../services/api';

const {width, height} = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const phoneInput = useRef(null);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (formattedValue.trim() === '') {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiList.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: value }), //for formated value use formatedValue
      });

      const data = response.data;
      console.log('Login response data:', data);

      if (response.status === 200) {
        // Save login status, credentials, and parent data to AsyncStorage
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('phone', formattedValue);
        await AsyncStorage.setItem('teacherData', JSON.stringify(data));

        // Check permissions
        checkPermissions();
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
          routes: [{name: 'Home'}],
        }),
      );
    } else {
      navigation.navigate('Permission');
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
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    borderColor: '#6495ed',
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
    borderColor: '#6495ed',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: width * 0.03,
    backgroundColor: '#f9f9f9',
    fontSize: width * 0.03,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    color: '#333',
  },
  button: {
    backgroundColor: '#6495ed',
    paddingVertical: width * 0.04,
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
