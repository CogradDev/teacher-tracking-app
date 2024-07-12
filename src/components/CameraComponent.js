import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera } from 'expo-camera';

const CameraComponent = ({ onCapture }) => {
  const cameraRef = useRef(null);

  const capturePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      onCapture(photo);
    }
  };

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} ref={cameraRef} onCameraReady={capturePhoto} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    width: 1,
    height: 1,
  },
});

export default CameraComponent;
