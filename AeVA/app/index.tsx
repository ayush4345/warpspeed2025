import React, { useState, useEffect, useMemo } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, registerDeviceWithServer } from "./lib/notifications";
import { useRouter } from 'expo-router';
import { fetchData } from './lib/supabase';
import { getTasksFromGoogleSheets } from './lib/googleSheets';
import Ionicons from '@expo/vector-icons/Ionicons';

// Import refactored components
import { Card } from './components/Card';
import { BottomDrawer, Workflow, WorkflowStepData } from './components/BottomDrawer';

// Import styles
import { styles } from './styles';

// Import utility functions from the helpers file
import { formatDate } from './lib/utils/helpers';

interface IndexProps {}

// Use the Workflow interface from BottomDrawer component

const Index: React.FC<IndexProps> = () => {
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Workflow | null>(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSteps, setLoadingSteps] = useState(false);
  const [loadingSheetTasks, setLoadingSheetTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepsError, setStepsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'succeeded'>('pending');

  // Fetch workflows data from Supabase and Google Sheets
  useEffect(() => {
    async function fetchAllData() {
      try {
        setLoading(true);
        setLoadingSheetTasks(true);
        
        // Fetch workflows from Supabase
        const supabaseData = await fetchData<Workflow>('Workflow', {
          columns: '*',
          order: { column: 'updated_at', ascending: false },
          limit: 20
        });
        
        // Fetch tasks from Google Sheets
        const sheetTasks = await getTasksFromGoogleSheets(); // Fetch from server API
        
        // Combine both data sources
        const combinedData = [...(supabaseData || []), ...sheetTasks];
        
        setWorkflows(combinedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load workflows and tasks');
      } finally {
        setLoading(false);
        setLoadingSheetTasks(false);
      }
    }

    fetchAllData();
  }, []);

  // Fetch workflow steps when a workflow is selected
  const fetchWorkflowSteps = async (workflowId: number) => {
    try {
      setLoadingSteps(true);
      setStepsError(null);
      
      const steps = await fetchData<WorkflowStepData>('WorkflowStep', {
        columns: '*',
        filter: [{ column: 'workflow_id', operator: 'eq', value: workflowId }],
        order: { column: 'position', ascending: true }
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

  const handleYesPress = (workflow: Workflow) => {
    // Mark workflow as succeeded
    const updatedWorkflows = workflows.map(w => {
      if (w.id === workflow.id) {
        return { ...w, status: 'succeeded' };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);
    
    // Here you would typically make an API call to update the status in your database
    // For example: updateWorkflowStatus(workflow.id, 'succeeded');
    
    // Show a success message
    Alert.alert('Success', `Task "${workflow.name}" marked as completed`);
    
    // If we're currently in the pending tab, we can switch to succeeded tab to see the moved card
    if (activeTab === 'pending') {
      // Uncomment the next line if you want to automatically switch to the succeeded tab
      // setActiveTab('succeeded');
    }
  };

  const handleNoPress = (workflow: Workflow) => {
    // You could implement different logic for declining a task
    // For example, you might want to mark it as 'rejected' instead of keeping it as 'pending'
    
    // For now, just show a message
    Alert.alert('Task Declined', `You declined the task "${workflow.name}"`);
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const navigateToDailyDigest = () => {
    router.push('/daily-digest');
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

  // Determine if a workflow is completed (all steps completed) or pending
  const isWorkflowCompleted = workflows.filter((workflow: Workflow) => workflow.status === 'succeeded');

  // Filter workflows based on active tab
  const filteredWorkflows = useMemo(() => {
    if (workflows.length === 0) return [];
    
    return workflows.filter(workflow => workflow.status.toLowerCase() === activeTab.toLowerCase());
  }, [workflows, activeTab]);

  return (
    <View style={[styles.container, drawerVisible && styles.containerWithOverlay]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Agent Inbox</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              onPress={navigateToDailyDigest}
              style={[styles.headerButton, styles.digestButton]}
            >
              <Ionicons name="headset" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={navigateToSettings}
              style={styles.headerButton}
            >
              <Ionicons name="settings" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={tabStyles.tabContainer}>
          <TouchableOpacity 
            style={[
              tabStyles.tab, 
              activeTab === 'pending' && tabStyles.pendingTab
            ]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[
              tabStyles.tabText, 
              activeTab === 'pending' && tabStyles.activeTabText
            ]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              tabStyles.tab, 
              activeTab === 'succeeded' && tabStyles.succeededTab
            ]}
            onPress={() => setActiveTab('succeeded')}
          >
            <Text style={[
              tabStyles.tabText, 
              activeTab === 'succeeded' && tabStyles.activeTabText
            ]}>Succeeded</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#808080" />
            <Text style={styles.loadingText}>Loading workflows and tasks...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredWorkflows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} workflows or tasks found</Text>
          </View>
        ) : (
          filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              title={workflow.name}
              subtitle={workflow.body && workflow.body.length > 90 ? `${workflow.body.substring(0, 90)}...` : workflow.body}
              steps={workflowSteps.filter(step => step.workflow_id === workflow.id)}
              avatarUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(workflow.name)}&background=random`}
              stepCount={workflowSteps.filter(step => step.workflow_id === workflow.id).length}
              triggeredBy={workflow.triggered_by}
              updatedAt={formatDate(new Date(workflow.updated_at))}
              status={workflow.status}
              onViewDetail={() => handleViewDetail(workflow)}
              onYesPress={() => handleYesPress(workflow)}
              onNoPress={() => handleNoPress(workflow)}
            />
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/voice-input')}
      >
        <Ionicons name="mic" size={24} color="white" />
      </TouchableOpacity>

      <BottomDrawer 
        isVisible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        cardData={selectedCard || undefined}
        workflowSteps={workflowSteps}
        loadingSteps={loadingSteps}
        stepsError={stepsError}
      />
    </View>
  );
}

// Tab styles
const tabStyles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 0,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#f5f5f5',
  },
  pendingTab: {
    backgroundColor: '#808080', // Grey color for pending
  },
  succeededTab: {
    backgroundColor: '#808080', // Green color for succeeded
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
});

export default Index;


