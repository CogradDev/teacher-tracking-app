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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../../ThemeContext';
import LoginTracking from './LoginTracking';

const {width} = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [teacherId, setTeacherId] = useState('teacherId');
  const [teacherName, setTeacherName] = useState('');
  const [isLoggedInStatus, setIsloggedInStatus] = useState('');
  const [unresolvedComplaintsCount, setUnresolvedComplaintsCount] = useState(0);

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const Data = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      const isLoggedInStatus = await AsyncStorage.getItem('isLoggedInStatus');
      await AsyncStorage.setItem('isLoggedInStatus', 'true');

      const parsedTeacherData = JSON.parse(teacherData);
      setTeacherId(parsedTeacherData._id);
      setTeacherName(parsedTeacherData.name);
      setIsloggedInStatus(isLoggedInStatus);
      fetchAnnouncements(parsedTeacherData._id);
      fetchUnresolvedComplaints(parsedTeacherData._id);
    };

    Data();
  }, []);

  const [arrangements, setArrangements] = useState([]);
  const [classPeriods, setClassPeriods] = useState([]);

  const fetchAnnouncements = async teacherId => {
    try {
      const response = await fetch(apiList.getAnnouncements);
      const data = await response.json();

      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];

      // Filter announcements to include only those for today
      const todaysAnnouncements = data.filter(announcement => {
        const announcementDate = new Date(announcement.date)
          .toISOString()
          .split('T')[0];
        return announcementDate === today;
      });

      setAnnouncements(todaysAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchUnresolvedComplaints = async teacherId => {
    try {
      const response = await fetch(apiList.getUnresolvedComplaints(teacherId));
      const data = await response.json();
      const unresolved = data.filter(
        complaint => complaint.status !== 'RESOLVED',
      );
      setUnresolvedComplaintsCount(unresolved.length);
    } catch (error) {
      console.error('Error fetching unresolved complaints:', error);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchArrangements(teacherId);
      fetchClassPeriods(teacherId);
    }
  }, [teacherId]);



  const fetchArrangements = async teacherId => {
    try {
      const response = await fetch(apiList.getArrangementClass(teacherId));

      if (response.ok) {
        const data = await response.json();
        console.log('arrangements', data);

        setArrangements(data);
      } else {
        console.error('Failed to fetch arrangements:', response.status);
      }
    } catch (error) {
      console.error('Error fetching arrangements:', error);
    }
  };

  const fetchClassPeriods = async teacherId => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format

      const response = await fetch(
        apiList.getClassPeriodByTeacher(teacherId) + `?date=${today}`,
      );
      if (response.ok) {
        const data = await response.json();

        // Sort the class periods by timePeriod
        const sortedData = data.sort((a, b) => {
          // Extract start times from timePeriod
          const timeA = a.timePeriod.split('-')[0].trim();
          const timeB = b.timePeriod.split('-')[0].trim();

          // Convert to Date objects for comparison
          const dateA = convertToDate(timeA);
          const dateB = convertToDate(timeB);

          return dateA - dateB;
        });

        setClassPeriods(sortedData); // Assuming data is an array
      } else {
        console.error('Failed to fetch class periods:', response.status);
      }
    } catch (error) {
      console.error('Error fetching class periods:', error);
    }
  };

  const convertToDate = time => {
    // Extract hours, minutes, and period (AM/PM) using regex
    const match = time.match(/(\d{1,2}):(\d{2})(AM|PM)/);
    if (!match) {
      return new Date(NaN); // Return invalid date if parsing fails
    }

    let [_, hours, minutes, period] = match;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Adjust hours for AM/PM
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    // Create a new Date object with the current date and parsed time
    const now = new Date();
    const dateTimeString = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
    ).toISOString();

    // Convert the ISO string to a Date object
    return new Date(dateTimeString);
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  const navigateToComplaintsScreen = () => {
    navigation.navigate('Complaints');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Home</Text>
        <TouchableOpacity onPress={navigateToCommunicationScreen}>
          <Icon
            name="notifications-outline"
            size={30}
            color={theme.blue}
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

        {announcements?.length !== 0 ? (
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

        {unresolvedComplaintsCount > 0 && (
          <View style={styles.complaintSection}>
            <Text style={styles.complaintSectionTitle}>
              You have {unresolvedComplaintsCount} complaints to resolve
            </Text>
            <TouchableOpacity onPress={navigateToComplaintsScreen}>
              <Text style={styles.complaintSectionButton}>
                Go to Complaints
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {arrangements?.length !== 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arrangement Classes</Text>
            {arrangements.map((arrangement, index) => (
              <View key={index} style={[styles.card, styles.arrangementCard]}>
                <Text
                  style={
                    styles.cardTitle
                  }>{`${arrangement.timePeriod} - ${arrangement.subject.subName}`}</Text>
                <Text style={styles.cardDescriptionUrgent}>
                  {arrangement.arrangementReason}
                </Text>
                <Text
                  style={
                    styles.cardClass
                  }>{`New Class: ${arrangement.class.className}`}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
                  }>{`${classPeriod.timePeriod} - ${classPeriod.subject.subName}`}</Text>

                <Text
                  style={
                    styles.cardClass
                  }>{`Class: ${classPeriod.class.className}`}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      
      <LoginTracking
        teacherId={teacherId}
        onLoginSuccess={() => console.log('Login success!')} // You can handle login success here if needed
      />
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
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
      backgroundColor: theme.white,
    },
    headerText: {
      fontSize: 0.06 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    notification: {},
    scrollContainer: {
      flex: 1,
    },
    welcomeContainer: {
      padding: 16,
      backgroundColor: theme.white,
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
      color: theme.lightBlack,
    },
    welcomeName: {
      fontSize: 0.06 * width,
      color: theme.lightBlack,
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
      color: theme.lightBlack,
      marginBottom: 12,
      borderBottomColor: theme.blue,
      borderBottomWidth: 2,
      paddingBottom: 4,
    },
    card: {
      backgroundColor: theme.white,
      padding: 16,
      borderRadius: 8,
      elevation: 2,
      marginBottom: 16,
    },
    updateCard: {
      borderLeftWidth: 5,
      borderLeftColor: theme.orange,
    },
    arrangementCard: {
      borderLeftWidth: 5,
      borderLeftColor: theme.green,
    },
    scheduleCard: {
      borderLeftWidth: 5,
      borderLeftColor: theme.blue,
    },
    cardTitle: {
      fontSize: 0.045 * width,
      fontWeight: 'bold',
      color: theme.lightBlack,
      marginBottom: 4,
    },
    cardDescription: {
      fontSize: 0.038 * width,
      color: theme.lightBlack,
      marginBottom: 4,
    },
    cardDescriptionUrgent: {
      fontSize: 0.038 * width,
      color: theme.red,
      marginBottom: 4,
    },
    cardDate: {
      fontSize: 0.035 * width,
      color: theme.lightBlack,
    },
    cardClass: {
      fontSize: 0.035 * width,
      color: theme.lightBlack,
    },

    complaintSection: {
      backgroundColor: theme.lightRed,
      padding: 16,
      borderRadius: 8,
      margin: 16,
      borderWidth: 1,
      borderColor: theme.red,
      elevation: 3,
    },
    complaintSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.darkRed,
      marginBottom: 8,
    },
    complaintSectionButton: {
      fontSize: 16,
      color: theme.green,
      fontWeight: 'bold',
      textAlign: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: theme.lightGreen,
      borderWidth: 1,
      borderColor: theme.green,
    },
  });

export default HomeScreen;
