import { store } from '../../redux';

let socket: WebSocket | null = null;

export const connectSocket = (token: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket('ws://localhost:3002');

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
    // Send authentication token after a short delay to ensure connection is stable
    setTimeout(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'auth', token }));
      }
    }, 100);
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

  socket.onerror = (error) => {
    console.error('WebSocket connection error:', error);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);

      // Handle real-time updates here
      handleRealTimeUpdate(data);
    } catch (error) {
      console.log('Received WebSocket message (raw):', event.data);
      // Try to parse as raw message if JSON parsing fails
      try {
        const rawData = JSON.parse(event.data);
        console.log('🧵 Processing raw new_thread message:', rawData);
        handleRealTimeUpdate(rawData);
      } catch (rawError) {
        console.log('Failed to parse raw message:', rawError);
      }
    }
  };

  return socket;
};

// Function to handle real-time updates
const handleRealTimeUpdate = (data: any) => {
  console.log('📨 Handling real-time update:', data);

  switch (data.type) {
    case 'new_thread':
      console.log('🧵 Adding new thread to Redux store:', data.thread || data.data);
      const threadData = data.thread || data.data;
      // Add new thread to the store
      store.dispatch({
        type: 'threads/addThread',
        payload: {
          ...threadData,
          likesCount: 0,
          isLiked: false,
        }
      });
      break;

    case 'new_reply':
      console.log('💬 Updating reply count for thread:', data.data.thread_id);
      // Update the thread's reply count
      store.dispatch({
        type: 'threads/updateThread',
        payload: {
          id: data.data.thread_id,
          number_of_replies: data.data.thread_replies_count || 0
        }
      });
      break;

    case 'like_update':
      console.log('❤️ Like update received:', data);
      // Update the likes count for the thread
      store.dispatch({
        type: 'threads/updateThread',
        payload: { id: data.threadId, likesCount: data.likesCount }
      });

      // Update isLiked if it's the current user who performed the action
      const state = store.getState();
      const currentUserId = state.user.currentUser?.id;
      if (currentUserId && data.userId === currentUserId) {
        store.dispatch({
          type: 'threads/updateThreadLikeStatus',
          payload: { id: data.threadId, isLiked: data.liked, likesCount: data.likesCount }
        });
      }

      // If there's a global callback for like update (e.g., for Status page)
      if ((window as any).likeUpdateCallback) {
        (window as any).likeUpdateCallback(data);
      }
      break;

    default:
      console.log('❓ Unhandled WebSocket message type:', data.type);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};
