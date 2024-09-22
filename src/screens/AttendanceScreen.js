import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../../ThemeContext';

const {width} = Dimensions.get('window');

const AttendanceScreen = ({navigation}) => {
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState(null);
  const [students, setStudents] = useState([]);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [classTeacher, setClassTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [teacherId, setTeacherId] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [updatedAttendance, setUpdatedAttendance] = useState({});
  const [accordionOpen, setAccordionOpen] = useState({});
  const accordionItems = [
    'Lunch',
    'Water Bottle',
    'Dress',
    'Books and Bag',
    'Cleanliness',
    'Gayatri Mantra',
    'Wish Parents',
  ];

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchData = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      if (teacherData) {
        const parsedTeacherData = JSON.parse(teacherData);
        setTeacherId(parsedTeacherData._id);
        setSchoolId(parsedTeacherData.school);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (schoolId) {
      fetchClassList();
    }
  }, [schoolId]);

  useEffect(() => {
    if (selectedClass) {
      checkIfClassTeacher();
    }
  }, [selectedClass]);

  const fetchClassList = async () => {
    try {
      const response = await fetch(apiList.getClassList(schoolId));
      const data = await response.json();
      console.log('classes', data);
      if (response.ok) {
        setClasses(data);
        setClassOptions(data.map(c => ({value: c.className})));
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
      const response = await fetch(apiList.checkClassTeacher(teacherId));
      const data = await response.json();
      const isClassTeacherForSelectedClass =
        data.isClassTeacher &&
        data.classTeacher.some(
          classInfo => classInfo.className === selectedClass,
        );

      if (isClassTeacherForSelectedClass) {
        const classTeacherInfo = data.classTeacher.find(
          classInfo => classInfo.className === selectedClass,
        );
        setClassTeacher(classTeacherInfo._id);
        fetchStudents(selectedClass);
      } else {
        setClassTeacher(null);
        setStudents([]);
      }

      setIsClassTeacher(isClassTeacherForSelectedClass);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to verify class teacher');
    }
  };

  const fetchStudents = async className => {
    try {
      const response = await fetch(apiList.getAllStudentByClass(className));
      const data = await response.json();
      const date = new Date().toISOString().split('T')[0];
      const studentsWithAttendance = await Promise.all(
        data.map(async student => {
          const attendance = await fetchStudentAttendance(student._id, date);
          return {
            ...student,
            attendance: attendance || null,
          };
        }),
      );
      setStudents(studentsWithAttendance);
      setAttendanceTaken(
        studentsWithAttendance.some(s => s.attendance !== null),
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const fetchStudentAttendance = async (studentId, date) => {
    try {
      const response = await fetch(
        apiList.fetchStudentAttendanceByDateAndId(studentId, date),
      );
      const data = await response.json();
      if (response.ok) {
        return data.attendance.status;
      } else {
        console.error('Attendance not found for the date');
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student._id === studentId ? {...student, attendance: status} : student,
      ),
    );
    setUpdatedAttendance(prev => ({...prev, [studentId]: status}));
  };

  const handleCheckboxChange = (studentId, item) => {
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student._id === studentId
          ? {
              ...student,
              [item]: !student[item],
            }
          : student,
      ),
    );
  };

  const handleSelectAll = studentId => {
    const allSelected = accordionItems.every(
      item => students.find(student => student._id === studentId)[item],
    );
    setStudents(prevStudents =>
      prevStudents.map(student =>
        student._id === studentId
          ? accordionItems.reduce(
              (acc, item) => {
                acc[item] = !allSelected;
                return acc;
              },
              {...student},
            )
          : student,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      const attendanceData = {
        statuses: students.map(student => student.attendance),
        date: new Date().toISOString().split('T')[0],
        id: classTeacher,
        studentIds: students.map(student => student._id),
      };

      if (['Nursery', 'LKG', 'UKG'].includes(selectedClassName)) {
        attendanceData.checklists = students.map(student => ({
          studentId: student._id,
          checklist: accordionItems.reduce((acc, item) => {
            acc[item] = student[item] || false;
            return acc;
          }, {}),
        }));
      }

      const response = await fetch(apiList.takeAttendance, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attendanceData),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', data.message);
        setAttendanceTaken(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to submit attendance');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to submit attendance');
    }
  };

  const updateAttendanceStatus = async () => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const updates = Object.keys(updatedAttendance).map(studentId => ({
        studentId,
        status: updatedAttendance[studentId],
        id: classTeacher,
      }));

      await Promise.all(
        updates.map(async update => {
          const response = await fetch(apiList.updateAttendance(date), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(update),
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.message || 'Failed to update attendance');
          }
        }),
      );

      setStudents(prevStudents =>
        prevStudents.map(student =>
          updatedAttendance[student._id]
            ? {...student, attendance: updatedAttendance[student._id]}
            : student,
        ),
      );
      Alert.alert('Success', 'Attendance updated successfully');
      setUpdatedAttendance({});
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to update attendance');
    }
  };

  const handleClassChange = className => {
    const selectedClass = classes.find(cls => cls.className === className);
    setSelectedClass(selectedClass._id);
    setSelectedClassName(selectedClass.className);
  };
  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  const toggleAccordion = studentId => {
    console.log('toggle');
    setAccordionOpen(prev => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-back" size={0.075 * width} color={theme.blue} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Attendance</Text>
        </View>
        <TouchableOpacity
          style={styles.notification}
          onPress={navigateToCommunicationScreen}>
          <Icon
            name="notifications-outline"
            size={0.075 * width}
            color={theme.blue}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.content}>
        <SelectList
          setSelected={handleClassChange}
          data={classOptions}
          placeholder="Select Class"
          boxStyles={styles.dropdown}
          inputStyles={styles.dropdownText}
          dropdownItemStyles={styles.dropdownItem}
          dropdownTextStyles={styles.dropdownText}
        />
        {isClassTeacher && students.length > 0 ? (
          <ScrollView style={styles.studentsContainer}>
            {students.map(student => (
              <View key={student._id}>
                <TouchableOpacity
                  style={styles.studentItem}
                  onPress={() => toggleAccordion(student._id)}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <View style={styles.attendanceContainer}>
                    <TouchableOpacity
                      style={[
                        styles.attendanceButton,
                        {
                          backgroundColor:
                            student.attendance === 'p'
                              ? theme.green
                              : theme.lightGray,
                        },
                      ]}
                      onPress={() => handleAttendanceChange(student._id, 'p')}>
                      <Text style={styles.attendanceButtonText}>P</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.attendanceButton,
                        {
                          backgroundColor:
                            student.attendance === 'a'
                              ? theme.red
                              : theme.lightGray,
                        },
                      ]}
                      onPress={() => handleAttendanceChange(student._id, 'a')}>
                      <Text style={styles.attendanceButtonText}>A</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.attendanceButton,
                        {
                          backgroundColor:
                            student.attendance === 'l'
                              ? theme.gray
                              : theme.lightGray,
                        },
                      ]}
                      onPress={() => handleAttendanceChange(student._id, 'l')}>
                      <Text style={styles.attendanceButtonText}>L</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                {(selectedClassName === 'Nursery' ||
                  selectedClassName === 'LKG' ||
                  selectedClassName === 'UKG') &&
                accordionOpen[student._id] ? (
                  <View style={styles.accordionContent}>
                    {accordionItems.map(item => (
                      <View key={item} style={styles.checkboxContainer}>
                        <TouchableOpacity
                          style={[
                            styles.checkbox,
                            student[item] && styles.checkboxChecked,
                          ]}
                          onPress={() =>
                            handleCheckboxChange(student._id, item)
                          }>
                          {student[item] && (
                            <Icon name="checkmark" size={16} color={theme.white} />
                          )}
                        </TouchableOpacity>
                        <Text style={styles.checkboxLabel}>{item}</Text>
                      </View>
                    ))}
                    <TouchableOpacity
                      style={styles.selectAllButton}
                      onPress={() => handleSelectAll(student._id)}>
                      <Text style={styles.selectAllText}>Select All</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))}
            {attendanceTaken ? (
              <TouchableOpacity
                onPress={updateAttendanceStatus}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Update Attendance</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Submit Attendance</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        ) : (
          <Text style={styles.notClassTeacher}>
            You are not the class teacher of the selected class.
          </Text>
        )}
      </View>
    </View>
  );
};

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 0.04 * width,
      paddingHorizontal: 0.025 * width,
      backgroundColor: theme.white,
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
      color: theme.blue,
    },
    notification: {},
    dateContainer: {
      alignItems: 'center',
      marginVertical: 0.04 * width,
    },
    dateText: {
      fontSize: 0.04 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    content: {
      flex: 1,
      paddingHorizontal: 0.05 * width,
    },
    dropdown: {
      marginBottom: 0.04 * width,
      borderColor: theme.blue,
      borderWidth: 1,
    },
    dropdownText: {
      fontSize: 0.04 * width,
      color: theme.gray,
      backgroundColor: theme.white,
    },
    dropdownItem: {
      backgroundColor: theme.white,  
      paddingVertical: 10,
    },
 
    studentsContainer: {
      flex: 1,
    },
    studentItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 0.025 * width,
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
    },
    studentName: {
      fontSize: 0.04 * width,
      color: theme.lightBlack
    },
    attendanceContainer: {
      flexDirection: 'row',
    },
    attendanceButton: {
      marginHorizontal: 0.02 * width,
      paddingVertical: 0.02 * width,
      paddingHorizontal: 0.04 * width,
      borderRadius: 4,
    },
    attendanceButtonText: {
      color: theme.white,
      fontSize: 0.04 * width,
    },
    submitButton: {
      backgroundColor: theme.blue,
      alignItems: 'center',
      paddingVertical: 0.04 * width,
      borderRadius: 4,
      marginTop: 0.05 * width,
    },
    submitButtonText: {
      color: theme.white,
      fontSize: 0.04 * width,
    },
    notClassTeacher: {
      textAlign: 'center',
      color: theme.red,
      fontSize: 0.04 * width,
      marginTop: 0.05 * width,
    },
    accordionContent: {
      borderWidth: 2,
      borderColor: theme.blue,
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.blue,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    checkboxChecked: {
      backgroundColor: theme.blue,
    },
    checkboxLabel: {
      fontSize: 16,
      color: theme.gray,
    },
    selectAllButton: {
      marginTop: 8,
      alignSelf: 'flex-end',
    },
    selectAllText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.blue,
    },
  });

export default AttendanceScreen;
