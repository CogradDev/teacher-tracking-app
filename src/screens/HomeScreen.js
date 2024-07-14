import React, {useEffect, useState} from 'react';
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
import {useNavigation} from '@react-navigation/native';
import {RNCamera} from 'react-native-camera';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import apiList from '../services/api';

const {width} = Dimensions.get('window');
const baseURL = 'YOUR_BASE_URL'; // Replace with your base URL

const HomeScreen = () => {
  const navigation = useNavigation();
  const [cameraRef, setCameraRef] = useState(null);
  const [location, setLocation] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieData, setSelfieData] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [teacherId, setTeacherId] = useState('teacherId');

  useEffect(() => {
    const Data = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      const parsedTeacherData = JSON.parse(teacherData);
      setTeacherId(parsedTeacherData._id);
      fetchAnnouncements(parsedTeacherData._id);
    };

    Data();
  }, []);

  const [arrangements, setArrangements] = useState([]);
  const [classPeriods, setClassPeriods] = useState([]);

  const fetchAnnouncements = async teacherId => {
    try {
      const response = await axios.get(apiList.getAnnouncements(teacherId));
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

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

  useEffect(() => {
    if (teacherId) {
      fetchArrangements(teacherId);
      fetchClassPeriods(teacherId);
    }
  }, [teacherId]);

  const captureSelfieAndLocation = () => {
    if (cameraRef) {
      cameraRef
        .takePictureAsync({quality: 0.5, base64: true})
        .then(data => {
          setSelfieCaptured(true);
          setSelfieData(data.base64);
          Geolocation.getCurrentPosition(
            position => {
              const {latitude, longitude} = position.coords;
              setLocation({latitude, longitude});
              const loginTime = new Date().toISOString();
              setLoginTime(loginTime);

              sendDataToServer(data.base64, latitude, longitude, loginTime);
            },
            error => {
              console.log(error);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  const sendDataToServer = (selfie, latitude, longitude, loginTime) => {
    const data = {
      teacherId,
      selfie,
      latitude,
      longitude,
      loginTime,
    };

    fetch(apiList.sendLoginTrack, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data), //for formated value use formatedValue
    })
      .then(response => {
        console.log('Data sent successfully:', response.data);
      })
      .catch(error => {
        console.log('Error sending data:', error);
      });
  };

  const fetchArrangements = teacherId => {
    fetch(apiList.getArrangementClass(teacherId))
      .then(response => {
        setArrangements(response.data);
      })
      .catch(error => {
        console.log('Error fetching arrangements:', error);
      });
  };

  const fetchClassPeriods = teacherId => {
    fetch(apiList.getClassPeriodByTeacher(teacherId))
      .then(response => {
        setClassPeriods(response.data);
      })
      .catch(error => {
        console.log('Error fetching class periods:', error);
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
          {announcements.map(announcement => (
            <View
              key={announcement._id}
              style={[styles.card, styles.updateCard]}>
              <Text style={styles.cardTitle}>{announcement.title}</Text>
              <Text style={styles.cardDescriptionUrgent}>
                {announcement.content}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrangement Classes</Text>
          {arrangements.map((arrangement, index) => (
            <View key={index} style={[styles.card, styles.arrangementCard]}>
              <Text
                style={
                  styles.cardTitle
                }>{`${arrangement.date} - ${arrangement.subject}`}</Text>
              <Text style={styles.cardDescriptionUrgent}>
                {arrangement.arrangementReason}
              </Text>
              <Text
                style={
                  styles.cardClass
                }>{`New Class: ${arrangement.class}`}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Schedule</Text>
          {classPeriods.map((classPeriod, index) => (
            <View key={index} style={[styles.card, styles.scheduleCard]}>
              <Text
                style={
                  styles.cardTitle
                }>{`${classPeriod.date} - ${classPeriod.subject}`}</Text>
              <Text
                style={
                  styles.cardDescription
                }>{`Lesson: ${classPeriod.tasks.join(', ')}`}</Text>
              <Text
                style={styles.cardClass}>{`Class: ${classPeriod.class}`}</Text>
            </View>
          ))}
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
    width: 0.5 * width,
    height: 0.25 * width,
    resizeMode: 'contain',
  },
  section: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderTopWidth: 1,
    borderTopColor: '#D1D5DB',
  },
  sectionTitle: {
    fontSize: 0.05 * width,
    fontWeight: 'bold',
    color: '#6495ed',
    marginBottom: 8,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },
  cardTitle: {
    fontSize: 0.045 * width,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  cardDescription: {
    fontSize: 0.04 * width,
    color: '#333',
  },
  cardDescriptionUrgent: {
    fontSize: 0.04 * width,
    color: '#ff0000',
  },
  cardClass: {
    fontSize: 0.04 * width,
    marginTop: 8,
    color: '#333',
  },
  cardDate: {
    fontSize: 0.035 * width,
    marginTop: 8,
    color: '#888',
  },
});

export default HomeScreen;
