import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';

const { width } = Dimensions.get('window');

const AttendanceScreen = ({ navigation }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());
  const [classOptions, setClassOptions] = useState([]);
  const [teacherId, setTeacherId] = useState('teacherId'); // Replace with actual teacher ID
  const [schoolId, setSchoolId] = useState('schoolId'); // Replace with actual school ID

  useEffect(() => {
    const Data = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      const parsedTeacherData = JSON.parse(teacherData);
      setTeacherId(parsedTeacherData._id);
      setSchoolId(parsedTeacherData.school);
    };
    Data();
  }, []);

  useEffect(() => {
    fetchClassList();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      checkIfClassTeacher();
    }
  }, [selectedClass]);

  const fetchClassList = async () => {
    try {
      const response = await fetch(apiList.getClassList(schoolId));
      const data = await response.json();
      if (response.ok) {
        setClassOptions(
          data.map(c => ({ label: `Class ${c.className}`, value: c._id })),
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch classes');
    }
  };

  const checkIfClassTeacher = async () => {
    try {
      const response = await fetch(
        apiList.checkClassTeacher(teacherId),
      );
      const data = await response.json();
      setIsClassTeacher(
        data.isClassTeacher && data.classTeacher.className === selectedClass,
      );
      if (
        data.isClassTeacher &&
        data.classTeacher.className === selectedClass
      ) {
        fetchStudents(selectedClass);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to verify class teacher');
    }
  };

  const fetchStudents = async className => {
    try {
      const response = await fetch(apiList(className));
      const data = await response.json();
      // Initialize attendance status for each student
      const studentsWithAttendance = data.map(student => ({
        ...student,
        attendance: null, // Initially set to null or a default value
      }));
      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const updateAttendanceStatus = async (studentId, status) => {
    try {
      const response = await fetch(apiList.updateAttendance(selectedDate), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          status,
          id: teacherId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        // Update local state to reflect the change
        setStudents(prevStudents =>
          prevStudents.map(student =>
            student._id === studentId ? { ...student, attendance: status } : student,
          ),
        );
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Failed to update attendance');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update attendance');
    }
  };

  const handleSubmit = async () => {
    // Handle submission of attendance data to the backend
    // Example implementation
    try {
      const attendanceData = {
        statuses: students.map(student => student.attendance),
        date: selectedDate,
        id: teacherId,
        studentIds: students.map(student => student._id),
      };
      // Perform API call to submit attendanceData
      // Example: await fetch('your_server_url/studentAttendance/mark', { ... });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit attendance');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={0.075 * width} color="#6495ed" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Attendance</Text>
        </View>
        <TouchableOpacity style={styles.notification}>
          <Icon name="notifications-outline" size={0.075 * width} color="#6495ed" />
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>
      <View style={styles.content}>
        <SelectList
          setSelected={setSelectedClass}
          data={classOptions}
          placeholder="Select Class"
          boxStyles={styles.dropdown}
          inputStyles={styles.dropdownText}
        />
        {isClassTeacher ? (
          <ScrollView style={styles.studentsContainer}>
            {students.map(student => (
              <TouchableOpacity key={student._id} style={styles.studentItem}>
                <Text style={styles.studentName}>{student.name}</Text>
                <View style={styles.attendanceContainer}>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      { backgroundColor: student.attendance === 'p' ? 'green' : '#ccc' },
                    ]}
                    onPress={() => updateAttendanceStatus(student._id, 'p')}>
                    <Text style={styles.attendanceButtonText}>P</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      { backgroundColor: student.attendance === 'a' ? 'red' : '#ccc' },
                    ]}
                    onPress={() => updateAttendanceStatus(student._id, 'a')}>
                    <Text style={styles.attendanceButtonText}>A</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.attendanceButton,
                      { backgroundColor: student.attendance === 'l' ? 'gray' : '#ccc' },
                    ]}
                    onPress={() => updateAttendanceStatus(student._id, 'l')}>
                    <Text style={styles.attendanceButtonText}>L</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.notClassTeacher}>
            You are not the class teacher of the selected class.
          </Text>
        )}
      </View>
      {isClassTeacher && (
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit Attendance</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dropdown: {
    marginBottom: 20,
    backgroundColor: '#e0f7fa',
  },
  dropdownText: {
    fontSize: 18,
    color: '#000',
  },
  dateContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentsContainer: {
    marginTop: 20,
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  studentName: {
    fontSize: 16,
  },
  attendanceContainer: {
    flexDirection: 'row',
  },
  attendanceButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  attendanceButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  notClassTeacher: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6495ed',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;
