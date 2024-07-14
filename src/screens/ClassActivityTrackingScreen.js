import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera} from 'react-native-image-picker';
import moment from 'moment';
import {SelectList} from 'react-native-dropdown-select-list';
import {ScrollView} from 'react-native-gesture-handler';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';

const {width} = Dimensions.get('window');

const ClassActivityTrackingScreen = ({navigation}) => {
  const [classSelected, setClassSelected] = useState(null);
  const [subjectSelected, setSubjectSelected] = useState(null);
  const [tasksVisible, setTasksVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasksData, setTasksData] = useState({});
  const [teacherID, setTeacherId] = useState('teacherId');

  useEffect(() => {
    const Data = async () => {
      const teacherData = await AsyncStorage.getItem('teacherData');
      const parsedTeacherData = JSON.parse(teacherData);
      setTeacherId(parsedTeacherData._id);
    };
    Data();
  }, []);

  useEffect(() => {
    fetchClassPeriodsByTeacher();
  }, []);

  useEffect(() => {
    if (classSelected) {
      const availableSubjects = Object.keys(tasksData[classSelected] || {});
      const subjectsArray = availableSubjects.map(subjectName => ({
        label: subjectName.charAt(0).toUpperCase() + subjectName.slice(1),
        value: subjectName,
      }));
      setSubjects(subjectsArray);
    } else {
      setSubjects([]);
    }
  }, [classSelected, tasksData]);

  const fetchClassPeriodsByTeacher = async () => {
    try {
      const response = await axios.get(
        apiList.getClassPeriodByTeacher(teacherID),
      );
      const periods = response.data.reduce((acc, period) => {
        if (!acc[period.class]) {
          acc[period.class] = {};
        }
        if (!acc[period.class][period.subject]) {
          acc[period.class][period.subject] = {
            periodId: period._id,
            tasks: {},
            attendance: period.status,
          };
        }
        acc[period.class][period.subject].periodId = period._id;
        return acc;
      }, {});

      setTasksData(periods);

      const availableClasses = Object.keys(periods).map(className => ({
        label: className.charAt(0).toUpperCase() + className.slice(1),
        value: className,
      }));
      setClasses(availableClasses);
    } catch (error) {
      console.error('Error fetching class periods:', error);
      Alert.alert('Error', 'Failed to fetch class periods');
    }
  };

  const fetchTasksByPeriod = async periodId => {
    try {
      const response = await fetch(apiList.getTasksByPeriods(periodId));
      const tasks = response.data.reduce((acc, task) => {
        acc[task._id] = {
          description: task.title,
          status: task.status,
          remark: task.remark || '',
        };
        return acc;
      }, {});
      const updatedTasksData = {...tasksData};
      updatedTasksData[classSelected][subjectSelected].tasks = tasks;
      setTasksData(updatedTasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to fetch tasks');
    }
  };

  const handleImagePicker = () => {
    const options = {
      noData: true,
      mediaType: 'photo',
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const source = {uri: response.assets[0].uri};
        setPhotos(prevPhotos => [...prevPhotos, source]);
      }
    });
  };

  const handleTaskComplete = async (className, subjectName, taskId) => {
    const updatedTasksData = {...tasksData};
    const task = updatedTasksData[className][subjectName].tasks[taskId];
    task.status = !task.status;
    updatedTasksData[className][subjectName].tasks[taskId] = task;

    try {
      await fetch(apiList.updateTask(taskId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: task.status,
        }),
      });
      updatedTasksData[className][subjectName].attendance = true; // Mark attendance
      setTasksData(updatedTasksData);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const handleRemarkChange = (className, subjectName, taskId, text) => {
    const updatedTasksData = {...tasksData};
    updatedTasksData[className][subjectName].tasks[taskId].remark = text;
    setTasksData(updatedTasksData);
  };

  const getTaskStyle = task => {
    if (task.status) {
      return styles.taskCompleted;
    } else if (task.remark) {
      return styles.taskWithRemark;
    } else {
      return styles.taskNotCompleted;
    }
  };

  const toggleTasksVisibility = () => {
    if (classSelected && subjectSelected) {
      const periodId = tasksData[classSelected][subjectSelected].periodId;
      fetchTasksByPeriod(periodId);
      setTasksVisible(true);
    } else {
      setTasksVisible(false);
    }
  };

  const renderTask = ({item, index}) => {
    const taskId = item._id;
    const task = item.task;

    return (
      <View key={index} style={[styles.taskContainer, getTaskStyle(task)]}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            onPress={() =>
              handleTaskComplete(classSelected, subjectSelected, taskId)
            }>
            <Icon
              name={task.status ? 'checkbox' : 'square-outline'}
              size={24}
              color={
                task.status ? '#4caf50' : task.remark ? '#ffeb3b' : '#f44336'
              }
            />
          </TouchableOpacity>
          <Text style={styles.taskDescription}>{task.description}</Text>
        </View>
        <TextInput
          style={styles.remarksInput}
          placeholder="Remarks"
          onChangeText={text =>
            handleRemarkChange(classSelected, subjectSelected, taskId, text)
          }
          value={task.remark}
        />
      </View>
    );
  };

  const taskItems =
    classSelected && subjectSelected
      ? Object.keys(tasksData[classSelected][subjectSelected].tasks).map(
          taskKey => ({
            key: taskKey,
            task: tasksData[classSelected][subjectSelected].tasks[taskKey],
          }),
        )
      : [];

  const canSubmit = () => {
    if (!classSelected || !subjectSelected) {
      return false;
    }

    const tasks = tasksData[classSelected][subjectSelected].tasks;
    const allTasksCompleted = Object.values(tasks).every(task => task.status);

    return allTasksCompleted && photos.length > 0;
  };

  const handleSubmit = async () => {
    if (canSubmit()) {
      try {
        const updatedTasksData = {...tasksData};
        const periodId =
          updatedTasksData[classSelected][subjectSelected].periodId;

        await axios.put(`${baseURL}/classPeriods/${periodId}`, {
          status: true,
          photos: photos.map(photo => photo.uri),
        });

        updatedTasksData[classSelected][subjectSelected].attendance = true;
        setTasksData(updatedTasksData);
        Alert.alert('Submitted!');
        setTasksVisible(false);
        setPhotos([]);
      } catch (error) {
        console.error('Error submitting tasks:', error);
        Alert.alert('Error', 'Failed to submit tasks');
      }
    } else {
      Alert.alert(
        'Error',
        'Please complete all tasks and take photos to submit.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
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
          <Text style={styles.headerText}>Class Activity Tracking</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CommunicationScreen')}>
          <Icon
            name="notifications-outline"
            size={30}
            color="#6495ed"
            style={styles.notification}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{moment().format('MMMM Do YYYY')}</Text>
      </View>
      <View style={styles.dropdownContainer}>
        <SelectList
          setSelected={val => setClassSelected(val)}
          data={classes}
          placeholder="Select Class"
          searchPlaceholder="Search Class"
          boxStyles={styles.dropdownBox}
        />
        <SelectList
          setSelected={val => setSubjectSelected(val)}
          data={subjects}
          placeholder="Select Subject"
          searchPlaceholder="Search Subject"
          boxStyles={styles.dropdownBox}
        />
      </View>
      {tasksVisible && (
        <FlatList
          data={taskItems}
          renderItem={renderTask}
          keyExtractor={item => item.key}
          contentContainerStyle={styles.tasksList}
        />
      )}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleImagePicker}>
          <Icon name="camera" size={24} color="#fff" />
          <Text style={styles.cameraButtonText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={!canSubmit()}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal style={styles.photosContainer}>
        {photos.map((photo, index) => (
          <Image key={index} source={photo} style={styles.photo} />
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headingTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6495ed',
  },
  notification: {
    marginRight: 8,
  },
  dateContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: '#888',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 8,
  },
  tasksList: {
    paddingBottom: 16,
  },
  taskContainer: {
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskDescription: {
    marginLeft: 8,
    fontSize: 16,
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
  },
  taskCompleted: {
    backgroundColor: '#e8f5e9',
  },
  taskWithRemark: {
    backgroundColor: '#fffde7',
  },
  taskNotCompleted: {
    backgroundColor: '#ffebee',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6495ed',
    padding: 16,
    borderRadius: 4,
  },
  cameraButtonText: {
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  photo: {
    width: width / 3 - 16,
    height: width / 3 - 16,
    marginRight: 8,
    borderRadius: 4,
  },
});

export default ClassActivityTrackingScreen;
