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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera} from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';
import moment from 'moment';
import {SelectList} from 'react-native-dropdown-select-list';
import {ScrollView} from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import {useTheme} from '../../ThemeContext';

const {width} = Dimensions.get('window');

const ClassActivityTrackingScreen = ({navigation}) => {
  const [classSelected, setClassSelected] = useState(null);
  const [subjectSelected, setSubjectSelected] = useState(null);
  const [tasksVisible, setTasksVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasksData, setTasksData] = useState({});
  const [teacherID, setTeacherId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const teacherData = await AsyncStorage.getItem('teacherData');
        if (teacherData) {
          const parsedTeacherData = JSON.parse(teacherData);
          setTeacherId(parsedTeacherData._id);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
      }
    };
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (teacherID) {
      fetchClassPeriodsByTeacher(teacherID);
    }
  }, [teacherID]);

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

  const fetchClassPeriodsByTeacher = async teacherID => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        apiList.getClassPeriodByTeacher(teacherID, today),
      );
      const data = await response.json();

      // Process the class periods into a structured format
      const periods = data.reduce((acc, period) => {
        const className = period.class.className;
        const subjectName = period.subject.subName;

        if (!acc[className]) {
          acc[className] = {};
        }

        if (!acc[className][subjectName]) {
          acc[className][subjectName] = {
            periodId: period._id,
            tasks: {},
            attendance: period.status,
          };
        }

        period.tasks.forEach(task => {
          // Flatten the nested object in title field
          const taskTitles = Object.values(task.title).flat();

          // Extract the task type (key from the title object)
          const taskType = Object.keys(task.title)[0]; // Assuming only one key per task

          acc[className][subjectName].tasks[task._id] = {
            description: taskTitles.join('\n'),
            status: task.status,
            remark: task.remark || '',
            type: taskType, // Add the extracted task type here
          };
        });

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

  const handleImagePicker = () => {
    const options = {
      noData: true,
      mediaType: 'photo',
      includeBase64: true,
    };
  
    launchCamera(options, async response => {
      if (response.didCancel) {
        return;
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        try {
          // Get the original image URI
          const sourceUri = response.assets[0].uri;
  
          // Resize the image
          const resizedImage = await ImageResizer.createResizedImage(
            sourceUri, // original image URI
            800, // width
            600, // height
            'JPEG', // format
            80 // quality percentage
          );
  
          // Convert resized image to Base64
          const resizedImageBase64 = await RNFS.readFile(resizedImage.uri, 'base64');
  
          // Add resized Base64 image to photos
          setPhotos(prevPhotos => [...prevPhotos, resizedImageBase64]);
        } catch (error) {
          console.error('Error processing image:', error);
        }
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
          remark: task.remark,
        }),
      });
      setTasksData(updatedTasksData);
    } catch (error) {
      console.error('Error updating task status:', error);
      Alert.alert('Error', error.response.data.message);
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
      setTasksVisible(true);
    } else {
      setTasksVisible(false);
    }
  };

  const renderTask = ({item, index}) => {
    const taskId = item.key;
    const task = item.task;

    console.log(task);

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
                task.status
                  ? theme.green
                  : task.remark
                  ? theme.yellow
                  : theme.red
              }
            />
          </TouchableOpacity>
          <View style={styles.taskDescriptionContainer}>
            <Text style={styles.taskTitle}>{task.type}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
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
      Alert.alert('Please complete');
      return false;
    }

    const tasks = tasksData[classSelected][subjectSelected].tasks;
    const allTasksCompleted = Object.values(tasks).every(task => task.status);

    return photos.length > 0;
  };

  
  const handleSubmit = async () => {
    if (canSubmit()) {
      try {
        setIsLoading(true);
        const periodId = tasksData[classSelected][subjectSelected].periodId;
  
        const response = await Promise.race([
          fetch(apiList.updatePeriods(periodId), {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: true,
              photos: photos.map(photo => photo),
            }),
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 10000)), // Timeout after 10 seconds
        ]);
  
        const data = await response.json();
  
        // Update the tasks data after successful submission
        setTasksData(prevTasksData => ({
          ...prevTasksData,
          [classSelected]: {
            ...prevTasksData[classSelected],
            [subjectSelected]: {
              ...prevTasksData[classSelected][subjectSelected],
              attendance: true,
            },
          },
        }));
  
        Alert.alert('Submitted!');
        setTasksVisible(false);
        setPhotos([]);
      } catch (error) {
        console.error('Error submitting tasks:', error);
        Alert.alert(
          'Error',
          error.response?.data?.message || 'Something went wrong. Please try again.',
        );
      } finally {
        setIsLoading(false); 
      }
    } else {
      Alert.alert('Error', 'Please take photos to submit.');
    }
  };
  

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
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
              color={theme.blue}
              style={styles.backButton}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>Class Activity Tracking</Text>
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
          inputStyles={styles.dropdownText}
          dropdownItemStyles={styles.dropdownItem}
          dropdownTextStyles={styles.dropdownText}
        />
        <SelectList
          setSelected={val => setSubjectSelected(val)}
          data={subjects}
          placeholder="Select Subject"
          searchPlaceholder="Search Subject"
          boxStyles={styles.dropdownBox}
          inputStyles={styles.dropdownText}
          dropdownItemStyles={styles.dropdownItem}
          dropdownTextStyles={styles.dropdownText}
          onSelect={() => toggleTasksVisibility()}
        />
      </View>
      {tasksVisible && taskItems.length > 0 && (
        <ScrollView>
          <FlatList
            data={taskItems}
            renderItem={renderTask}
            keyExtractor={item => item.key}
            contentContainerStyle={styles.tasksList}
          />
          <ScrollView horizontal style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <Image
                key={index}
                source={{uri: `data:image/png;base64,${photo}`}}
                style={styles.photo}
              />
            ))}
          </ScrollView>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleImagePicker}>
              <Icon name="camera" size={24} color={theme.white} />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              style={styles.submitButton}>
              {isLoading ? ( // Show loader if isLoading is true
                <ActivityIndicator size="small" color={theme.white} />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
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
      marginBottom: 16,
    },
    dateText: {
      fontSize: 16,
      color: theme.gray,
    },
    dropdownContainer: {
      marginBottom: 16,
      marginHorizontal: 16,
    },
    dropdownBox: {
      borderWidth: 1,
      borderColor: theme.lightGray,
      borderRadius: 4,
      marginBottom: 8,
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
    tasksList: {
      paddingBottom: 16,
      paddingHorizontal: 16,
    },
    taskContainer: {
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.lightGray,
      borderRadius: 4,
    },
    taskHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    taskDescriptionContainer:{
      display:"flex",
      flexDirection: "column",
      alignItems : "flex-start"
    },
    taskTitle:{
      color: theme.gray,
      marginLeft: 8,
      fontWeight : "bold",
      fontSize: 20,
    },
    taskDescription: {
      marginLeft: 8,
      fontSize: 16,
      paddingRight : 10,

      color: theme.gray,
    },
    remarksInput: {
      borderWidth: 1,
      borderColor: theme.gray,
      backgroundColor: theme.white,
      color: theme.black,
      borderRadius: 4,
      padding: 8,
      marginTop: 8,
    },
    taskCompleted: {
      backgroundColor: theme.lightGreen,
    },
    taskWithRemark: {
      backgroundColor: theme.lightYellow,
    },
    taskNotCompleted: {
      backgroundColor: theme.lightRed,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      marginHorizontal: 16,
    },
    cameraButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.blue,
      padding: 16,
      borderRadius: 4,
    },
    cameraButtonText: {
      marginLeft: 8,
      color: theme.white,
      fontSize: 16,
    },
    submitButton: {
      backgroundColor: theme.green,
      padding: 16,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      marginLeft: 8,
    },
    submitButtonText: {
      color: theme.white,
      fontSize: 16,
    },
    photosContainer: {
      flexDirection: 'row',
      margin: 16,
    },
    photo: {
      width: width / 3 - 16,
      height: width / 3 - 16,
      marginRight: 8,
      borderRadius: 4,
      resizeMode: 'cover',
    },
  });

export default ClassActivityTrackingScreen;
