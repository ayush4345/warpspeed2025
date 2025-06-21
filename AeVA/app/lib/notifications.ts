import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true, // Required for iOS
    shouldShowList: true, // Required for iOS
  }),
});

export async function sendPushNotification(expoPushToken: string) {
  // IMPORTANT: Replace with your server's IP address.
  // On a real device, this should be your computer's IP on the local network.
  const serverUrl = 'http://192.168.1.10:3000/send-push'; 
  console.log(`Sending notification request to ${serverUrl} for token: ${expoPushToken}`);
  
  try {
    await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // body can be empty if server knows the token
    });
    console.log('Request to send push notification sent.');
  } catch (e) {
    console.error('Failed to send push notification request', e);
  }
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      alert('Project ID not found. Please check your app config.');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}

export async function registerDeviceWithServer(token: string) {
    // IMPORTANT: Replace with your server's IP address.
    // On a real device, this should be your computer's IP on the local network.
    const serverUrl = 'http://192.168.1.10:3000/register';
    try {
        await fetch(serverUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });
        console.log("Token registered with server successfully.");
    } catch (e) {
        console.error("Error registering token with server", e)
    }
} 