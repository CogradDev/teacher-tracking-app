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
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [cameraRef, setCameraRef] = useState(null);
  const [location, setLocation] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [selfieData, setSelfieData] = useState(null);
  const [loginTime, setLoginTime] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [teacherId, setTeacherId] = useState('teacherId');
  const [teacherName, setTeacherName] = useState('');

  useEffect(() => {
    const Data = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      const parsedTeacherData = JSON.parse(teacherData);
      setTeacherId(parsedTeacherData._id);
      setTeacherName(parsedTeacherData.name);
      fetchAnnouncements(parsedTeacherData._id);
    };

    Data();
  }, []);

  const [arrangements, setArrangements] = useState([]);
  const [classPeriods, setClassPeriods] = useState([]);

  const fetchAnnouncements = async teacherId => {
    try {
      const response = await fetch(apiList.getAnnouncements(teacherId));
      const data = await response.json();
      setAnnouncements(data);
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
        console.log('Data sent successfully:', response);
      })
      .catch(error => {
        console.log('Error sending data:', error);
      });
  };

  const fetchArrangements = async teacherId => {
    try {
      const response = await fetch(apiList.getArrangementClass(teacherId));

      if (response.ok) {
        const data = await response.json();
        setArrangements(data); // Assuming data is an array
      } else {
        console.error('Failed to fetch arrangements:', response.status);
      }
    } catch (error) {
      console.error('Error fetching arrangements:', error);
    }
  };

  const fetchClassPeriods = async teacherId => {
    try {
      const response = await fetch(apiList.getClassPeriodByTeacher(teacherId));
      if (response.ok) {
        const data = await response.json();
        setClassPeriods(data); // Assuming data is an array
      } else {
        console.error('Failed to fetch class periods:', response.status);
      }
    } catch (error) {
      console.error('Error fetching class periods:', error);
    }
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };


  const formattedTime = (time) =>{
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }
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
            <Text style={styles.welcomeName}>{teacherName}</Text>
          </View>
          <Image
            source={require('../assets/image/Studying-bro.png')}
            style={styles.welcomeImage}
          />
        </View>

        {announcements.length !== 0 ? (
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
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Arrangement Classes</Text>
          {arrangements.length === 0 ? (
            <Text style={styles.noDataText}>No arrangement classes today.</Text>
          ) : (
            arrangements.map((arrangement, index) => (
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
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Schedule</Text>
          {classPeriods.length === 0 ? (
            <Text style={styles.noDataText}>No classes today.</Text>
          ) : (
            classPeriods.map((classPeriod, index) => (
              <View key={index} style={[styles.card, styles.scheduleCard]}>
                <Text
                  style={
                    styles.cardTitle
                  }>{`${formattedTime(classPeriod.date)} - ${classPeriod.subject}`}</Text>

                <Text
                  style={
                    styles.cardClass
                  }>{`Class: ${classPeriod.class}`}</Text>
              </View>
            ))
          )}
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
    borderBottomWidth: 2,
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
