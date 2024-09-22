import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import { useTheme } from '../../ThemeContext';

const AttendanceCalendar = () => {
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchAttendance = async (year, month) => {
    try {
      const teacherData = await AsyncStorage.getItem('teacherData');
      if (!teacherData) {
        throw new Error('Teacher data not found');
      }

      const parsedTeacherData = JSON.parse(teacherData);
      const teacherId = parsedTeacherData._id;

      const response = await fetch(apiList.calculateAttendanceMonthly, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          month,
          year,
        }),
      });

      const data = await response.json();
      if (response.status === 200) {
        const { attendanceRecords } = data.data;
        const attendanceMap = attendanceRecords.reduce((acc, record) => {
          const date = record.date.split('T')[0]; // Extract only the date (e.g., '2024-06-05')
          acc[date] =
            record.status === 'p'
              ? 'present'
              : record.status === 'a'
              ? 'absent'
              : record.status === 'l'
              ? 'leave'
              : null;
          return acc;
        }, {});

        setAttendanceData(attendanceMap);
      } else {
        Alert.alert('Error', 'Unable to fetch attendance data.');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      Alert.alert(
        'Error',
        'Something went wrong while fetching attendance data.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedMonth.year, selectedMonth.month);
  }, [selectedMonth]);

  const getMarkedDates = () => {
    const markedDates = {};
    Object.keys(attendanceData).forEach(date => {
      const status = attendanceData[date];
      markedDates[date] = {
        customStyles: {
          container: {
            backgroundColor: status === 'present'
              ? theme.green
              : status === 'absent'
              ? theme.red
              : status === 'leave'
              ? theme.gray
              : 'transparent',
            borderRadius: 50, // Ensures the background is a circle
          },
          text: {
            color: 'white', // Adjust text color if needed
          },
        },
      };
    });
    return markedDates;
  };

  const handleMonthChange = date => {
    const year = date.year;
    const month = date.month;

    // Update the selected month
    setSelectedMonth({ year, month });
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.blue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monthly Attendance</Text>
      <Calendar
        markedDates={getMarkedDates()}
        markingType="custom"
        onMonthChange={handleMonthChange}
      />
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      padding: 20,
    },
    header: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.blue,
      marginBottom: 10,
      textAlign: 'center',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default AttendanceCalendar;
