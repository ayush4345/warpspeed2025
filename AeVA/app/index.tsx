import React, { useState, useEffect, useMemo } from 'react';
import { 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, registerDeviceWithServer } from "./lib/notifications";
import { useRouter } from 'expo-router';
import { fetchData } from './lib/supabase';
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
  const [error, setError] = useState<string | null>(null);
  const [stepsError, setStepsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'succeeded'>('pending');

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
          <TouchableOpacity onPress={navigateToSettings}>
            <View style={styles.settingsIcon}>
              <Text style={styles.settingsIconText}><Ionicons name="settings" size={24} color="black" /></Text>
            </View>
          </TouchableOpacity>
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
            <Text style={styles.loadingText}>Loading workflows...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredWorkflows.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab} workflows found</Text>
          </View>
        ) : (
          filteredWorkflows.map((workflow) => (
            <Card
              key={workflow.id}
              title={workflow.name}
              subtitle={workflow.body}
              steps={workflowSteps.filter(step => step.workflow_id === workflow.id)}
              avatarUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(workflow.name)}&background=random`}
              stepCount={workflowSteps.filter(step => step.workflow_id === workflow.id).length}
              triggeredBy={workflow.triggered_by}
              updatedAt={formatDate(new Date(workflow.updated_at))}
              onViewDetail={() => handleViewDetail(workflow)}
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


