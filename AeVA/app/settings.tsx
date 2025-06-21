import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const [systemPrompt, setSystemPrompt] = React.useState('');
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Prompt</Text>
          
          <View style={styles.promptContainer}>
            <Text style={styles.promptLabel}>Enter your system prompt below:</Text>
            <TextInput
              style={styles.promptInput}
              multiline
              numberOfLines={6}
              placeholder="Type your system prompt here..."
              value={systemPrompt}
              onChangeText={setSystemPrompt}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Prompt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Notifications</Text>
            <Switch 
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notificationsEnabled ? "#007AFF" : "#f4f3f4"}
            />
          </View>
          
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
          
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    fontSize: 18,
    color: '#007AFF',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 16,
    color: '#999',
  },
  versionContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  promptContainer: {
    width: '100%',
  },
  promptLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 120,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
