import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import WaveformAnimation from './components/WaveformAnimation';

interface VoiceInputProps {}

const VoiceInput: React.FC<VoiceInputProps> = () => {
  const router = useRouter();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const circle1Scale = useRef(new Animated.Value(1)).current;
  const circle2Scale = useRef(new Animated.Value(0.8)).current;
  const circle3Scale = useRef(new Animated.Value(0.6)).current;
  const circle1Opacity = useRef(new Animated.Value(0.2)).current;
  const circle2Opacity = useRef(new Animated.Value(0.2)).current;
  const circle3Opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    // Request audio recording permissions
    Audio.requestPermissionsAsync();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    if (isRecording) {
      // Circle 1 animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(circle1Scale, {
              toValue: 1.1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle1Opacity, {
              toValue: 0.1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circle1Scale, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle1Opacity, {
              toValue: 0.2,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Circle 2 animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(circle2Scale, {
              toValue: 0.9,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle2Opacity, {
              toValue: 0.1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circle2Scale, {
              toValue: 0.8,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle2Opacity, {
              toValue: 0.2,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();

      // Circle 3 animation
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(circle3Scale, {
              toValue: 0.7,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle3Opacity, {
              toValue: 0.1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(circle3Scale, {
              toValue: 0.6,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(circle3Opacity, {
              toValue: 0.2,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      // Reset animations when not recording
      circle1Scale.setValue(1);
      circle2Scale.setValue(0.8);
      circle3Scale.setValue(0.6);
      circle1Opacity.setValue(0.2);
      circle2Opacity.setValue(0.2);
      circle3Opacity.setValue(0.2);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access microphone was denied');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/wav',
          bitsPerSecond: 128000,
        },
      });
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      if (err instanceof Error) {
        alert(`Failed to start recording: ${err.message}`);
      } else {
        alert('Failed to start recording');
      }
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (uri) {
        await processAudioFile(uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  const processAudioFile = async (uri: string) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      
      if (Platform.OS !== 'web') {
        // For mobile platforms, verify the file exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) {
          throw new Error('Recorded audio file not found');
        }

        // For React Native, we can append the file directly using its URI
        formData.append('file', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          type: 'audio/m4a',
          name: 'recording.m4a'
        } as any);
      } else {
        // For web, use fetch to get the blob
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, 'recording.wav');
      }

      // Call the Sarvam.ai API
      const apiResponse = await fetch("https://api.sarvam.ai/speech-to-text-translate", {
        method: "POST",
        headers: {
          "api-subscription-key": process.env.EXPO_PUBLIC_SARVAM_API_KEY || '',
          "Accept": "application/json",
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${apiResponse.status} - ${errorText}`);
      }

      const data = await apiResponse.json();
      if (data.transcript) {
        setTranscribedText(data.transcript);
        
        // Send transcribed text to n8n webhook
        await sendToWebhook(data.transcript);
      } else {
        throw new Error('No transcription found in response');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      if (error instanceof Error) {
        alert(`Failed to process audio: ${error.message}`);
      } else {
        alert('Failed to process audio. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sendToWebhook = async (message: string) => {
    try {
      const webhookUrl = `${process.env.EXPO_PUBLIC_N8N_URL}/webhook-test/ae82ad1a-827d-4a07-9fa7-00b1035c137e`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'test_webhook',
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook Error: ${response.status}`);
      }

      console.log('Successfully sent to webhook');
    } catch (error) {
      console.error('Error sending to webhook:', error);
      // Don't show alert here to avoid interrupting the user experience
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Voice Input</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.circleContainer}>
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle1,
              {
                transform: [{ scale: circle1Scale }],
                opacity: circle1Opacity,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle2,
              {
                transform: [{ scale: circle2Scale }],
                opacity: circle2Opacity,
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.circle, 
              styles.circle3,
              {
                transform: [{ scale: circle3Scale }],
                opacity: circle3Opacity,
              }
            ]} 
          />
          <View style={styles.micContainer}>
            <TouchableOpacity 
              style={[styles.recordButton, isRecording && styles.recordingButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons 
                name={isRecording ? "stop" : "mic"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.recordingText}>
          {isRecording ? 'Recording in progress' : 'Tap to start recording'}
        </Text>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Processing audio...</Text>
          </View>
        )}

        {transcribedText !== '' && (
          <View style={styles.transcriptionContainer}>
            <Text style={styles.transcriptionTitle}>Transcription:</Text>
            <Text style={styles.transcriptionText}>{transcribedText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const { width } = Dimensions.get('window');
const circleSize = width * 0.5;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 18,
    color: '#333',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  circleContainer: {
    width: circleSize,
    height: circleSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  circle: {
    position: 'absolute',
    borderRadius: circleSize,
    borderWidth: 1,
    width: '100%',
    height: '100%',
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  circle1: {
    transform: [{ scale: 1 }],
  },
  circle2: {
    transform: [{ scale: 0.8 }],
  },
  circle3: {
    transform: [{ scale: 0.6 }],
  },
  micContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 35,
    padding: 8,
  },
  recordButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  transcriptionContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transcriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  transcriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default VoiceInput; 