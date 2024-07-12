import React, { useState, useEffect } from 'react';
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
import { SelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
const { width } = Dimensions.get('window');

const studentsData = [
  {
    name: 'Rakesh',
    class: '1',
    phoneNumber: '+918755695874',
    pastFeedbacks: [
      { date: '2024-07-01', purpose: 'Appreciation', summary: 'Great Progress' },
      { date: '2024-06-25', purpose: 'Complaint', summary: 'Needs Improvement' },
    ],
    upcomingCalls: [
      { date: '2024-07-10', purpose: 'Meeting' },
      { date: '2024-07-15', purpose: 'Follow Up' },
    ],
  },
  {
    name: 'Mohini',
    class: '2',
    phoneNumber: '+918755695874',
    pastFeedbacks: [
      { date: '2024-07-01', purpose: 'Appreciation', summary: 'Great Progress' },
      { date: '2024-06-25', purpose: 'Complaint', summary: 'Needs Improvement' },
    ],
    upcomingCalls: [
      { date: '2024-07-10', purpose: 'Meeting' },
      { date: '2024-07-15', purpose: 'Follow Up' },
    ],
  },
  {
    name: 'Mahima',
    class: 'UKG',
    phoneNumber: '+918755695874',
    pastFeedbacks: [
      { date: '2024-07-01', purpose: 'Appreciation', summary: 'Great Progress' },
      { date: '2024-06-25', purpose: 'Complaint', summary: 'Needs Improvement' },
    ],
    upcomingCalls: [
      { date: '2024-07-10', purpose: 'Meeting' },
      { date: '2024-07-15', purpose: 'Follow Up' },
    ],
  },
];

const PerformanceMatricesScreen = ({ navigation }) => {
  const [studentValue, setStudentValue] = useState(null);
  const [students, setStudents] = useState([]);
  const [classValue, setClassValue] = useState(null);
  const [classes, setClasses] = useState([]);
  const [purposeValue, setPurposeValue] = useState(null);
  const [purposes, setPurposes] = useState([
    { label: 'Appreciation', value: 'appreciation' },
    { label: 'Complaint', value: 'complaint' },
    { label: 'Follow Up', value: 'followup' },
  ]);
  const [newCallNotes, setNewCallNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState(null);

  useEffect(() => {
    const uniqueClasses = Array.from(
      new Set(studentsData.map((student) => student.class))
    ).map((cls) => ({
      label: cls,
      value: cls,
    }));
    setClasses(uniqueClasses);
  }, []);

  const handleCallSubmission = () => {
    if (!studentValue || !purposeValue) {
      alert('Please select a student and provide a purpose for the call.');
      return;
    }
    const currentDate = new Date().toISOString().slice(0, 10);
    const newCall = {
      date: currentDate,
      purpose: purposes.find((p) => p.value === purposeValue)?.label || '',
      summary: newCallNotes,
    };
    const updatedStudents = students.map((student) =>
      student.name === studentValue
        ? { ...student, pastFeedbacks: [...student.pastFeedbacks, newCall] }
        : student
    );
    setStudents(updatedStudents);
    setNewCallNotes('');
  };

  const handleCall = (phoneNumber) => {
    const currentDate = new Date().toISOString().slice(0, 10);
    const updatedStudents = students.map((student) =>
      student.name === studentValue
        ? {
            ...student,
            pastFeedbacks: [
              ...student.pastFeedbacks,
              { date: currentDate, purpose: 'Call', summary: '' },
            ],
          }
        : student
    );
    setStudents(updatedStudents);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const renderStudentDetail = () => {
    if (!studentValue) return null;
    const selectedStudent = students.find((s) => s.name === studentValue);
    return (
      <View style={styles.studentDetailContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneNumberContainer}>
          <Text style={styles.phoneNumberText}>
            {selectedStudent?.phoneNumber}
          </Text>
          <TouchableOpacity onPress={() => handleCall(selectedStudent?.phoneNumber)}>
            <Icon name="call" size={24} color="#6495ed" style={styles.callIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => handleViewAllPastCalls(selectedStudent)}>
          <Text style={styles.viewDetailButton}>View All Past Calls</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleViewAllPastCalls = (student) => {
    setSelectedStudentDetails(student);
    setModalVisible(true);
  };

  const handleClassChange = (value) => {
    setClassValue(value);
    const filteredStudents = studentsData.filter(
      (student) => student.class === value
    );
    setStudents(filteredStudents);
    setStudentValue(null);
  };

  const handleStudentSearch = (text) => {
    const filteredStudents = studentsData.filter(
      (student) =>
        student.class === classValue &&
        student.name?.toLowerCase().includes(text?.toLowerCase())
    );
    setStudents(filteredStudents);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
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

        <TouchableOpacity onPress={() => alert('Navigate to Notifications')}>
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
              setSelected={setStudentValue}
              data={students.map((student) => ({
                label: student.name,
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
              <FlatList
                data={
                  students.find((s) => s.name === studentValue)?.pastFeedbacks ||
                  []
                }
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={styles.tableCell}>{item.date}</Text>
                    <Text style={styles.tableCell}>{item.purpose}</Text>
                    <Text style={styles.tableCell}>{item.summary}</Text>
                  </View>
                )}
              />
            </View>
          )}

          {/* Upcoming Calls Section */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upcoming Calls</Text>
              <FlatList
                data={
                  students.find((s) => s.name === studentValue)?.upcomingCalls ||
                  []
                }
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                  // Calculate countdown dynamically
                  const calculateCountdown = () => {
                    const currentDate = new Date();
                    const targetDate = new Date(item.date);
                    const diffTime = Math.abs(targetDate - currentDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return `${diffDays} days`; // Adjust format as needed
                  };

                  return (
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>{item.date}</Text>
                      <Text style={styles.tableCell}>{item.purpose}</Text>
                      <Text style={styles.tableCell}>{calculateCountdown()}</Text>
                    </View>
                  );
                }}
              />
            </View>
          )}

          {/* New Call Section */}
          {studentValue && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>New Call</Text>
              <View style={styles.dropdown}>
                <SelectList
                  setSelected={setPurposeValue}
                  data={purposes}
                  save="value"
                  placeholder="Select Purpose"
                  boxStyles={styles.dropdownBox}
                />
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="Enter summary for the call"
                multiline
                value={newCallNotes}
                onChangeText={setNewCallNotes}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleCallSubmission}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Render Student Details */}
          {renderStudentDetail()}
        </View>
      </ScrollView>

      {/* Past Calls Modal */}
      {selectedStudentDetails && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Past Calls for {selectedStudentDetails.name}</Text>
            <FlatList
              data={selectedStudentDetails.pastFeedbacks}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.modalTableRow}>
                  <Text style={styles.modalTableCell}>{item.date}</Text>
                  <Text style={styles.modalTableCell}>{item.purpose}</Text>
                  <Text style={styles.modalTableCell}>{item.summary}</Text>
                </View>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PerformanceMatricesScreen;
