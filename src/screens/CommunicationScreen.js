import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const CommunicationScreen = ({ navigation }) => {
  // Example data for announcements and notifications
  const announcements = [
    { id: 1, title: 'Welcome back to school!', content: 'We are excited to welcome all students and staff back for the new academic year. Let’s make it a memorable and productive year ahead!' },
    { id: 2, title: 'PTM Scheduled for next week', content: 'Parent-Teacher Meetings (PTMs) are scheduled for next week. Please check your child’s schedule for specific timings and details.' },
    // Add more announcements as needed
  ];

  const notifications = [
    { id: 1, title: 'Homework assigned for class 3B', content: 'Homework has been assigned for Class 3B for Mathematics and English. Please ensure completion by the due date.' },
    { id: 2, title: 'New event added to calendar', content: 'A new event has been added to the school calendar. Stay tuned for more details and participation guidelines.' },
    // Add more notifications as needed
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={0.075 * width} color="#6495ed" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Communication</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="megaphone-outline" size={0.06 * width} color="#6495ed" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Announcements</Text>
        </View>
        {announcements.map((announcement) => (
          <View key={announcement.id} style={styles.item}>
            <Text style={styles.itemTitle}>{announcement.title}</Text>
            <Text style={styles.itemContent}>{announcement.content}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications-outline" size={0.06 * width} color="#6495ed" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        {notifications.map((notification) => (
          <View key={notification.id} style={styles.item}>
            <Text style={styles.itemTitle}>{notification.title}</Text>
            <Text style={styles.itemContent}>{notification.content}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 0.04 * width,
    paddingHorizontal: 0.025 * width,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 0.06 * width,
    fontWeight: 'bold',
    color: '#6495ed',
  },
  section: {
    backgroundColor: '#fff',
    margin: 0.025 * width,
    borderRadius: 0.025 * width,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0.05 * width,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 0.025 * width,
    paddingHorizontal: 0.05 * width,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sectionIcon: {
    marginRight: 0.025 * width,
  },
  sectionTitle: {
    fontSize: 0.05 * width,
    fontWeight: 'bold',
    color: '#6495ed',
  },
  item: {
    paddingHorizontal: 0.05 * width,
    paddingVertical: 0.025 * width,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  itemTitle: {
    fontSize: 0.045 * width,
    fontWeight: 'bold',
    color: '#333',
  },
  itemContent: {
    fontSize: 0.04 * width,
    color: '#666',
    marginTop: 0.0125 * width,
  },
});

export default CommunicationScreen;
