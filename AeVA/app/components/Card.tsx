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
  onViewDetail: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  avatarUrl,
  steps,
  stepCount,
  triggeredBy,
  updatedAt,
  onViewDetail,
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
            <View style={[styles.memberAvatars, { marginLeft: index * -25 }]}>
              <Image
                key={index}
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

export default Card;
