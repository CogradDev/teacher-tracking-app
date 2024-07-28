import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';

const { width } = Dimensions.get('window');

const CommunicationScreen = ({ navigation }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherData = await AsyncStorage.getItem('teacherData');
        const parsedTeacherData = JSON.parse(teacherData);
        const teacherId = parsedTeacherData._id;

        fetchAnnouncements(teacherId);
        fetchNotifications(teacherId);
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };

    fetchTeacherData();
  }, []);

  const fetchAnnouncements = async (teacherId) => {
    try {
      const response = await axios.get(apiList.getAnnouncements(teacherId));
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchNotifications = async (teacherId) => {
    try {
      const response = await axios.get(apiList.getNotifications(teacherId));
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

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
        {announcements.length === 0 ? (
          <Text style={styles.emptyText}>No announcements to display</Text>
        ) : (
          announcements.map((announcement) => (
            <View key={announcement._id} style={styles.item}>
              <Text style={styles.itemTitle}>{announcement.title}</Text>
              <Text style={styles.itemContent}>{announcement.content}</Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="notifications-outline" size={0.06 * width} color="#6495ed" style={styles.sectionIcon} />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications to display</Text>
        ) : (
          notifications.map((notification) => (
            <View key={notification._id} style={styles.item}>
              <Text style={styles.itemTitle}>{notification.title}</Text>
              <Text style={styles.itemContent}>{notification.content}</Text>
            </View>
          ))
        )}
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
  emptyText: {
    alignSelf: 'center',
    marginVertical: 0.05 * width,
    fontSize: 0.045 * width,
    color: '#999',
  },
});

export default CommunicationScreen;
