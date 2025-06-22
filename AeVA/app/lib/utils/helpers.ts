/**
 * Helper functions for the AeVA app
 */

// Format date in '21st May, 12:34 PM' format
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Add ordinal suffix to day
  const ordinalSuffix = getOrdinalSuffix(day);
  
  return `${day}${ordinalSuffix} ${month}, ${time}`;
}

// Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
export function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Get icon for provider
export function getIconForProvider(tool: string): any {
  // Convert tool name to lowercase for case-insensitive matching
  const toolLower = tool?.toLowerCase() || '';
  
  // Static mapping of tool names to icon resources
  // React Native requires static strings in require statements
  const iconMapping: {[key: string]: any} = {
    // Direct mappings
    'calendar': require('../../../assets/icons/calendar.png'),
    'discord': require('../../../assets/icons/discord.png'),
    'docs': require('../../../assets/icons/docs.png'),
    'drive': require('../../../assets/icons/drive.png'),
    'dropbox': require('../../../assets/icons/dropbox.png'),
    'github': require('../../../assets/icons/github.png'),
    'gmail': require('../../../assets/icons/gmail.png'),
    'google': require('../../../assets/icons/google.png'),
    'slack': require('../../../assets/icons/slack.png'),
    'twitter': require('../../../assets/icons/twitter.png'),
    'telegram': require('../../../assets/icons/telegram.png'),
    'x': require('../../../assets/icons/x.png'),
    
    // Aliases
    'mail': require('../../../assets/icons/gmail.png'),
    'email': require('../../../assets/icons/gmail.png'),
    'chart': require('../../../assets/icons/google.png'),
    'quickchart': require('../../../assets/icons/google.png'),
    'tweet': require('../../../assets/icons/twitter.png'),
    'git': require('../../../assets/icons/github.png'),
    'chat': require('../../../assets/icons/slack.png'),
    'message': require('../../../assets/icons/slack.png'),
    'document': require('../../../assets/icons/docs.png'),
    'storage': require('../../../assets/icons/drive.png'),
  };
  
  // Return the mapped icon or default to Google icon
  return iconMapping[toolLower] || require('../../../assets/icons/google.png');
}
