import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import teacherImage from "../assets/image/Teacher-student-bro.png";
import logo from "../assets/image/cograd-logo.png";

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain" // Ensure the logo fits within its container
      />
      <View style={styles.textContainer}>
        <View>
          <Text style={styles.title}>Cograd Teaching Track</Text>
          <Text style={styles.subtitle}>Welcome!</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
      <Image
        source={teacherImage}
        style={styles.image}
        resizeMode="cover" // Ensure the image fits its container appropriately
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    paddingBottom: height * 0.02, // Adjusted to be relative to height
  },
  logo: {
    width: width * 0.6,
    height: height * 0.2,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.06,
    height: height * 0.4,
  },
  title: {
    fontSize: width * 0.08,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: width * 0.06,
    color: '#333',
    textAlign: 'center',
  },
  image: {
    width: width,
    height: width * 0.6, // Made the height relative to width to maintain aspect ratio
    marginBottom: width * 0.1,
  },
  button: {
    backgroundColor: '#6495ed',
    paddingVertical: width * 0.03, // Made padding relative to width
    paddingHorizontal: width * 0.1,
    borderRadius: 5,
    marginBottom: height * 0.04,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.05,
    textAlign: 'center',
  },
});

export default WelcomeScreen;
