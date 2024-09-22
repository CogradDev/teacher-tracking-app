import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import {useTheme} from '../../ThemeContext';

const {width} = Dimensions.get('window');

// Function to format timestamps
const formatDate = timestamp => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // You can customize the format as needed
};

const CommunicationScreen = ({navigation}) => {
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const {theme} = useTheme();
  const styles = createStyles(theme);

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

  const fetchAnnouncements = async teacherId => {
    try {
      const response = await axios.get(apiList.getAnnouncements);
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchNotifications = async teacherId => {
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
          <Icon
            name="megaphone-outline"
            size={0.06 * width}
            color={theme.blue}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Announcements</Text>
        </View>
        <ScrollView>
          {announcements.length === 0 ? (
            <Text style={styles.emptyText}>No announcements to display</Text>
          ) : (
            announcements.map(announcement => (
              <View key={announcement._id} style={styles.item}>
                <Text style={styles.itemTitle}>{announcement.title}</Text>
                <Text style={styles.itemContent}>{announcement.content}</Text>
                <Text style={styles.itemTime}>
                  {formatDate(announcement.date)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon
            name="notifications-outline"
            size={0.06 * width}
            color={theme.blue}
            style={styles.sectionIcon}
          />
          <Text style={styles.sectionTitle}>Notifications</Text>
        </View>
        <ScrollView>
          {notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications to display</Text>
          ) : (
            notifications.map(notification => (
              <View key={notification._id} style={styles.item}>
                <Text style={styles.itemTitle}>{notification.title}</Text>
                <Text style={styles.itemContent}>{notification.content}</Text>
                <Text style={styles.itemTime}>
                  {formatDate(notification.date)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
};

const createStyles = theme =>
  StyleSheet.create({
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
      backgroundColor: theme.white,
    },
    headerText: {
      fontSize: 0.06 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    section: {
      backgroundColor: theme.white,
      margin: 0.025 * width,
      borderRadius: 0.025 * width,
      elevation: 3,
      shadowColor: theme.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.3,
      shadowRadius: 0.05 * width,
      height: width,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 0.025 * width,
      paddingHorizontal: 0.05 * width,
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
    },
    sectionIcon: {
      marginRight: 0.025 * width,
    },
    sectionTitle: {
      fontSize: 0.05 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    item: {
      paddingHorizontal: 0.05 * width,
      paddingVertical: 0.025 * width,
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
    },
    itemTitle: {
      fontSize: 0.045 * width,
      fontWeight: 'bold',
      color: theme.lightBlack,
    },
    itemContent: {
      fontSize: 0.04 * width,
      color: theme.gray,
      marginTop: 0.0125 * width,
    },
    itemTime: {
      fontSize: 0.035 * width,
      color: theme.lightGray,
      marginTop: 0.0125 * width,
    },
    emptyText: {
      alignSelf: 'center',
      marginVertical: 0.05 * width,
      fontSize: 0.045 * width,
      color: theme.lightGray,
    },
  });

export default CommunicationScreen;
