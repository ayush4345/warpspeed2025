import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { getIconForProvider } from "../lib/utils/helpers";
import { styles } from "../styles";
import { WorkflowStepData } from "./BottomDrawer";

export interface CardProps {
  title: string;
  subtitle: string;
  avatarUrl: string;
  steps: WorkflowStepData[];
  stepCount: number;
  triggeredBy?: string;
  updatedAt?: string;
  status?: string;
  onViewDetail: () => void;
  onYesPress?: () => void;
  onNoPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  avatarUrl,
  steps,
  stepCount,
  triggeredBy,
  updatedAt,
  status = '',
  onViewDetail,
  onYesPress,
  onNoPress,
}) => {
  return (
    <View style={styles.card}>
      {/* First line: Avatar and time */}
      <View style={styles.cardFirstLine}>
        <Image
          source={getIconForProvider(triggeredBy || "")}
          style={styles.stepIcon}
          resizeMode="contain"
        />
        <Text style={styles.timeText}>{updatedAt}</Text>
      </View>

      {/* Second line: Title and description */}
      <View style={styles.cardTitleContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      {/* Footer: Member count and View Detail button */}
      <View style={styles.cardFooter}>
        <View style={styles.memberContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={[styles.memberAvatars, { marginLeft: index * -25 }]}>
              <Image
                source={getIconForProvider(step.provider)}
                style={styles.memberAvatar}
                resizeMode="contain"
              />
            </View>
          ))}
          <Text style={styles.memberCount}>
            {stepCount} step{stepCount !== 1 ? "s" : ""}
          </Text>
        </View>

        {status?.toLowerCase() === 'pending' ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.yesButton]}
              onPress={onYesPress}
            >
              <Text style={styles.actionButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.noButton]}
              onPress={onNoPress}
            >
              <Text style={styles.actionButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.viewDetailButton}
            onPress={onViewDetail}
          >
            <Text style={styles.viewDetailText}>View Detail</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default Card;
