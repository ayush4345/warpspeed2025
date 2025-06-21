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
import { registerForPushNotificationsAsync, sendPushNotification, registerDeviceWithServer } from "./lib/notifications";

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
  cardData: {
    title: string;
    subtitle: string;
    avatarUrl: string;
    memberCount: number;
    gameType?: string;
    leagueType?: string;
  } | null;
}

const BottomDrawer: React.FC<BottomDrawerProps> = ({ isVisible, onClose, cardData }) => {
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
          <View style={styles.drawerContent}>
            <Image 
              source={{ uri: cardData.avatarUrl }} 
              style={styles.drawerAvatar} 
            />
            <Text style={styles.drawerTitle}>{cardData.title}</Text>
            <Text style={styles.drawerSubtitle}>{cardData.subtitle}</Text>
            
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>Details</Text>
              <Text style={styles.drawerText}>Members: {cardData.memberCount}</Text>
              {cardData.gameType && <Text style={styles.drawerText}>Type: {cardData.gameType}</Text>}
              {cardData.leagueType && <Text style={styles.drawerText}>League: {cardData.leagueType}</Text>}
            </View>
            
            <View style={styles.drawerSection}>
              <Text style={styles.drawerSectionTitle}>Description</Text>
              <Text style={styles.drawerText}>
                This is additional information about this activity. You can add more details here
                about what this activity involves, when it takes place, and other relevant information.
              </Text>
            </View>
            
            <TouchableOpacity style={styles.drawerButton}>
              <Text style={styles.drawerButtonText}>Join Activity</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const Index: React.FC<IndexProps> = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<Notifications.Notification | false>(false);

  // Sample data for cards
  const cards = [
    {
      title: 'My first league',
      subtitle: 'You can create your first league here',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      memberCount: 12,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'Fantasy Football',
      subtitle: 'Join the fantasy football league',
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      memberCount: 8,
      gameType: 'Game pick',
      leagueType: 'Standard'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    },
    {
      title: 'NBA Champions',
      subtitle: 'Predict the next NBA champion',
      avatarUrl: 'https://randomuser.me/api/portraits/men/3.jpg',
      memberCount: 15,
      gameType: 'Game pick',
      leagueType: 'Dynasty'
    }
  ];

  const handleViewDetail = (card: any) => {
    setSelectedCard(card);
    setDrawerVisible(true);
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
        <Text style={styles.headerText}>Leagues</Text>
        <View style={{ padding: 20 }}>
          <Text>Your Expo Push Token:</Text>
          <Text selectable>{expoPushToken}</Text>
          {notification && (
            <View>
              <Text>Title: {notification.request.content.title}</Text>
              <Text>Body: {notification.request.content.body}</Text>
              <Text>Data: {JSON.stringify(notification.request.content.data)}</Text>
            </View>
          )}
          <Button
            title="Send Test Notification"
            onPress={async () => {
              await sendPushNotification(expoPushToken);
            }}
          />
        </View>
        {cards.map((card, index) => (
          <Card
            key={index}
            title={card.title}
            subtitle={card.subtitle}
            avatarUrl={card.avatarUrl}
            memberCount={card.memberCount}
            gameType={card.gameType}
            leagueType={card.leagueType}
            onViewDetail={() => handleViewDetail(card)}
          />
        ))}
      </ScrollView>

      <BottomDrawer 
        isVisible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        cardData={selectedCard}
      />
    </View>
  );
}

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerWithOverlay: {
    backgroundColor: 'rgba(0, 0, 0)',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 40,
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
    height: '70%',
    paddingBottom: 20,
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
  drawerContent: {
    padding: 20,
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
});
