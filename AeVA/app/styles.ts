import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  containerWithOverlay: {
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
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
    borderRadius: 12,
    padding: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  memberAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#e0e0e0',
  },
  memberCount: {
    marginLeft: 1,
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
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#4CAF50',
  },
  noButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
    height: '80%',
    maxHeight: '80%',
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
  drawerScrollView: {
    flex: 1,
  },
  drawerContent: {
    padding: 20,
    paddingBottom: 40,
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
    marginVertical: 20,
    textAlign: 'center',
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
    marginBottom: 14,
    lineHeight: 22,
    fontWeight: '600',
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
  workflowStep: {
    flexDirection: 'row',
    marginBottom: 20,
    position: 'relative',
  },
  workflowIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  workflowIcon: {
    fontSize: 24,
  },
  checkmarkContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workflowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  workflowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workflowDescription: {
    fontSize: 14,
    color: '#666',
  },
  workflowConnector: {
    position: 'absolute',
    left: 25,
    top: 50,
    width: 1.5,
    height: 30,
    backgroundColor: '#888',
  },
  workflowResult: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    marginLeft: 50,
  },
  workflowResultText: {
    fontSize: 14,
    color: '#333',
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  stepIcon: {
    width: 30,
    height: 30,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepTool: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  digestButton: {
    backgroundColor: '#e8f0fe',
  },
});

export default styles;
