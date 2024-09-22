import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator, // Import ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import {useTheme} from '../../ThemeContext';
import AttendanceCalendar from '../components/AttendanceCalendar';

const {width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const [teacher, setTeacher] = useState(null);
  const [subjectNames, setSubjectNames] = useState([]);
  const [timetableData, setTimetableData] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state variable for loading

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherData = await AsyncStorage.getItem('teacherData');
        if (!teacherData) {
          throw new Error('Teacher data not found');
        }
        const parsedTeacherData = JSON.parse(teacherData);
        setTeacher(parsedTeacherData);
  
        if (parsedTeacherData && parsedTeacherData.teachSubjects) {
          const subjectIds = parsedTeacherData.teachSubjects;
          const subjectNames = await Promise.all(
            subjectIds.map(async subjectId => {
              try {
                const response = await fetch(apiList.getSubjectName(subjectId));
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                return data[0].subName;
              } catch (error) {
                console.error('Error fetching subject details:', error);
                return null;
              }
            })
          );
  
          const uniqueSubjectNames = Array.from(new Set(subjectNames));
          setSubjectNames(uniqueSubjectNames);
        }
  
        if (parsedTeacherData && parsedTeacherData.timetable) {
          const response = await fetch(
            apiList.getTimetableByTeacher(parsedTeacherData._id)
          );
          const data = await response.json();
  
          const updatedTimetable = data
            .filter(tt => tt.timePeriod !== 'X')
            .reduce((acc, entry) => {
              const day = entry.day;
              if (!acc[day]) {
                acc[day] = [];
              }
              acc[day].push(entry);
              return acc;
            }, {});
  
          // Sort each day's timetable by timePeriod using Date parsing
          Object.keys(updatedTimetable).forEach(day => {
            updatedTimetable[day].sort((a, b) => {
              const startTimeA = new Date(`1970-01-01T${parseTime(a.timePeriod.split('-')[0].trim())}`);
              const startTimeB = new Date(`1970-01-01T${parseTime(b.timePeriod.split('-')[0].trim())}`);
              return startTimeA - startTimeB;
            });
          });
  
          // Sort the days in serial order
          const dayOrder = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
          ];
          const sortedTimetable = dayOrder.reduce((acc, day) => {
            if (updatedTimetable[day]) {
              acc[day] = updatedTimetable[day];
            }
            return acc;
          }, {});
  
          setTimetableData(sortedTimetable);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  // Helper function to parse time to a 24-hour format in a standard way
  const parseTime = time => {
    const [hour, minutePart] = time.split(':');
    const minute = minutePart.slice(0, 2);
    const period = minutePart.slice(2); // Extract AM/PM part
  
    let hour24 = parseInt(hour, 10);
  
    if (period === 'PM' && hour24 < 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
  
    return `${hour24.toString().padStart(2, '0')}:${minute}`;
  };
  

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  // Function to request location permissions
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // iOS permission request (generally handled by the system prompt)
      return true;
    } else if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'This app needs access to your location to track your movements.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
  };

  const getCurrentPositionAsync = async (retryCount = 0) => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => {
          if (error.code === 3 && retryCount < 3) {
            // Error code 3 is timeout
            // Retry after a short delay if timeout happens
            setTimeout(() => {
              resolve(getCurrentPositionAsync(retryCount + 1));
            }, 2000);
          } else {
            reject(error);
          }
        },
        {enableHighAccuracy: false , timeout: 15000, maximumAge: 10000},
      );
    });
  };

  const handleLogout = async () => {
    if (!isLoggingOut) {
      try {
        setIsLoggingOut(true); // Start loader

        const locationPermissionGranted = await requestLocationPermission();
        if (!locationPermissionGranted) {
          Alert.alert(
            'Location Services Disabled',
            'Please enable location services and grant permission to track your location during logout.',
          );
          setIsLoggingOut(false);
          return;
        }

        try {
          const position = await getCurrentPositionAsync();
          const {latitude, longitude} = position.coords;
          const teacherId = teacher._id;
          const logoutTime = new Date().toISOString();

          const response = await fetch(apiList.sendLogoutTrack, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              teacherId,
              logoutTime,
              latitude,
              longitude,
            }),
          });

          const data = await response.json();

          if (response.status === 200) {
            await AsyncStorage.setItem('isLoggedInStatus', 'false');
            await AsyncStorage.clear();
            setIsLoggingOut(false);
            navigation.reset({
              index: 0,
              routes: [{name: 'Welcome'}],
            });
          } else {
            await AsyncStorage.setItem('isLoggedInStatus', 'false');
            await AsyncStorage.clear();
            setIsLoggingOut(false);
            navigation.reset({
              index: 0,
              routes: [{name: 'Welcome'}],
            });
           // Alert.alert('Logout Error', data.message);
          }
        } catch (locationError) {
          Alert.alert(
            'Location Error',
            'Unable to retrieve location. Please try again. If the problem persists, check your location settings or move to an area with better GPS signal.',
          );
          console.error('Geolocation error:', locationError);
          setIsLoggingOut(false);
        }
      } catch (error) {
        Alert.alert(
          'Logout Error',
          'An error occurred during logout. Please try again.',
        );
        console.error('Logout error:', error);
        setIsLoggingOut(false);
      }
    }
  };

  if (!teacher) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={0.075 * width} color={theme.blue} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <TouchableOpacity
          onPress={navigateToCommunicationScreen}
          style={styles.notification}>
          <Icon
            name="notifications-outline"
            size={0.075 * width}
            color={theme.blue}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <Image source={{uri: teacher.profile}} style={styles.profileImage} />
          <Text style={styles.name}>{teacher.name}</Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Subjects Taught:</Text>{' '}
            {subjectNames.join(', ')}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Contact Info:</Text> {teacher.contact}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Qualification:</Text>{' '}
            {teacher.qualification}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Experience:</Text>{' '}
            {teacher.experience}
          </Text>
          <AttendanceCalendar />

          <Text style={styles.sectionTitle}>Weekly Timetable</Text>
          <View style={styles.timetableContainer}>
            {Object.keys(timetableData).map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <Text style={styles.timetableDay}>{day}:</Text>
                {timetableData[day].map((entry, idx) => (
                  <View key={idx} style={styles.classEntry}>
                    <View style={styles.iconContainer}>
                      <Icon
                        name="time-outline"
                        size={0.045 * width}
                        color={theme.white}
                      />
                    </View>
                    <Text style={styles.classTime}>{entry.timePeriod}</Text>
                    <Text style={styles.classDetail}>
                      {entry.subjectId.subName} ({entry.classId.className})
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator size="small" color={theme.white} />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 0.04 * width,
      paddingHorizontal: 0.025 * width,
      backgroundColor: theme.white,
    },
    headingTextContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {},
    headerText: {
      fontSize: 0.06 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    notification: {},
    scrollContainer: {
      flexGrow: 1,
      paddingVertical: 0.05 * width,
      paddingHorizontal: 0.05 * width,
    },
    profileContainer: {
      padding: 0.05 * width,
      marginBottom: 0.05 * width,
      backgroundColor: theme.white,
      borderRadius: 0.025 * width,
      shadowColor: theme.black,
      shadowOffset: {width: 0, height: 0.05 * width},
      shadowOpacity: 0.2,
      shadowRadius: 0.05 * width,
      elevation: 3,
    },
    profileImage: {
      width: 0.4 * width,
      height: 0.4 * width,
      borderRadius: 0.2 * width,
      marginBottom: 0.05 * width,
      borderWidth: 0.0075 * width,
      borderColor: theme.blue,
      alignSelf: 'center',
    },
    name: {
      fontSize: 0.07 * width,
      fontWeight: 'bold',
      color: theme.lightBlack,
      marginBottom: 0.05 * width,
      textAlign: 'center',
    },
    detail: {
      fontSize: 0.045 * width,
      color: theme.gray,
      marginBottom: 0.025 * width,
      lineHeight: 0.065 * width,
    },
    boldText: {
      fontWeight: 'bold',
      color: theme.lightBlack,
    },
    sectionTitle: {
      fontSize: 0.055 * width,
      fontWeight: 'bold',
      color: theme.blue,
      marginVertical: 0.05 * width,
      textAlign: 'center',
    },
    timetableContainer: {
      paddingTop: 0.05 * width,
      borderTopWidth: 0.0025 * width,
      borderTopColor: theme.lightGray,
    },
    dayContainer: {
      marginBottom: 0.075 * width,
    },
    timetableDay: {
      fontSize: 0.05 * width,
      fontWeight: 'bold',
      color: theme.lightBlack,
      marginBottom: 0.025 * width,
    },
    classEntry: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.lightGray,
      padding: 0.025 * width,
      borderRadius: 0.015 * width,
      marginBottom: 0.015 * width,
    },
    iconContainer: {
      marginRight: 0.01 * width,
      backgroundColor: theme.blue,
      borderRadius: 0.025 * width,
      padding: 0.015 * width,
    },
    classTime: {
      fontSize: 0.04 * width,
      fontWeight: 'bold',
      alignSelf: 'center',
      color: theme.gray,
    },
    classDetail: {
      fontSize: 0.04 * width,
      color: theme.gray,
      lineHeight: 0.06 * width,
      flexShrink: 1,
    },
    logoutButton: {
      backgroundColor: theme.blue,
      padding: 0.05 * width,
      borderRadius: 0.025 * width,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 0.05 * width,
    },
    logoutButtonText: {
      color: 'white',
      fontSize: 0.045 * width,
      fontWeight: 'bold',
    },
  });

export default ProfileScreen;
