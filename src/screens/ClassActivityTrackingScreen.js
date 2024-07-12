import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
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
const {width} = Dimensions.get('window');

const ClassActivityTrackingScreen = ({navigation}) => {
  const [classSelected, setClassSelected] = useState(null);
  const [subjectSelected, setSubjectSelected] = useState(null);
  const [tasksVisible, setTasksVisible] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasksData, setTasksData] = useState({
    date: moment().format('YYYY-MM-DD'),
    teacher: 'Mss. Radhika',
    class: {
      nursery: {
        math: {
          attendance: false,
          photo: '', 
          task: {
            task1: {
              description: 'Complete counting worksheet',
              status: false,
              remark: '',
            },
            task2: {
              description: 'Learn numbers 1 to 10',
              status: true,
              remark: 'Completed successfully',
            },
          },
        },
      },
    },
  });

  const navigateToCommunicationScreen = () => {
    navigation.navigate('Communication');
  };

  useEffect(() => {
    const availableClasses = Object.keys(tasksData.class);
    const classesArray = availableClasses.map(className => ({
      label: className.charAt(0).toUpperCase() + className.slice(1),
      value: className,
    }));
    setClasses(classesArray);

    if (classSelected) {
      const availableSubjects = Object.keys(tasksData.class[classSelected]);
      const subjectsArray = availableSubjects.map(subjectName => ({
        label: subjectName.charAt(0).toUpperCase() + subjectName.slice(1),
        value: subjectName,
      }));
      setSubjects(subjectsArray);
    } else {
      setSubjects([]);
    }
  }, [classSelected, tasksData]);

  const handleImagePicker = () => {
    const options = {
      noData: true,
    };
    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else {
        const source = {uri: response.assets[0].uri};
        setPhoto(source);
      }
    });
  };

  const handleTaskComplete = (className, subjectName, taskKey) => {
    const updatedTasksData = {...tasksData};
    const task = updatedTasksData.class[className][subjectName].task[taskKey];
    task.status = !task.status;
    task.photo = photo?.uri || ''; // Update photo URI if available
    updatedTasksData.class[className][subjectName].task[taskKey] = task;
    updatedTasksData.class[className][subjectName].attendance = true; // Mark attendance
    setTasksData(updatedTasksData);
  };

  const handleRemarkChange = (className, subjectName, taskKey, text) => {
    const updatedTasksData = {...tasksData};
    updatedTasksData.class[className][subjectName].task[taskKey].remark = text;
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
    const taskKey = item.key;
    const task = item.task;

    return (
      <View key={index} style={[styles.taskContainer, getTaskStyle(task)]}>
        <View style={styles.taskHeader}>
          <TouchableOpacity
            onPress={() =>
              handleTaskComplete(classSelected, subjectSelected, taskKey)
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
            handleRemarkChange(classSelected, subjectSelected, taskKey, text)
          }
          value={task.remark}
        />
      </View>
    );
  };

  const taskItems =
    classSelected && subjectSelected
      ? Object.keys(tasksData.class[classSelected][subjectSelected].task).map(
          taskKey => ({
            key: taskKey,
            task: tasksData.class[classSelected][subjectSelected].task[taskKey],
          }),
        )
      : [];

      const canSubmit = () => {
        if (!classSelected || !subjectSelected) {
          return false;
        }
      
        const tasks = tasksData.class[classSelected][subjectSelected].task;
        const allTasksCompleted = Object.values(tasks).every(task => task.photo !== '');
      
        return allTasksCompleted && photo !== null;
      };
      
      const handleSubmit = () => {
        if (canSubmit()) {
          const updatedTasksData = {...tasksData};
          updatedTasksData.class[classSelected][subjectSelected].attendance = true;
      
          setTasksData(updatedTasksData);
          Alert.alert('Submitted!');
          // Optionally, you can reset states here
          setTasksVisible(false);
          setPhoto(null);
        } else {
          Alert.alert('Error', 'Please complete all tasks and take a photo to submit.');
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
        <TouchableOpacity onPress={navigateToCommunicationScreen}>
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

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Select Class</Text>
        <View style={styles.dropdownContainer}>
          <SelectList
            setSelected={setClassSelected}
            data={classes}
            placeholder="Select a class"
            boxStyles={[styles.dropdown, styles.classDropdown]}
            defaultOption={classSelected}
            onSelect={() => toggleTasksVisibility()}
          />
        </View>

        <Text style={styles.label}>Select Subject</Text>
        <View style={styles.dropdownContainer}>
          <SelectList
            setSelected={setSubjectSelected}
            data={subjects}
            placeholder="Select a subject"
            boxStyles={styles.dropdown}
            defaultOption={subjectSelected}
            onSelect={() => toggleTasksVisibility()}
          />
        </View>

        {tasksVisible && (
          <React.Fragment>
            <FlatList
              data={taskItems}
              renderItem={renderTask}
              keyExtractor={item => item.key}
            />
            {photo && <Image source={photo} style={styles.photo} />}

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={handleImagePicker}
                style={styles.captureButton}>
                <Icon name="camera-outline" size={50} color="#6495ed" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.button,
                  {backgroundColor: canSubmit() ? '#6495ed' : '#ccc'},
                ]}
                disabled={!canSubmit()}>
                <Text style={styles.submitButton}>Save & Submit</Text>
              </TouchableOpacity>
            </View>
          </React.Fragment>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  dateContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#6495ed',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  classDropdown: {
    borderColor: '#6495ed',
  },
  taskContainer: {
    padding: 16,
    marginBottom: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDescription: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  remarksInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
  },
  taskCompleted: {
    borderColor: '#4caf50',
  },
  taskWithRemark: {
    borderColor: '#ffeb3b',
  },
  taskNotCompleted: {
    borderColor: '#f44336',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
  },
  captureButton: {
    padding: 10,
  },
  photo: {
    width: width * 0.8,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6495ed',
    borderRadius: 4,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  submitButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ClassActivityTrackingScreen;
