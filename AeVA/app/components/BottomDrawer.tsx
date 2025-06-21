import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  PanResponder,
  ScrollView,
  Dimensions
} from 'react-native';
import { WorkflowStep } from './WorkflowStep';
import { styles } from '../styles';

export interface Workflow {
  id: number;
  name: string;
  description: string;
  triggered_by: string;
  updated_at: string;
}

export interface WorkflowStepData {
  id: number;
  workflow_id: number;
  name: string;
  description: string;
  provider: string;
  tool: string;
  position: number;
  completed: boolean;
}

export interface BottomDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  cardData?: Workflow;
  workflowSteps: WorkflowStepData[];
  loadingSteps: boolean;
  stepsError: string | null;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({ 
  isVisible, 
  onClose, 
  cardData, 
  workflowSteps, 
  loadingSteps, 
  stepsError 
}) => {
  const closeAnim = useRef(new Animated.Value(0)).current;
  const { height } = Dimensions.get('window');
  
  useEffect(() => {
    if (isVisible) {
      Animated.timing(closeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);
  
  const closeDrawer = () => {
    Animated.timing(closeAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => onClose());
  };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          closeAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          closeDrawer();
        } else {
          Animated.spring(closeAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;
  
  return (
    <Modal visible={isVisible} transparent statusBarTranslucent animationType="fade" onRequestClose={() => closeDrawer()}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.background} activeOpacity={1} onPress={closeDrawer} />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: closeAnim }],
            },
          ]}
        >
          <View {...panResponder.panHandlers}>
            <View style={styles.drawerHandle} />
          </View>
          
          <ScrollView style={styles.drawerScrollView}>
            <View style={styles.drawerContent}>
              {cardData && (
                <>
                  <Text style={styles.drawerTitle}>{cardData.name}</Text>
                  <Text style={styles.drawerSubtitle}>{cardData.description}</Text>
                </>
              )}
              
              <View style={styles.drawerSection}>                
                {loadingSteps ? (
                  <Text style={styles.drawerText}>Loading steps...</Text>
                ) : stepsError ? (
                  <Text style={styles.drawerText}>Error: {stepsError}</Text>
                ) : workflowSteps.length === 0 ? (
                  <Text style={styles.drawerText}>No steps found for this workflow</Text>
                ) : (
                  workflowSteps.map((step, index) => (
                    <WorkflowStep
                      key={step.id}
                      name={step.name}
                      description={step.description}
                      provider={step.provider}
                      tool={step.tool}
                      completed={step.completed}
                      isLast={index === workflowSteps.length - 1}
                    />
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomDrawer;