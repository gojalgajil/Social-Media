import { WebSocketServer, WebSocket } from 'ws';

let wss: WebSocketServer | null = null;

export const setWss = (_wss: WebSocketServer) => {
  wss = _wss;
};

export const broadcast = (data: any) => {
  if (!wss) return;

  const message = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

// Broadcast specific event types with data
export const broadcastNewThread = (threadData: any) => {
  console.log('Broadcasting new thread:', threadData);
  broadcast({
    type: 'new_thread',
    data: threadData
  });
};

export const broadcastNewReply = (replyData: any) => {
  broadcast({
    type: 'NEW_REPLY',
    data: replyData
  });
};

export const broadcastLikeUpdate = (updateData: any) => {
  broadcast({
    type: 'LIKE_UPDATE',
    data: updateData
  });
};
