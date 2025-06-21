import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Button
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, registerDeviceWithServer } from "./lib/notifications";
import { useRouter } from 'expo-router';
import { supabase, fetchData } from './lib/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';

interface IndexProps {}

interface CardProps {
  title: string;
  subtitle: string;
  avatarUrl: string;
  memberCount: number;
  gameType?: string;
  leagueType?: string;
  onViewDetail: () => void;
}

interface WorkflowStepProps {
  icon: string;
  title: string;
  description: string;
  completed?: boolean;
  isLast?: boolean;
}

// Workflow Step Component
const WorkflowStep: React.FC<WorkflowStepProps> = ({ icon, title, description, completed = false, isLast = false }) => {
  return (
    <View style={styles.workflowStep}>
      <View style={styles.workflowIconContainer}>
        <Text style={styles.workflowIcon}>{icon}</Text>
        {completed && (
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        )}
      </View>
      
      <View style={styles.workflowContent}>
        <Text style={styles.workflowTitle}>{title}</Text>
        <Text style={styles.workflowDescription}>{description}</Text>
      </View>
      
      {!isLast && <View style={styles.workflowConnector} />}
    </View>
  );
};

const Card: React.FC<CardProps> = ({ title, subtitle, avatarUrl, memberCount, gameType, leagueType, onViewDetail }) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <View style={styles.card}>
      {/* First line: Avatar and time */}
      <View style={styles.cardFirstLine}>
        <Image 
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
        />
        <Text style={styles.timeText}>{currentTime}</Text>
      </View>
      
      {/* Second line: Title and description */}
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.memberContainer}>
          {/* This would ideally be a row of overlapping avatars */}
          <View style={styles.memberAvatars}>
            <View style={[styles.memberAvatar, { backgroundColor: '#FF5733' }]} />
            <View style={[styles.memberAvatar, { backgroundColor: '#33FF57', marginLeft: -10 }]} />
            <View style={[styles.memberAvatar, { backgroundColor: '#3357FF', marginLeft: -10 }]} />
          </View>
          <Text style={styles.memberCount}>+{memberCount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewDetailButton}
          onPress={onViewDetail}
        >
          <Text style={styles.viewDetailText}>View Detail</Text>
          <Text style={styles.arrowIcon}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Bottom Drawer Component
interface BottomDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  cardData: Workflow | null;
  workflowSteps: WorkflowStep[];
  loadingSteps: boolean;
  stepsError: string | null;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ isVisible, onClose, cardData, workflowSteps, loadingSteps, stepsError }) => {
  const screenHeight = Dimensions.get('window').height;
  const panY = useRef(new Animated.Value(screenHeight)).current;
  const translateY = panY.interpolate({
    inputRange: [0, screenHeight],
    outputRange: [0, screenHeight],
    extrapolate: 'clamp',
  });

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: screenHeight,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        panY.setValue(Math.max(0, gestureState.dy));
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeAnim.start(() => onClose());
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  React.useEffect(() => {
    if (isVisible) {
      resetPositionAnim.start();
    }
  }, [isVisible]);

  if (!isVisible || !cardData) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={() => closeAnim.start(() => onClose())}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.background} 
          activeOpacity={1} 
          onPress={() => closeAnim.start(() => onClose())}
        />
        <Animated.View
          style={[styles.bottomSheet, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.drawerHandle} />
          <ScrollView style={styles.drawerScrollView} contentContainerStyle={styles.drawerContent}>
            <Text style={styles.drawerSubtitle}>{cardData.description}</Text>
            <ScrollView style={styles.drawerScrollView} contentContainerStyle={styles.drawerContent}>
              <Text style={styles.drawerSectionTitle}>Workflow Steps</Text>
              
              {loadingSteps ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading steps...</Text>
                </View>
              ) : stepsError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{stepsError}</Text>
                </View>
              ) : workflowSteps.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No steps found for this workflow</Text>
                </View>
              ) : (
                workflowSteps.map((step, index) => (
                  <WorkflowStep
                    key={step.id}
                    icon={getIconForProvider(step.provider)}
                    title={`${step.provider} ${step.tool}`}
                    description={step.description}
                    completed={true}
                    isLast={index === workflowSteps.length - 1}
                  />
                ))
              )}
              
              {workflowSteps.length > 0 && (
                <View style={styles.workflowResult}>
                  <Text style={styles.workflowResultText}>Workflow completed successfully.</Text>
                </View>
              )}
            </ScrollView>
            
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>Details</Text>
              <Text style={styles.drawerText}>Created: {new Date(cardData.created_at).toLocaleString()}</Text>
              <Text style={styles.drawerText}>Updated: {new Date(cardData.updated_at).toLocaleString()}</Text>
              <Text style={styles.drawerText}>Triggered by: {cardData.triggered_by}</Text>
            </View>
            
            <TouchableOpacity style={styles.drawerButton}>
              <Text style={styles.drawerButtonText}>Join Activity</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Define interfaces to match our Supabase table structure
