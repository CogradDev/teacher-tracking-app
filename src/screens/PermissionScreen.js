import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Dimensions,
  Alert,
  BackHandler,
} from 'react-native';
import { useTheme } from '../../ThemeContext';

const {width} = Dimensions.get('window');

const PermissionScreen = ({navigation}) => {
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  const {theme} = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true, // This will disable the back button
    );

    checkPermissions();

    return () => backHandler.remove();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      const locationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      const phoneStateGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      );

      const notificationGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (cameraGranted && locationGranted && phoneStateGranted && notificationGranted) {
        setPermissionsGranted(true);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
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
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);

      console.log('Permission Results:', granted);

      const allPermissionsGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );

      if (allPermissionsGranted) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        Alert.alert(
          'Permissions Required',
          'Please grant all the necessary permissions to proceed.',
        );
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
          <Text style={styles.cell}>Phone</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Notifications</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePermissionRequest}>
        <Text style={styles.buttonText}>Grant Permissions</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = theme => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    backgroundColor: theme.white,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: width * 0.05,
    color: theme.blue
  },
  subtitle: {
    fontSize: width * 0.04,
    marginBottom: width * 0.05,
    textAlign: 'center',
    color: theme.gray

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
    borderBottomColor: theme.lightGray,
  },
  cell: {
    flex: 1,
    fontSize: width * 0.035,
    fontWeight: 'bold',
    color: theme.gray
  },
  button: {
    backgroundColor: theme.blue,
    paddingVertical: width * 0.04,
    paddingHorizontal: width * 0.08,
    borderRadius: width * 0.02,
    marginTop: width * 0.1,
  },
  buttonText: {
    color: theme.white,
    fontSize: width * 0.04,
    fontWeight: 'bold',
  },
});

export default PermissionScreen;
