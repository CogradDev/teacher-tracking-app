import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiList from '../services/api';
import Sound from 'react-native-sound'; // Import react-native-sound
import {useTheme} from '../../ThemeContext';

const {width} = Dimensions.get('window');

const ComplaintsScreen = ({navigation}) => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [note, setNote] = useState('');
  const [audio, setAudio] = useState(null);

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const teacherData = await AsyncStorage.getItem('teacherData');
        const parsedTeacherData = JSON.parse(teacherData);
        const response = await fetch(
          apiList.getUnresolvedComplaints(parsedTeacherData._id),
        );
        const data = await response.json();
        const sortedComplaints = data.sort(
          (a, b) => new Date(b.date) - new Date(a.date),
        );
        setComplaints(sortedComplaints);
      } catch (error) {
        console.error('Error fetching complaints:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const handleOpenModal = (complaintId, status) => {
    if (status === 'UNRESOLVED') {
      setSelectedComplaintId(complaintId);
      setOpenModal(true);
    } else {
      Alert.alert('Warning', 'This complaint is already resolved.');
    }
  };

  const handleResolveComplaint = async () => {
    try {
      const response = await fetch(apiList.resolveComplaint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          complaintId: selectedComplaintId,
          note,
        }),
      });

      if (response.status === 200) {
        setComplaints(prevComplaints =>
          prevComplaints.map(complaint =>
            complaint._id === selectedComplaintId
              ? {...complaint, status: 'RESOLVED'}
              : complaint,
          ),
        );
        Alert.alert('Success', 'Complaint resolved successfully.');
      } else {
        Alert.alert('Error', 'Error resolving complaint. Please try again.');
      }

      setOpenModal(false);
    } catch (error) {
      console.error('Error resolving complaint:', error);
      Alert.alert('Error', 'Error resolving complaint. Please try again.');
    }
  };

  const handlePlayAudio = uri => {
    if (audio) {
      audio.stop(() => {
        audio.release();
      });
    }

    const sound = new Sound(uri, null, error => {
      if (error) {
        console.log('Failed to load sound:', error);
        return;
      }
      setAudio(sound);
      sound.play(() => {
        sound.release();
        setAudio(null);
      });
    });
  };

  const renderComplaintItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{uri: item.parentId.profile}}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.cardTitle}>
            Date: {new Date(item.date).toLocaleString()}
          </Text>
          <Text style={styles.cardParent}>Parent: {item.parentId.name}</Text>
        </View>
      </View>
      <Text style={styles.cardContent}>{item.message || 'Not available'}</Text>
      {item.audio && (
        <TouchableOpacity
          style={styles.audioButton}
          onPress={() => handlePlayAudio(item.audio)}>
          <Icon name="play-circle-outline" size={24} color={theme.blue} />
          <Text style={styles.audioButtonText}>Play Audio</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[
          styles.statusButton,
          item.status === 'UNRESOLVED'
            ? styles.unresolvedButton
            : styles.resolvedButton,
        ]}
        onPress={() => handleOpenModal(item._id, item.status)}>
        <Icon
          name={
            item.status === 'UNRESOLVED' ? 'close-circle' : 'checkmark-circle'
          }
          size={20}
          color={item.status === 'UNRESOLVED' ? theme.red : theme.green}
        />
        <Text
          style={{
            ...styles.statusText,
            color: item.status === 'UNRESOLVED' ? theme.red : theme.green,
          }}>
          {item.status}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading complaints...</Text>
      </View>
    );
  }

  if (complaints.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Complaints To Resolve</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={0.075 * width} color={theme.blue} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Complaints</Text>
      </View>
      <FlatList
        data={complaints}
        renderItem={renderComplaintItem}
        keyExtractor={item => item._id}
      />
      <Modal
        visible={openModal}
        animationType="slide"
        onRequestClose={() => setOpenModal(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Resolve Complaint</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={styles.textInput}
            placeholder="Add a note (optional)"
            multiline
          />
          <View style={styles.buttonContainer}>
            <Button
              title="Resolve"
              onPress={handleResolveComplaint}
              color={theme.green}
            />
            <Button
              title="Cancel"
              onPress={() => setOpenModal(false)}
              color={theme.red}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
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
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingVertical: 0.04 * width,
      paddingHorizontal: 0.025 * width,
      marginBottom: 10,
      backgroundColor: theme.white,
      borderBottomWidth: 1,
      borderBottomColor: theme.lightGray,
    },
    headerText: {
      fontSize: 0.06 * width,
      fontWeight: 'bold',
      color: theme.blue,
    },
    card: {
      backgroundColor: theme.white,
      padding: 16,
      borderRadius: 8,
      marginBottom: 16,
      marginHorizontal: 16,
      elevation: 3,
      shadowColor: theme.black,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.lightBlack,
    },
    cardContent: {
      marginTop: 8,
      fontSize: 14,
      color: theme.gray,
    },
    cardParent: {
      marginTop: 4,
      fontSize: 14,
      color: theme.blue,
      fontWeight: 'bold',
    },
    audioButton: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: theme.lightGreen,
      borderColor: theme.green,
      borderWidth: 1,
    },
    audioButtonText: {
      marginLeft: 8,
      fontSize: 16,
      color: theme.blue,
    },
    statusButton: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    unresolvedButton: {
      backgroundColor: theme.lightRed,
      borderColor: theme.red,
      borderWidth: 1,
    },
    resolvedButton: {
      backgroundColor: theme.lightGreen,
      borderColor: theme.green,
      borderWidth: 1,
    },
    statusText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: 'bold',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: theme.gray,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: theme.lightGray,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      padding: 16,
      backgroundColor: theme.white,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
      color: theme.lightBlack,
    },
    textInput: {
      height: 100,
      borderColor: theme.lightGray,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 12,
      textAlignVertical: 'top',
      color: theme.lightBlack,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

export default ComplaintsScreen;
