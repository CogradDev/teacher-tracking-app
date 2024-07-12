import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { RNCamera } from 'react-native-camera';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [cameraRef, setCameraRef] = useState(null);
  const [location, setLocation] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieData, setSelfieData] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [teacherId, setTeacherId] = useState('teacher_id_placeholder'); // Replace with actual teacher ID

  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (
          cameraPermission === PermissionsAndroid.RESULTS.GRANTED &&
          locationPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          captureSelfieAndLocation();
        } else {
          Alert.alert(
            'Permissions not granted',
            'Camera and location permissions are required.',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestPermissions();
  }, []);

  const captureSelfieAndLocation = () => {
    if (cameraRef) {
      cameraRef
        .takePictureAsync({ quality: 0.5, base64: true })
        .then(data => {
          setSelfieCaptured(true);
          setSelfieData(data.base64);
          Geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              setLocation({ latitude, longitude });
              const loginTime = new Date().toISOString();
              setLoginTime(loginTime);

              sendDataToServer(data.base64, latitude, longitude, loginTime);
            },
            error => {
              console.log(error);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
          );
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const sendDataToServer = (selfie, latitude, longitude, loginTime) => {
    const url = 'YOUR_SERVER_ENDPOINT'; // Replace with your server endpoint
    const teacherId = 'teacher_id_placeholder'; // Replace with actual teacher ID

    const data = {
      teacherId,
      selfie,
      latitude,
      longitude,
      loginTime,
    };

    axios
      .post(url, data)
      .then(response => {
        console.log('Data sent successfully:', response.data);
      })
      .catch(error => {
        console.log('Error sending data:', error);
      });
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  return (
    <View style={styles.container}>
      {!selfieCaptured && (
        <RNCamera
          ref={ref => setCameraRef(ref)}
          style={styles.hiddenCamera}
          type={RNCamera.Constants.Type.front}
          captureAudio={false}
          onCameraReady={captureSelfieAndLocation}
        />
      )}
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity onPress={navigateToCommunicationScreen}>
          <Icon
            name="notifications-outline"
            size={30}
            color="#6495ed"
            style={styles.notification}
          />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.welcomeContainer}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcome}>Hi!</Text>
            <Text style={styles.welcomeName}>Mrs. Radika</Text>
          </View>
          <Image
            source={require('../assets/image/Studying-bro.png')}
            style={styles.welcomeImage}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Updates</Text>
          <View style={[styles.card, styles.updateCard]}>
            <Text style={styles.cardTitle}>New Announcement</Text>
            <Text style={styles.cardDescriptionUrgent}>
              There will be a staff meeting at 4:00 PM today. Attendance is
              mandatory.
            </Text>
            <Text style={styles.cardDate}>Date: 03/07/2024</Text>
          </View>
          <View style={[styles.card, styles.updateCard]}>
            <Text style={styles.cardTitle}>Event Update</Text>
            <Text style={styles.cardDescriptionUrgent}>
              The Science Fair has been rescheduled to 10:00 AM tomorrow. Please
              prepare accordingly.
            </Text>
            <Text style={styles.cardDate}>Date: 03/07/2024</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrangement Classes</Text>
          <View style={[styles.card, styles.arrangementCard]}>
            <Text style={styles.cardTitle}>9:00 AM - Math</Text>
            <Text style={styles.cardDescriptionUrgent}>
              Teacher Absent. Please move to Class 102 for this session.
            </Text>
            <Text style={styles.cardClass}>New Class: 102</Text>
          </View>
          <View style={[styles.card, styles.arrangementCard]}>
            <Text style={styles.cardTitle}>10:00 AM - Science</Text>
            <Text style={styles.cardDescriptionUrgent}>
              Special Event. The class will be held in Class 204 instead of the
              usual room.
            </Text>
            <Text style={styles.cardClass}>New Class: 204</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Schedule</Text>
          <View style={[styles.card, styles.scheduleCard]}>
            <Text style={styles.cardTitle}>9:00 AM - Math</Text>
            <Text style={styles.cardDescription}>Lesson: Algebra</Text>
            <Text style={styles.cardClass}>Class: 101</Text>
          </View>
          <View style={[styles.card, styles.scheduleCard]}>
            <Text style={styles.cardTitle}>10:00 AM - Science</Text>
            <Text style={styles.cardDescription}>Lesson: Chemistry Lab</Text>
            <Text style={styles.cardClass}>Class: 202</Text>
          </View>
          <View style={[styles.card, styles.scheduleCard]}>
            <Text style={styles.cardTitle}>11:00 AM - English</Text>
            <Text style={styles.cardDescription}>Lesson: Literature</Text>
            <Text style={styles.cardClass}>Class: 303</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  hiddenCamera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 0.06 * width,
    fontWeight: 'bold',
    color: '#6495ed',
  },
  notification: {},
  scrollContainer: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  welcome: {
    fontSize: 0.07 * width,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeName: {
    fontSize: 0.06 * width,
    color: '#333',
  },
  welcomeImage: {
    width: 0.45 * width,
    height: 0.45 * width,
    resizeMode: 'contain',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 0.05 * width,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 12,
    borderBottomColor: '#6495ed',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  updateCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#FFA500',
  },
  arrangementCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  scheduleCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#6495ed',
  },
  cardTitle: {
    fontSize: 0.045 * width,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 0.038 * width,
    color: '#555',
    marginBottom: 4,
  },
  cardDescriptionUrgent: {
    fontSize: 0.038 * width,
    color: '#f00',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 0.035 * width,
    color: '#555',
  },
  cardClass: {
    fontSize: 0.035 * width,
    color: '#555',
  },
});

export default HomeScreen;
