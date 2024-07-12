import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Dimensions,
  Alert,
  Linking,
} from 'react-native';

const {width} = Dimensions.get('window');

const PermissionScreen = ({navigation}) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      const locationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      const readStorageGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      const writeStorageGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      const phoneStateGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      );

      if (
        cameraGranted &&
        locationGranted &&
        microphoneGranted &&
        readStorageGranted &&
        writeStorageGranted &&
        phoneStateGranted
      ) {
        setPermissionsGranted(true);
        navigation.navigate('Main');
      } else {
        setPermissionsGranted(false);
      }
    } catch (error) {
      console.log('Error checking permissions:', error);
    }
  };

  const handlePermissionRequest = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      console.log('Permission Results:', granted);

      const allPermissionsGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (allPermissionsGranted) {
        navigation.navigate('Home');
      } else {
        // Alert.alert(
        //   'Permissions Required',
        //   'Please grant all the necessary permissions to proceed.',
        // );
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('Error requesting permissions:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Permissions Required</Text>
      <Text style={styles.subtitle}>
        Please grant the following permissions to continue:
      </Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cell}>Camera</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Location</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Microphone</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Storage</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Phone</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePermissionRequest}>
        <Text style={styles.buttonText}>Grant Permissions</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: width * 0.05,
  },
  subtitle: {
    fontSize: width * 0.04,
    marginBottom: width * 0.05,
    textAlign: 'center',
  },
  table: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#6495ed',
    paddingVertical: width * 0.04,
    paddingHorizontal: width * 0.08,
    borderRadius: width * 0.02,
    marginTop: width * 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
});

export default PermissionScreen;
