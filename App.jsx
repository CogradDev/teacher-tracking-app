import React, {useEffect, useState} from 'react';
import {Linking, ActivityIndicator, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Provider} from 'react-redux';
import 'react-native-gesture-handler';
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import CommunicationScreen from './src/screens/CommunicationScreen';
import ComplaintsScreen from './src/screens/ComplaintsScreen';
import messaging from '@react-native-firebase/messaging';
import {ThemeProvider} from './ThemeContext'; // Import ThemeProvider and useTheme
import {persistor, store} from './src/store/index';
import {PersistGate} from 'redux-persist/integration/react';

const Stack = createStackNavigator();

const NAVIGATION_IDS = [
  'Welcome',
  'Login',
  'Permission',
  'Communication',
  'Complaints',
  'Main',
];

function buildDeepLinkFromNotificationData(data) {
  console.log(data);
  const navigationId = data?.navigationId;
  if (!NAVIGATION_IDS.includes(navigationId)) {
    console.warn('Unverified navigationId', navigationId);
    return null;
  }
  if (navigationId === 'Main') {
    return 'myapp://Main';
  }
  if (navigationId === 'Communication') {
    return 'myapp://Communication';
  }
  return null;
}

const linking = {
  prefixes: ['myapp://'],
  config: {
    initialRouteName: 'Main',
    screens: {
      Main: 'Main',
      Notification: 'Communication',
    },
  },

  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (typeof url === 'string') {
      return url;
    }
    const message = await messaging().getInitialNotification();
    const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
    if (typeof deeplinkURL === 'string') {
      return deeplinkURL;
    }
  },

  subscribe(listener) {
    const onReceiveURL = ({url}) => listener(url);
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      // Handle Background Message Here
    });

    const foreground = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message has arrived', remoteMessage);
    });

    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const url = buildDeepLinkFromNotificationData(remoteMessage.data);
      if (typeof url === 'string') {
        listener(url);
      }
    });

    return () => {
      linkingSubscription.remove();
      unsubscribe();
      foreground();
    };
  },
};

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM Token', token);
      }
    };

    requestUserPermission();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        console.log('isLoggedIn:', isLoggedIn);

        if (isLoggedIn === 'true') {
          console.log('User is logged in: setting initial route to Main');
          setInitialRoute('Main');
        } else {
          console.log(
            'User is not logged in: setting initial route to Welcome',
          );
          setInitialRoute('Welcome');
        }
      } catch (e) {
        console.error('Failed to load login status.', e);
        setInitialRoute('Welcome');
      }
    };

    console.log('Calling checkLoginStatus');
    checkLoginStatus();
  }, []);

  if (initialRoute === null) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NavigationContainer linking={linking}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{headerShown: false}}>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Permission" component={PermissionScreen} />
              <Stack.Screen
                name="Communication"
                component={CommunicationScreen}
              />
              <Stack.Screen name="Complaints" component={ComplaintsScreen} />
              <Stack.Screen name="Main" component={BottomTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
