import { Workflow } from '../components/BottomDrawer';

// Define the structure of a task from Google Sheets
interface SheetTask {
  id: string;
  name: string;
  body: string;
  status: string;
  triggered_by: string;
  updated_at: string;
}

// Configuration for server API
const SERVER_API_URL = 'https://fancy-shoes-shake.loca.lt'; // Update with your actual server URL

/**
 * Fetch tasks from our server API which handles Google Sheets integration
 * This approach avoids the limitations of using Node.js libraries in React Native
 */
async function fetchTasksFromServerAPI(): Promise<SheetTask[]> {
  try {
    const response = await fetch(`${SERVER_API_URL}/api/tasks`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch tasks');
    }
    
    return result.tasks;
  } catch (error) {
    console.error('Error fetching tasks from server:', error);
    throw error;
  }
}

// Convert SheetTask to Workflow format
function convertSheetTasksToWorkflows(tasks: SheetTask[]): Workflow[] {
  return tasks.map(task => ({
    id: parseInt(task.id) || Math.floor(Math.random() * 10000),
    name: task.name || 'Untitled Task',
    body: task.body || 'No description',
    status: task.status || 'pending',
    triggered_by: task.triggered_by || 'google_sheets',
    updated_at: task.updated_at || new Date().toISOString()
  }));
}

// Mock data for development/testing
function getMockTasks(): Workflow[] {
  return [
    {
      id: 1001,
      name: 'Schedule doctor appointment',
      body: 'Call Dr. Smith to schedule annual checkup',
      status: 'pending',
      triggered_by: 'google_sheets',
      updated_at: new Date().toISOString()
    },
    {
      id: 1002,
      name: 'Pay electricity bill',
      body: 'Due on the 25th of this month',
      status: 'pending',
      triggered_by: 'google_sheets',
      updated_at: new Date().toISOString()
    },
    {
      id: 1003,
      name: 'Book flight tickets',
      body: 'For the conference next month',
      status: 'succeeded',
      triggered_by: 'google_sheets',
      updated_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 1004,
      name: 'Review project proposal',
      body: 'Send feedback to the team by Friday',
      status: 'succeeded',
      triggered_by: 'google_sheets',
      updated_at: new Date(Date.now() - 172800000).toISOString()
    }
  ];
}

// Main function to get tasks - will use the appropriate method based on environment
export async function getTasksFromGoogleSheets(): Promise<Workflow[]> {
  try {
    // Fetch tasks from our server API
    const sheetTasks = await fetchTasksFromServerAPI();
    return sheetTasks as unknown as Workflow[];
  } catch (error) {
    console.error('Failed to fetch tasks from server, falling back to mock data:', error);
    return getMockTasks();
  }
}