interface Workflow {
  id: number;
  created_at: string;
  name: string;
  triggered_by: string;
  description: string;
  updated_at: string;
}

interface WorkflowStep {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  provider: string;
  tool: string;
  workflow_id: number;
}

const Index: React.FC<IndexProps> = () => {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepsError, setStepsError] = useState<string | null>(null);

  // Fetch workflows data from Supabase
  useEffect(() => {
    async function fetchWorkflows() {
      try {
        setLoading(true);
        const data = await fetchData<Workflow>('Workflow', {
          columns: '*',
          order: { column: 'updated_at', ascending: false },
          limit: 20
        });
        
        if (data) {
          setWorkflows(data);
        }
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to load workflows');
      } finally {
        setLoading(false);
      }
    }

    fetchWorkflows();
  }, []);
  
  // Fetch workflow steps when a workflow is selected
  const fetchWorkflowSteps = async (workflowId: number) => {
    try {
      setLoadingSteps(true);
      setStepsError(null);
      
      const steps = await fetchData<WorkflowStep>('WorkflowStep', {
        columns: '*',
        filter: [{ column: 'workflow_id', operator: 'eq', value: workflowId }],
        order: { column: 'created_at', ascending: true }
      });
      
      if (steps) {
        setWorkflowSteps(steps);
      }
    } catch (err) {
      console.error('Error fetching workflow steps:', err);
      setStepsError('Failed to load workflow steps');
    } finally {
      setLoadingSteps(false);
    }
  };

  const handleViewDetail = (workflow: Workflow) => {
    setSelectedCard(workflow);
    setDrawerVisible(true);
    fetchWorkflowSteps(workflow.id);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  useEffect(() => {
    registerForPushNotificationsAsync().then((token: string | undefined) => {
      if(token) {
        setExpoPushToken(token);
        registerDeviceWithServer(token);
      }
    });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <View style={[styles.container, drawerVisible && styles.containerWithOverlay]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Agent In Box</Text>
          <TouchableOpacity onPress={navigateToSettings}>
            <View style={styles.settingsIcon}>
              <Text style={styles.settingsIconText}><Ionicons name="settings" size={24} color="black" /></Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading workflows...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : workflows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workflows found</Text>
          </View>
        ) : (
          workflows.map((workflow, index) => (
            <Card
              key={workflow.id}
              title={workflow.name}
              subtitle={workflow.description}
              avatarUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(workflow.name)}&background=random`}
              memberCount={1}
              gameType={workflow.triggered_by}
              leagueType={new Date(workflow.updated_at).toLocaleDateString()}
              onViewDetail={() => handleViewDetail(workflow)}
            />
          ))
        )}
      </ScrollView>

      <BottomDrawer 
        isVisible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        cardData={selectedCard}
        workflowSteps={workflowSteps}
        loadingSteps={loadingSteps}
        stepsError={stepsError}
      />
    </View>
  );
}

// Helper function to get an appropriate icon for each provider
function getIconForProvider(provider: string): string {
  const iconMap: {[key: string]: string} = {
    'Gmail': '📧',
    'Quickchart': '📊',
    'Twitter': '𝕏',
    'X': '𝕏',
    'Google': '🔍',
    'Slack': '💬',
    'Discord': '🎮',
    'GitHub': '📦',
    'Notion': '📝',
    'Airtable': '📋',
    'Zapier': '⚡',
    'IFTTT': '🔄',
    'Zoom': '🎥',
    'Dropbox': '📁',
    'Drive': '📁',
    'Calendar': '📅',
    'Sheets': '📊',
    'Docs': '📄'
  };
  
  return iconMap[provider] || '🔧'; // Default icon if provider not found
}

export default Index;

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffeeee',
    borderRadius: 8,
    marginVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerWithOverlay: {
    backgroundColor: 'rgba(0, 0, 0)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 24,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 24,
  },
  inputSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 10,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFirstLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
  },
  cardTitleContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  memberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  memberCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  viewDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  viewDetailText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
    marginRight: 4,
  },
  arrowIcon: {
    fontSize: 16,
    color: '#444',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  background: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0)',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  drawerHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  drawerScrollView: {
    flex: 1,
  },
  drawerContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  drawerSection: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  drawerSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  drawerText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
    lineHeight: 22,
  },
  drawerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  drawerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  workflowStep: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  workflowIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  workflowIcon: {
    fontSize: 24,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workflowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 14,
    color: '#666',
  },
  workflowConnector: {
    position: 'absolute',
    left: 25,
    top: 50,
    width: 2,
    height: 30,
    backgroundColor: '#555',
  },
  workflowResult: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 50,
  },
  workflowResultText: {
    fontSize: 14,
    color: '#333',
  },
});
