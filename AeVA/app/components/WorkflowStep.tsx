import React from 'react';
import { View, Text, Image } from 'react-native';
import { getIconForProvider } from '../lib/utils/helpers';
import { styles } from '../styles';

export interface WorkflowStepProps {
  name: string;
  description: string;
  provider: string;
  tool: string;
  completed?: boolean;
  isLast?: boolean;
}

// Workflow Step Component
export const WorkflowStep: React.FC<WorkflowStepProps> = ({ 
  name, 
  description, 
  provider, 
  tool, 
  isLast = false 
}) => {
  return (
    <View style={styles.workflowStep}>
      <View style={styles.stepIconContainer}>
        <Image 
          source={getIconForProvider(provider || '')}
          style={styles.stepIcon}
          resizeMode="contain"
        />
        {!isLast && <View style={styles.workflowConnector} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepName}>{name}</Text>
        {tool && <Text style={styles.stepTool}>Tool: {tool}</Text>}
      </View>
    </View>
  );
};

export default WorkflowStep;