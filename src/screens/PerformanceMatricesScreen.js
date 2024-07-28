import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  ScrollView,
  Dimensions,
  Linking,
  Modal,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

const PerformanceMatricesScreen = ({navigation}) => {
  const [studentValue, setStudentValue] = useState(null);
  const [students, setStudents] = useState([]);
  const [classValue, setClassValue] = useState(null);
  const [classes, setClasses] = useState([]);
  const [purposeValue, setPurposeValue] = useState(null);
  const [purposes, setPurposes] = useState([
    {label: 'Appreciation', value: 'appreciation'},
    {label: 'Complaint', value: 'complaint'},
    {label: 'Follow Up', value: 'followup'},
  ]);
  const [newCallNotes, setNewCallNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  const [teacherId, setTeacherId] = useState(''); // Replace with actual teacher ID
  const [schoolId, setSchoolId] = useState(''); // Replace with actual school ID

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
    const fetchClasses = async () => {
      try {
        const response = await fetch(apiList.getClassList(schoolId));
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const classOptions = data.map(cls => ({
          id: cls._id,
          value: cls.className,
        }));
        setClasses(classOptions);
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };

    fetchClasses();
  }, [schoolId]);

  const handleClassChange = className => {
    const selectedClass = classes.find(cls => cls.value === className);

    if (selectedClass) {
      const classId = selectedClass.id;
      setClassValue(className);

      // Fetch students by class from API using the class ID
      fetch(apiList.getAllStudentByClass(classId))
        .then(response => response.json())
        .then(data => {
          setStudents(data); // Assuming data is an array of students
          setStudentValue(null);
        })
        .catch(error => console.error('Error fetching students:', error));
    } else {
      console.error('Class not found');
    }
  };

  const handleStudentChange = StudentName => {
    const student = students.find(stu => stu.name === StudentName);
    setStudentValue(student._id);
  };

  const handleCallSubmission = () => {
    if (!studentValue || !purposeValue) {
      alert('Please select a student and provide a purpose for the call.');
      return;
    }
    const currentDate = new Date().toISOString().slice(0, 10);
    const newCall = {
      date: currentDate,
      purpose: purposes.find(p => p.value === purposeValue)?.label || '',
      summary: newCallNotes,
    };

    // Post new call data to API
    fetch(apiList.createCall, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: studentValue,
        time: currentDate, // Adjust as per your API requirements
        teacherId: teacherId, // Replace with actual teacher ID
      }),
    })
      .then(response => response.json())
      .then(data => {
        const updatedStudents = students.map(student =>
          student._id === studentValue
            ? {
                ...student,
                pastFeedbacks: [...student.pastFeedbacks, newCall],
              }
            : student,
        );
        setStudents(updatedStudents);
        setNewCallNotes('');
      })
      .catch(error => console.error('Error creating call:', error));
  };

  const handleCall = phoneNumber => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const updatedStudents = students.map(student =>
      student._id === studentValue
        ? {
            ...student,
            pastFeedbacks: [
              ...student.pastFeedbacks,
              {date: currentDate, purpose: 'Call', summary: ''},
            ],
          }
        : student,
    );
    setStudents(updatedStudents);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleViewAllPastCalls = student => {
    setSelectedStudentDetails(student);
    setModalVisible(true);
  };

  const renderStudentDetail = () => {
    if (!studentValue) return null;
    const selectedStudent = students.find(s => s._id === studentValue);
    return (
      <View style={styles.studentDetailContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneNumberContainer}>
          <Text style={styles.phoneNumberText}>
            {selectedStudent?.phoneNumber}
          </Text>
          <TouchableOpacity
            onPress={() => handleCall(selectedStudent?.phoneNumber)}>
            <Icon
              name="call"
              size={24}
              color="#6495ed"
              style={styles.callIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => handleViewAllPastCalls(selectedStudent)}>
          <Text style={styles.viewDetailButton}>View All Past Calls</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headingTextContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
              name="chevron-back"
              size={30}
              color="#6495ed"
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Performance Matrices</Text>
        </View>

        <TouchableOpacity onPress={navigateToCommunicationScreen}>
          <Icon
            name="notifications-outline"
            size={30}
            color="#6495ed"
            style={styles.notification}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Class Selection */}
          <Text style={styles.label}>Select Class</Text>
          <View style={styles.dropdown}>
            <SelectList
              setSelected={handleClassChange}
              data={classes}
              save="value"
              placeholder="Select Class"
              boxStyles={styles.dropdownBox}
            />
          </View>

          {/* Student Selection */}
          <Text style={styles.label}>Select Student</Text>
          <View style={styles.dropdown}>
            <SelectList
              setSelected={handleStudentChange}
              data={students.map(student => ({
                value: student.name,
              }))}
              save="value"
              placeholder="Select Student"
              search
              searchPlaceholder="Search for a student"
              boxStyles={styles.dropdownBox}
            />
          </View>

          {/* Past Feedbacks & Calls Section */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past Feedbacks & Calls</Text>
              {students.find(s => s._id === studentValue)?.pastFeedbacks
                ?.length === 0 ? (
                <Text>No past feedbacks or calls available.</Text>
              ) : (
                <FlatList
                  data={
                    students.find(s => s._id === studentValue)?.pastFeedbacks ||
                    []
                  }
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.date}</Text>
                      <Text style={styles.tableCell}>{item.purpose}</Text>
                      <Text style={styles.tableCell}>{item.summary}</Text>
                    </View>
                  )}
                />
              )}
            </View>
          )}

          {/* Upcoming Calls Section */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Calls</Text>
              {students.find(s => s._id === studentValue)?.upcomingCalls
                ?.length > 0 ? (
                <FlatList
                  data={
                    students.find(s => s._id === studentValue)?.upcomingCalls ||
                    []
                  }
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => {
                    const calculateCountdown = () => {
                      const currentDate = new Date();
                      const targetDate = new Date(item.date);
                      const diffTime = Math.abs(targetDate - currentDate);
                      const diffDays = Math.ceil(
                        diffTime / (1000 * 60 * 60 * 24),
                      );
                      return `${diffDays} days`;
                    };

                    return (
                      <View style={styles.tableRow}>
                        <Text style={styles.tableCell}>{item.date}</Text>
                        <Text style={styles.tableCell}>{item.purpose}</Text>
                        <Text style={styles.tableCell}>
                          {calculateCountdown()}
                        </Text>
                      </View>
                    );
                  }}
                />
              ) : (
                <Text>No upcoming calls scheduled.</Text>
              )}
            </View>
          )}

          {/* New Call Form */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New Call</Text>
              <View style={styles.row}>
                <View style={styles.dropdown}>
                  <SelectList
                    setSelected={setPurposeValue}
                    data={purposes}
                    save="value"
                    placeholder="Select Purpose"
                    boxStyles={styles.dropdownBox}
                  />
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Summary (optional)"
                value={newCallNotes}
                onChangeText={setNewCallNotes}
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleCallSubmission}>
                <Text style={styles.buttonText}>Submit Call</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        {renderStudentDetail()}
      </ScrollView>

      {/* Modal for Past Calls */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Past Calls for {selectedStudentDetails?.name}
            </Text>
            {selectedStudentDetails?.pastCalls?.length > 0 ? (
              <FlatList
                data={selectedStudentDetails?.pastCalls || []}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={styles.modalItem}>
                    <Text style={styles.modalText}>{item.date}</Text>
                    <Text style={styles.modalText}>{item.purpose}</Text>
                    <Text style={styles.modalText}>{item.summary}</Text>
                  </View>
                )}
              />
            ) : (
              <Text>No past calls available.</Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
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
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#6495ed',
    fontWeight: 'bold',
  },
  dropdown: {
    marginBottom: 16,
  },
  dropdownBox: {
    borderColor: '#6495ed',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#6495ed',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#6495ed',
    borderRadius: 4,
    padding: 8,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6495ed',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  studentDetailContainer: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 100,
  },
  button: {
    backgroundColor: '#6495ed',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  phoneNumberText: {
    fontSize: 16,
    color: '#333',
  },
  callIcon: {
    marginLeft: 10,
  },
  viewDetailButton: {
    fontSize: 14,
    color: '#6495ed',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6495ed',
    marginBottom: 16,
  },
  modalTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  modalTableCell: {
    flex: 1,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#6495ed',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerformanceMatricesScreen;
