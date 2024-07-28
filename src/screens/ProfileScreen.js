import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const [teacher, setTeacher] = useState(null);
  const [subjectNames, setSubjectNames] = useState([]);
  const [timetableData, setTimetableData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teacherData = await AsyncStorage.getItem('teacherData');
        if (!teacherData) {
          throw new Error('Teacher data not found');
        }
        const parsedTeacherData = JSON.parse(teacherData);
        setTeacher(parsedTeacherData);

        // Fetch subject names for each subject ID in teachSubjects
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
                return data[0].subName; // Correctly access subName from the first object in the array
              } catch (error) {
                console.error('Error fetching subject details:', error);
                return null;
              }
            }),
          );

          // Remove duplicates from subjectNames array
          const uniqueSubjectNames = Array.from(new Set(subjectNames));
          setSubjectNames(uniqueSubjectNames);
        }

        // Fetch timetable data
        if (parsedTeacherData && parsedTeacherData.timetable) {
          const updatedTimetable = await Promise.all(
            parsedTeacherData.timetable.map(async entry => {
              const updatedPeriods = await Promise.all(
                entry.periods.map(async period => {
                  const subjectName = await fetchSubject(period.subject);
                  const className = await fetchClass(period.class);
                  return {
                    ...period,
                    subjectName,
                    className,
                  };
                }),
              );
              return {
                ...entry,
                periods: updatedPeriods,
              };
            }),
          );
          setTimetableData(updatedTimetable);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchData();
  }, []);

  const fetchSubject = async subjectId => {
    try {
      const response = await fetch(apiList.getSubjectName(subjectId));
      const data = await response.json();
      return data[0].subName;
    } catch (error) {
      console.error('Failed to fetch subject:', error);
      return null;
    }
  };

  const fetchClass = async classId => {
    try {
      const response = await fetch(apiList.getClassName(classId));
      const data = await response.json();
      return data.className;
    } catch (error) {
      console.error('Failed to fetch class:', error);
      return null;
    }
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  const handleLogout = () => {
    navigation.navigate('Welcome');
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
            <Icon name="chevron-back" size={0.075 * width} color="#6495ed" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <TouchableOpacity
          onPress={navigateToCommunicationScreen}
          style={styles.notification}>
          <Icon
            name="notifications-outline"
            size={0.075 * width}
            color="#6495ed"
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
          <Text style={styles.sectionTitle}>Weekly Timetable</Text>
          <View style={styles.timetableContainer}>
            {timetableData.map((entry, index) => (
              <View key={index} style={styles.timetableEntry}>
                <Text style={styles.timetableDay}>{entry.day}:</Text>
                {entry.periods.map((period, idx) => (
                  <View key={idx} style={styles.classEntry}>
                    <Text style={styles.classTime}>
                      {period.startTime} - {period.endTime}
                    </Text>
                    <Text style={styles.classDetail}>
                      {period.subjectName} ({period.className})
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0.04 * width,
    paddingHorizontal: 0.025 * width,
    backgroundColor: '#fff',
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
    color: '#6495ed',
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
    backgroundColor: '#fff',
    borderRadius: 0.025 * width,
    shadowColor: '#000',
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
    borderColor: '#6495ed',
    alignSelf: 'center',
  },
  name: {
    fontSize: 0.07 * width,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0.025 * width,
    textAlign: 'center',
  },
  detail: {
    fontSize: 0.045 * width,
    color: '#555',
    marginBottom: 0.025 * width,
    textAlign: 'left',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#6495ed',
  },
  sectionTitle: {
    fontSize: 0.05 * width,
    fontWeight: 'bold',
    color: '#6495ed',
    marginTop: 0.05 * width,
    marginBottom: 0.025 * width,
    textAlign: 'center',
  },
  timetableContainer: {
    width: '100%',
    paddingVertical: 0.025 * width,
    paddingHorizontal: 0.0375 * width,
    backgroundColor: '#e0f7fa',
    borderRadius: 0.025 * width,
  },
  timetableEntry: {
    marginBottom: 0.0375 * width,
  },
  timetableDay: {
    fontSize: 0.045 * width,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 0.025 * width,
  },
  classEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 0.025 * width,
    backgroundColor: '#fff',
    borderRadius: 0.02 * width,
    marginBottom: 0.02 * width,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0.05 * width},
    shadowOpacity: 0.2,
    shadowRadius: 0.05 * width,
    elevation: 1,
  },
  classTime: {
    fontSize: 0.04 * width,
    fontWeight: 'bold',
    color: '#6495ed',
  },
  classDetail: {
    fontSize: 0.04 * width,
    color: '#333',
  },
  logoutButton: {
    width: '100%',
    paddingVertical: 0.04 * width,
    backgroundColor: '#6495ed',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    borderRadius: 10,
  },
  logoutButtonText: {
    fontSize: 0.05 * width,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
