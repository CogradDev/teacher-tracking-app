// AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PermissionScreen from '../screens/PermissionScreen';
import BottomTabNavigator from './BottomTabNavigator'; // Import the bottom tab navigator
import CommunicationScreen from '../screens/CommunicationScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Permission" component={PermissionScreen} />
        <Stack.Screen name="Home" component={BottomTabNavigator} />
        <Stack.Screen name="Communication" component={CommunicationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
