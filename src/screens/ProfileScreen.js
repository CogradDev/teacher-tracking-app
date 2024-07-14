import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';

const {width} = Dimensions.get('window');

const ProfileScreen = ({navigation}) => {
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    fetchTeacher();
  }, []);

  const fetchTeacher = async () => {
    try {
      const teacherId = await AsyncStorage.getItem('teacherId'); // Retrieve teacherId from AsyncStorage
      if (!teacherId) {
        console.error('Teacher ID not found in AsyncStorage');
        return;
      }

      const response = await fetch(apiList.getTeacherById(teacherId));
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setTeacher(data);
    } catch (error) {
      console.error('Error fetching teacher details:', error);
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
            {teacher.teachSubjects.join(', ')}
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
            {teacher.timetable.map((entry, index) => (
              <View key={index} style={styles.timetableEntry}>
                <Text style={styles.timetableDay}>{entry.day}:</Text>
                {entry.periods.map((period, idx) => (
                  <View key={idx} style={styles.classEntry}>
                    <Text style={styles.classTime}>
                      {period.startTime} - {period.endTime}
                    </Text>
                    <Text style={styles.classDetail}>
                      {period.subject.name} ({period.class.name})
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
