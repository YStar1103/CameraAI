import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import axios from 'axios';
import './utils/ignoreWarnings';

const App = (): React.JSX.Element => {
  const cameraRef = useRef<RNCamera | null>(null);
  const [overlayText, setOverlayText] = useState<string>('No result');
  const [showOverlay, setShowOverlay] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const options = { quality: 0.5, base64: true };
      const { base64 } = await cameraRef.current.takePictureAsync(options);
      await analyzeImageByAI(base64 || '');
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const analyzeImageByAI = async (imageBase64: string) => {
    try {
      setLoading(true);
      cameraRef.current?.pausePreview();
      const response = await axios.post(
        'https://dev-service.inkhunter.co/dev-tech-assessment',
        { image_b64: imageBase64 }
      );
      setOverlayText(response.data.answer);
      setShowOverlay(true);
    } catch (error) {
      console.error('Error sending image to API:', error);
    } finally {
      setLoading(false);
      cameraRef.current?.resumePreview();
    }
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <View style={styles.container}>
      <RNCamera ref={cameraRef} style={styles.camera} captureAudio={false} />

      {showOverlay && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{overlayText}</Text>
        </View>
      )}

      {!showOverlay && !loading && (
        <TouchableOpacity
          onPress={takePicture}
          onLongPress={takePicture}
          style={styles.captureButton}
        >
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
      )}

      {!loading && (
        <TouchableOpacity onPress={toggleOverlay} style={styles.toggleOverlayButton}>
          <Text style={styles.buttonText}>
            {showOverlay ? 'Hide Result' : 'Show Result'}
          </Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Please wait</Text>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    padding: 8,
  },
  toggleOverlayButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: 'white',
    paddingBottom: 5,
  },
});

export default App;