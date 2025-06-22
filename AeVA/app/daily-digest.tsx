import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AudioPlayer } from './components/AudioPlayer';
import { styles as globalStyles } from './styles';

const audioFiles = [
  { 
    id: 1, 
    title: 'Daily Digest', 
    date: 'Sun 22 Jun',
    source: require('../assets/audios/output_1.wav') 
  },
  { 
    id: 2, 
    title: 'Daily Digest', 
    date: 'Sun 22 Jun',
    source: require('../assets/audios/output_2.wav') 
  },
  { 
    id: 3, 
    title: 'Daily Digest', 
    date: 'Sun 22 Jun',
    source: require('../assets/audios/output_3.wav') 
  },
];

export default function DailyDigest() {
  const router = useRouter();

  return (
    <View style={[globalStyles.container]}>
      <ScrollView style={globalStyles.scrollView}>
        <View style={globalStyles.headerContainer}>
          <Text style={globalStyles.headerText}>Daily Digest</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <View style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </View>
          </TouchableOpacity>
        </View>

        {audioFiles.map((audio) => (
          <AudioPlayer
            key={audio.id}
            title={audio.title}
            subtitle={audio.date}
            audioSource={audio.source}
          />
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={globalStyles.fab}
        onPress={() => router.push('/voice-input')}
      >
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
}); 