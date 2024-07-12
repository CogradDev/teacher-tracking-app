import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen';
import ClassActivityTrackingScreen from '../screens/ClassActivityTrackingScreen';
import PerformanceMatricesScreen from '../screens/PerformanceMatricesScreen';
import CommunicationScreen from '../screens/CommunicationScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AttendanceScreen from '../screens/AttendanceScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'ClassActivity') {
            iconName = 'clipboard-outline';
          } else if (route.name === 'Performance') {
            iconName = 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Attendance') {
            iconName = 'checkmark-done-outline'; // Icon for Attendance
          }
          return (
            <View style={focused ? styles.iconContainerActive : styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={size}
                color={color}
                style={focused ? styles.iconActive : styles.icon}
              />
            </View>
          );
        },
        tabBarActiveTintColor: '#6495ed',
        tabBarInactiveTintColor: 'gray',
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          height: 70,
          ...styles.shadow
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Attendance" component={AttendanceScreen} />
      <Tab.Screen name="ClassActivity" component={ClassActivityTrackingScreen} />
      <Tab.Screen name="Performance" component={PerformanceMatricesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#7f5df0',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 5,
  },
  icon: {
    color: 'gray',
  },
  iconActive: {
    color: '#ffffff',
    backgroundColor: '#6495ed',
    borderRadius: 50,
    padding: 10,
  }
});

export default BottomTabNavigator;
