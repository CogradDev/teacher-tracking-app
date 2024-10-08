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
  Alert,
} from 'react-native';
import {SelectList} from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import apiList from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../../ThemeContext';

const {width} = Dimensions.get('window');

const PerformanceMatricesScreen = ({navigation}) => {
  const [studentValue, setStudentValue] = useState(null);
  const [students, setStudents] = useState([]);
  const [classValue, setClassValue] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState();
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

  const {theme} = useTheme();
  const styles = createStyles(theme);

  console.log(students);

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
      setSelectedClass(classId);

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
    setSelectedStudentDetails(student);
  };

  const handleFeedbacksAndCallSubmission = async () => {
    try {
      if (!studentValue || !purposeValue || !newCallNotes) {
        Alert.alert('Please fill all the details for the call.');
        return;
      }
      const currentDate = new Date().toISOString().slice(0, 10);

      const newCall = {
        date: currentDate,
        purpose: purposes.find(p => p.value === purposeValue)?.label || '',
        summary: newCallNotes,
      };

      const response = await fetch(
        apiList.updateFeedbackToPast(selectedStudentDetails._id, teacherId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCall),
        },
      );
      const data = await response.json();

      if (response.status === 200) {
        console.log('Feedback Updated Successfully');
        Alert.alert('Feedback Updated Successfully');

        // Update the selected student details
        setSelectedStudentDetails(prevDetails => ({
          ...prevDetails,
          pastFeedbacks: [
            ...prevDetails.pastFeedbacks,
            {
              date: currentDate,
              purpose:
                purposes.find(p => p.value === purposeValue)?.label || '',
              summary: newCallNotes,
            },
          ],
        }));
        setNewCallNotes('');

        // Refetch student data
        const selectedStudent = students.find(s => s._id === studentValue);
        if (selectedStudent) {
          const updatedStudentResponse = await fetch(
            apiList.getAllStudentByClass(selectedClass),
          );

          const updatedStudentData = await updatedStudentResponse.json();
          setStudents(updatedStudentData);
        }
      } else {
        console.log('Feedback Update Failed');
        Alert.alert('Feedback Update Failed', data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCall = async phoneNumber => {
    const currentDate = new Date().toISOString();

    // Optimistically update the call history state
    setSelectedStudentDetails(prevDetails => ({
      ...prevDetails,
      callHistory: [
        ...prevDetails.callHistory,
        {time: currentDate, purpose: 'Call', summary: ''},
      ],
    }));

    try {
      const response = await fetch(apiList.createCall, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentValue,
          time: currentDate,
          teacherId: teacherId,
        }),
      });

      if (response.ok) {
        // Refetch the updated call history
        await fetchCallHistory(studentValue, teacherId);

        // Open the dialer after updating the call history
        Linking.openURL(`tel: +91${phoneNumber}`);
      } else {
        throw new Error('Failed to create call');
      }
    } catch (error) {
      console.error('Error creating call:', error);
      Alert.alert('Error Creating Call');
    }
  };

  // Function to fetch the updated call history
  const fetchCallHistory = async (studentValue, teacherId) => {
    try {
      const response = await fetch(apiList.getCalls(studentValue, teacherId), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setSelectedStudentDetails(prevDetails => ({
          ...prevDetails,
          callHistory: data, // Assuming the API returns the updated call history
        }));
      } else {
        throw new Error('Failed to fetch call history');
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
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
            +91 {selectedStudent?.parentContact}
          </Text>
          <TouchableOpacity
            onPress={() => handleCall(selectedStudent?.parentContact)}>
            <Icon
              name="call"
              size={24}
              color={theme.blue}
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
              color={theme.blue}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Performance Matrices</Text>
        </View>

        <TouchableOpacity onPress={navigateToCommunicationScreen}>
          <Icon
            name="notifications-outline"
            size={30}
            color={theme.blue}
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
              inputStyles={styles.dropdownText}
              dropdownItemStyles={styles.dropdownItem}
              dropdownTextStyles={styles.dropdownText}
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
              inputStyles={styles.dropdownText}
              dropdownItemStyles={styles.dropdownItem}
              dropdownTextStyles={styles.dropdownText}
            />
          </View>

          {/* Past Feedbacks & Calls Section */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Past Feedbacks & Calls</Text>
              {(
                students
                  .find(s => s._id === studentValue)
                  ?.pastFeedbacks.filter(
                    feedback => feedback.teacherId?.toString() === teacherId,
                  ) || []
              ).length === 0 ? (
                <Text style={styles.noDataText}>
                  No past feedbacks or calls available.
                </Text>
              ) : (
                <FlatList
                  data={
                    students
                      ? students
                          .find(s => s._id === studentValue)
                          ?.pastFeedbacks.filter(
                            feedback =>
                              feedback.teacherId?.toString() === teacherId,
                          ) || []
                      : []
                  }
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({item}) => (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>
                        {new Date(item.date).toISOString().split('T')[0]}
                      </Text>
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
              <Text style={styles.sectionTitle}>
                Upcoming Feedbacks & Calls
              </Text>
              {(
                students
                  .find(s => s._id === studentValue)
                  ?.upcomingFeedbacks.filter(
                    feedback => feedback.teacherId.toString() === teacherId,
                  ) || []
              ).length > 0 ? (
                <FlatList
                  data={
                    students
                      ? students
                          .find(s => s._id === studentValue)
                          ?.upcomingFeedbacks.filter(
                            feedback =>
                              feedback.teacherId.toString() === teacherId,
                          ) || []
                      : []
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
                        <Text style={styles.tableCell}>
                          {new Date(item.date).toISOString().split('T')[0]}
                        </Text>
                        <Text style={styles.tableCell}>{item.purpose}</Text>
                        <Text style={styles.tableCell}>
                          {calculateCountdown()}
                        </Text>
                      </View>
                    );
                  }}
                />
              ) : (
                <Text style={styles.noDataText}>
                  No upcoming calls scheduled.
                </Text>
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
                    inputStyles={styles.dropdownText}
                    dropdownItemStyles={styles.dropdownItem}
                    dropdownTextStyles={styles.dropdownText}
                  />
                </View>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Summary"
                value={newCallNotes}
                onChangeText={setNewCallNotes}
                multiline
                numberOfLines={4}
                placeholderTextColor={theme.gray}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleFeedbacksAndCallSubmission}>
                <Text style={styles.buttonText}>Submit Feedbacks & Call</Text>
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
            {selectedStudentDetails?.callHistory?.length > 0 ? (
              <FlatList
                data={
                  selectedStudentDetails?.callHistory.filter(
                    call => call.teacherId === teacherId,
                  ) || []
                }
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item}) => (
                  <View style={styles.modalItem}>
                    <Text style={styles.modalText}>
                      {new Date(item.time).toLocaleString()}
                    </Text>
                    <Text style={styles.modalText}>{item.purpose}</Text>
                  </View>
                )}
              />
            ) : (
              <Text style={styles.noDataText}>No past calls available.</Text>
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

const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.white,
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
      backgroundColor: theme.white,
    },
    headingTextContainer: {
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
    content: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      marginBottom: 8,
      color: theme.blue,
      fontWeight: 'bold',
    },
    dropdown: {
      marginBottom: 16,
    },
    dropdownBox: {
      borderColor: theme.blue,
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
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
      color: theme.blue,
    },
    noDataText: {
      color: theme.gray,
    },

    textArea: {
      borderWidth: 1,
      borderColor: theme.blue,
      borderRadius: 4,
      padding: 8,
      minHeight: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    submitButton: {
      backgroundColor: theme.blue,
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: 'center',
    },
    submitButtonText: {
      color: theme.white,
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
      borderColor: theme.lightGray,
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      fontSize: 16,
      minHeight: 100,
      color: theme.gray,
      textAlignVertical: 'top',
    },
    button: {
      backgroundColor: theme.blue,
      padding: 15,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: theme.white,
      fontSize: 18,
      fontWeight: 'bold',
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
      paddingVertical: 10,
    },
    tableCell: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      color: theme.gray,
    },
    phoneNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    phoneNumberText: {
      fontSize: 16,
      color: theme.lightBlack,
    },
    callIcon: {
      marginLeft: 10,
    },
    viewDetailButton: {
      fontSize: 14,
      color: theme.blue,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.white,
      padding: 16,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.blue,
      marginBottom: 16,
    },
    modalTableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
    },
    modalTableCell: {
      flex: 1,
      textAlign: 'center',
    },
    modalItem: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    modalCloseButton: {
      backgroundColor: theme.blue,
      paddingVertical: 12,
      borderRadius: 4,
      alignItems: 'center',
      marginTop: 16,
    },
    modalCloseText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalText: {
      color: theme.gray,
    },
  });

export default PerformanceMatricesScreen;
