import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PermissionScreen from '../screens/PermissionScreen';
import BottomTabNavigator from './BottomTabNavigator';
import CommunicationScreen from '../screens/CommunicationScreen';
import 'react-native-gesture-handler';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        if (__DEV__) {
          setInitialRoute('Welcome');
          return;
        }

        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');

        if (isLoggedIn === 'true') {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Welcome');
        }
      } catch (e) {
        console.error('Failed to load login status.', e);
        setInitialRoute('Welcome');
      }
    };

    checkLoginStatus();
  }, []);

  if (initialRoute === null) {
    // Show a loading screen or nothing while checking the login status
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="Main" component={BottomTabNavigator} />
        <Stack.Screen name="Communication" component={CommunicationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
