import React, {useState, useEffect} from 'react';
import {Alert, Linking} from 'react-native';
import {RNCamera} from 'react-native-camera';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

const LoginTracking = ({teacherId, onLoginSuccess}) => {
  const [cameraRef, setCameraRef] = useState(null);
  const [location, setLocation] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieData, setSelfieData] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [isLoggedInStatus, setIsloggedInStatus] = useState('');

  useEffect(() => {
    const fetchLoginStatus = async () => {
      const status = await AsyncStorage.getItem('isLoggedInStatus');
      setIsloggedInStatus(status);
      if (status !== 'true') {
        setSelfieCaptured(false);
      }
    };

    fetchLoginStatus();
  }, []);

  const areLocationServicesEnabled = async () => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        position => resolve(true),
        error => resolve(false),
        {enableHighAccuracy: true, timeout: 10000},
      );
    });
  };

  const promptToEnableLocation = async () => {
    const locationEnabled = await areLocationServicesEnabled();
    if (!locationEnabled) {
      return new Promise(resolve => {
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services to track your location.',
          [
            {
              text: 'Retry',
              onPress: async () => {
                resolve(promptToEnableLocation());
              },
            },
          ],
          {cancelable: false},
        );
      });
    }
    return true;
  };

  const getCurrentPositionAsync = async (retryCount = 0) => {
    try {
      return await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => {
            if (error.code === 3 && retryCount < 3) {
              setTimeout(() => {
                resolve(getCurrentPositionAsync(retryCount + 1));
              }, 2000);
            } else {
              reject(error);
            }
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
    } catch (error) {
      throw error; // Propagate the error to the caller
    }
  };
  
  
  const captureSelfieAndLocation = async () => {
    try {
      if (!cameraRef) {
        Alert.alert('Error', 'Camera not available');
        return;
      }
  
      // Capture the selfie
      const originalSelfie = await cameraRef.takePictureAsync({
        quality: 0.5,
        base64: true,
      });
  
      // Resize the image
      const resizedImage = await ImageResizer.createResizedImage(
        originalSelfie.uri,
        800, // New width
        600, // New height
        'JPEG', // Image format
        80 // Quality percentage
      );
  
      // Convert resized image to Base64
      const resizedImageBase64 = await RNFS.readFile(resizedImage.uri, 'base64');
  
      setSelfieCaptured(true);
      setSelfieData(resizedImageBase64);
  
      // Get location and send data
      const locationEnabled = await promptToEnableLocation();
      if (locationEnabled) {
        try {
          const position = await getCurrentPositionAsync();
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
  
          const loginTime = new Date().toISOString();
          setLoginTime(loginTime);
  
          await sendDataToServer(resizedImageBase64, latitude, longitude, loginTime);
          onLoginSuccess(); // Notify parent component of successful login
        } catch (locationError) {
          Alert.alert('Error Getting Location', 'Unable to retrieve location. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error Capturing Selfie', error.message || 'Unknown error');
    }
  };



  const sendDataToServer = async (selfie, latitude, longitude, loginTime) => {
    try {
      const trackdata = {
        teacherId,
        selfie,
        latitude,
        longitude,
        loginTime,
      };
  
      console.log(trackdata);
  
      const response = await fetch(apiList.sendLoginTrack, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trackdata),
      });
  
      if (!response.ok) {
        const errorText = await response.text(); // Get the response text, which might be HTML or something else.
        let errorMessage = 'Unknown error';
        try {
          const errorData = JSON.parse(errorText); // Try to parse the error as JSON.
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If parsing fails, the error might not be JSON, so use the raw text.
          errorMessage = errorText;
        }
        Alert.alert('Error Sending Data', errorMessage);
        return;
      }
  
      const data = await response.json(); // Parse the successful response as JSON.
      await AsyncStorage.setItem('isLoggedInStatus', 'true');
    } catch (error) {
      Alert.alert('Error Sending Data', error.message || 'Unknown error');
    }
  };
  
  return !selfieCaptured && isLoggedInStatus !== 'true' ? (
    <RNCamera
      ref={ref => setCameraRef(ref)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        opacity: 0,
      }}
      type={RNCamera.Constants.Type.front}
      captureAudio={false}
      onCameraReady={captureSelfieAndLocation}
    />
  ) : null;
};

export default LoginTracking;
