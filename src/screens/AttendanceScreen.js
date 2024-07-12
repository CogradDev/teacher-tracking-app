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

const { width } = Dimensions.get('window');

const studentsData = {
  1: [
    { id: '1', name: 'Rahul Kumar', date: null, attendance: 'absent' },
    { id: '2', name: 'Priya Singh', date: null, attendance: 'absent' },
    { id: '3', name: 'Anjali Verma', date: null, attendance: 'absent' },
    { id: '4', name: 'Suresh Sharma', date: null, attendance: 'absent' },
    { id: '5', name: 'Neeta Gupta', date: null, attendance: 'absent' },
  ],
  2: [
    { id: '1', name: 'Amit Shah', date: null, attendance: 'absent' },
    { id: '2', name: 'Sita Ram', date: null, attendance: 'absent' },
    { id: '3', name: 'Geeta Patel', date: null, attendance: 'absent' },
    { id: '4', name: 'Vivek Singh', date: null, attendance: 'absent' },
    { id: '5', name: 'Deepika Malhotra', date: null, attendance: 'absent' },
  ],
  3: [
    { id: '1', name: 'Ravi Teja', date: null, attendance: 'absent' },
    { id: '2', name: 'Kavita Rao', date: null, attendance: 'absent' },
    { id: '3', name: 'Lakshmi Narayan', date: null, attendance: 'absent' },
    { id: '4', name: 'Manish Gupta', date: null, attendance: 'absent' },
    { id: '5', name: 'Pooja Sharma', date: null, attendance: 'absent' },
  ],
};

const teacherClasses = ['1', '3']; // Replace with dynamic class data for the teacher

const AttendanceScreen = ({ navigation }) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    if (selectedClass) {
      if (teacherClasses.includes(selectedClass)) {
        setStudents(studentsData[selectedClass]);
        setIsClassTeacher(true);
      } else {
        setStudents([]);
        setIsClassTeacher(false);
      }
    }
  }, [selectedClass]);

  const toggleAttendance = (id) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === id
          ? {
              ...student,
              attendance:
                student.attendance === 'present' ? 'absent' : 'present',
              date: selectedDate,
            }
          : student
      )
    );
  };

  const handleSubmit = () => {
    console.log('Attendance Submitted:', students);
    Alert.alert(
      'Attendance Submitted',
      'Attendance has been successfully submitted!'
    );
  };

  // Define your class options here
  const classData = [
    { label: 'Class 1', value: '1' },
    { label: 'Class 2', value: '2' },
    { label: 'Class 3', value: '3' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={0.075 * width} color="#6495ed" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Attendance</Text>
        </View>
        <TouchableOpacity style={styles.notification}>
          <Icon
            name="notifications-outline"
            size={0.075 * width}
            color="#6495ed"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>
      <View style={styles.content}>
        <SelectList
          setSelected={setSelectedClass}
          data={classData}
          placeholder="Select Class"
          boxStyles={styles.dropdown}
          inputStyles={styles.dropdownText}
        />
        {isClassTeacher ? (
          <ScrollView style={styles.studentsContainer}>
            {students.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => toggleAttendance(item.id)}
                style={styles.item}>
                <Text style={styles.itemText}>{item.name}</Text>
                <Text
                  style={
                    item.attendance === 'present'
                      ? styles.present
                      : styles.absent
                  }>
                  {item.attendance === 'present' ? 'Present' : 'Absent'}
                </Text>
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
    color: '#333',
  },
  studentsContainer: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
  present: {
    color: 'green',
    fontWeight: 'bold',
  },
  absent: {
    color: 'red',
    fontWeight: 'bold',
  },
  notClassTeacher: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: '#6495ed',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  submitButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AttendanceScreen;
