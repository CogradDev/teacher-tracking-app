import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const profile = {
    name: 'Mrs. Radhika',
    subjectsTaught: ['Mathematics', 'Hindi', 'Science', 'SST', 'English'],
    contactInfo: 'john.doe@example.com | +91-1234567890',
    qualification: 'Masters in Education',
    experience: '10 years',
    timetable: [
      {
        day: 'Monday',
        classes: [
          { time: '8am - 9am', subject: 'Mathematics', class: '10th' },
          { time: '9am - 10am', subject: 'Physics', class: '10th' },
        ],
      },
      {
        day: 'Tuesday',
        classes: [
          { time: '8am - 9am', subject: 'Chemistry', class: '10th' },
          { time: '9am - 10am', subject: 'Biology', class: '10th' },
        ],
      },
      {
        day: 'Wednesday',
        classes: [
          { time: '8am - 9am', subject: 'English', class: '10th' },
          { time: '9am - 10am', subject: 'Mathematics', class: '10th' },
        ],
      },
      {
        day: 'Thursday',
        classes: [
          { time: '8am - 9am', subject: 'Physics', class: '10th' },
          { time: '9am - 10am', subject: 'Chemistry', class: '10th' },
        ],
      },
      {
        day: 'Friday',
        classes: [
          { time: '8am - 9am', subject: 'Biology', class: '10th' },
          { time: '9am - 10am', subject: 'English', class: '10th' },
        ],
      }, 
    ],
    profileImage: require('../assets/image/profile.png'),
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  const handleLogout = () => {
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={0.075 * width} color="#6495ed" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <TouchableOpacity onPress={navigateToCommunicationScreen} style={styles.notification}>
          <Icon name="notifications-outline" size={0.075 * width} color="#6495ed" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.profileContainer}>
          <Image source={profile.profileImage} style={styles.profileImage} />
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Subjects Taught:</Text> {profile.subjectsTaught.join(', ')}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Contact Info:</Text> {profile.contactInfo}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Qualification:</Text> {profile.qualification}
          </Text>
          <Text style={styles.detail}>
            <Text style={styles.boldText}>Experience:</Text> {profile.experience}
          </Text>
          <Text style={styles.sectionTitle}>Weekly Timetable</Text>
          <View style={styles.timetableContainer}>
            {profile.timetable.map((entry, index) => (
              <View key={index} style={styles.timetableEntry}>
                <Text style={styles.timetableDay}>{entry.day}:</Text>
                {entry.classes.map((cls, idx) => (
                  <View key={idx} style={styles.classEntry}>
                    <Text style={styles.classTime}>{cls.time}</Text>
                    <Text style={styles.classDetail}>
                      {cls.subject} ({cls.class})
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
    shadowOffset: { width: 0, height: 0.05 * width },
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
    shadowOffset: { width: 0, height: 0.05 * width },
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
    borderRadius : 10,
  },
  logoutButtonText: {
    fontSize: 0.05 * width,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
